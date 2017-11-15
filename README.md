# magento-node-api

> Magento API client for nodejs

## Usage

```js
const MagentoAPI = require('magento-node-api');

const magento = new MagentoAPI({
  host: 'your-magento-shop-url.com',
  login: 'soap-user',
  pass: 'soap-password'
});

// List orders
magento.init()
  .then(() => this.magento.sales_order.list())
  .then((orders) => console.log(orders));

// With params
const params = {updated_at: {from: new Date('2017-11-10')}};
magento.init()
  .then(() => this.magento.sales_order.list(params))
  .then((orders) => console.log(orders));
```
