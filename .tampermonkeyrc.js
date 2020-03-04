module.exports = {
  name: 'example name',
  version: '1.0.0',
  description: 'example',
  author: 'user name',
  namespace: 'http://example.com',
  // 通用require， 如果需要区分prod or dev 环境， 单独配置到configrations
  match: ['*://example.com/*'],
  // 通用require， 如果需要区分prod or dev 环境， 单独配置到configrations
  connect: ['example.net', 'example.org'],
  // 通用require， 如果需要区分prod or dev 环境， 单独配置到configrations
  require: ['http://example.com/user.js'],
  grant: [
    'GM_getValue',
    'GM_setValue',
    'GM_notification',
    'GM_xmlhttpRequest',
    'GM_openInTab'
  ],
  environment: {
    // suport [match, require, updateURL, downloadURL, grant, connect, include, exclude]
    production: {
      // option: auto gen require prod: http://example.com/dist/[assets].js?token=password1234
      baseURL: 'http://example.com/dist',
      params: '?token=password1234'
    },
    development: {
      // assign local server address
    }
  }
};
