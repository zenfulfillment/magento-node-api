const xmlrpc = require('xmlrpc');
const url = require('url');

// Magento SOAP API docs can be found on the link below
// http://devdocs.magento.com/guides/m1x/api/soap/introduction.html
class MagentoAPI {
  constructor(config, options) {
    const defaults = {
      port: 80,
      path: '/index.php/api/xmlrpc'
    };
    const parsedUrl = url.parse(config.host || config.hostname);
    const parsedConfig = {
      host: parsedUrl.hostname || config.host,
      port: parsedUrl.port || config.port
    };

    const settings = Object.assign({}, defaults, config, parsedConfig, {
      isSecure: typeof config.isSecure !== 'undefined' ?
        config.isSecure :
        ((/s:$/).test(parsedUrl.protocol) || (/443/).test(parsedConfig.port))
    });

    this.options = Object.assign({verbose: false}, options);

    this.config = settings;

    this.magentoClient = this.config.isSecure ?
      xmlrpc.createSecureClient(this.config) :
      xmlrpc.createClient(this.config);

    this._initialized = false;
    this.sessionId = null;
  }

  init() {
    this._log('MagentoAPI.init() | Initializing magento api...');

    if (this._initialized) {
      this._log('MagentoAPI.init() | Already initialized');
      return Promise.resolve();
    }

    return this.login()
      .then(() => this._getResources())
      .then((resources) => this._constructApi(resources))
      .then((api) => Object.assign(this, api))
      .then(() => {
        this._initialized = true;
        this._log('MagentoAPI.init() | Initialized');
      });
  }

  login() {
    this._log('MagentoAPI.login() | Logging in...');

    if (this.sessionId) {
      this._log('MagentoAPI.login() | Already logged in');
      return Promise.resolve(this.sessionId);
    }

    return this._methodCall('login', [this.config.login, this.config.pass])
      .catch((err) => {
        this._log('MagentoAPI.login() | Error logging in', err);
        throw err;
      })
      .then((sessionId) => {
        this._log('MagentoAPI.login() | Login successful');
        this.sessionId = sessionId;
        return sessionId;
      });
  }

  logout() {
    this._log('MagentoAPI.logout() | Ending session...');
    return this._methodCall('endSession', [this.sessionId])
      .then(() => {
        this._log('MagentoAPI.logout() | Session ended');
        this.sessionId = null;
      });
  }

  getVersion() {
    return this.login()
      .then(() => this._methodCall('call', [this.sessionId, 'core_magento.info']));
  }

  _getResources() {
    return this._methodCall('resources', [this.sessionId]);
  }

  // Construct api object with methods
  _constructApi(resources) {
    return resources
      .reduce((api, resource) => {
        const methods = resource.methods.reduce((ms, method) =>
          Object.assign({}, ms, {[method.name]: (...args) => this._call(method.path, args)})
        , {});
        return Object.assign({}, api, {[resource.name]: methods});
      }, {});
  }


  _methodCall(method, params) {
    return new Promise((resolve, reject) => {
      this.magentoClient.methodCall(method, params, (err, res) => (err ? reject(err) : resolve(res)));
    });
  }

  _call(api, args) {
    return this.login()
      .then(() => this._methodCall('call', [this.sessionId, api, args]))
      .catch((err) => {
        // try logging in again
        if (err.faultCode === 5 && this.sessionId) {
          this.sessionId = null;
          return this._call(api, args);
        }
        throw err;
      });
  }

  _log(...args) {
    if (this.options.verbose) {
      // eslint-disable-next-line
      console.log.apply(null, args);
    }
  }
}

module.exports = MagentoAPI;
