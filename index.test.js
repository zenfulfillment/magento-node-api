const nock = require('nock');
const assert = require('assert');
const MagentoAPI = require('./');

const shop = nock(/your-magento-shop-url\.com/);
const fakeSessionId = '21b460beba46a52995b2eda22759bfd3';

describe('MagentoAPI', () => {
  it('should call login method and return magento sessionId', async () => {
    shop
      .post('/index.php/api/xmlrpc')
      .reply(200, getSessionIdResponse());

    const magento = new MagentoAPI({
      host: 'your-magento-shop-url.com',
      login: 'soap-user',
      pass: 'soap-password'
    });

    const sessionId = await magento.login();
    assert.equal(sessionId, fakeSessionId);
  });
});

function getSessionIdResponse() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
    <params>
        <param>
            <value>
                <string>${fakeSessionId}</string>
            </value>
        </param>
    </params>
</methodResponse>`;
}
