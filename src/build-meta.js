const path = require('path');
const fs = require('fs');
// const config = require('./config');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const isEnvDevelopment = process.env.NODE_ENV === 'development';

const envFileName = isEnvDevelopment
  ? `${config.name}-dev.js`
  : `${config.name}-prod.js`;

// console.log(envConf);

const appHeaders = (meta, value) =>
  `
// @${meta}     ${value}
`.trimLeft();

const parseArray = (mata, value) => {
  if (Array.isArray(value)) {
    const headers = value.reduce((arr, cur) => arr + appHeaders(mata, cur), '');
    return headers;
  }
};

function genMeta(config) {
  let headers = '';

  const envConf = isEnvDevelopment
    ? config.configurations.development
    : config.configurations.production;

  for (const conf in config) {
    if (config.hasOwnProperty(conf)) {
      if (conf === 'configurations') continue;
      const element = config[conf];
      if (Array.isArray(element)) {
        headers += parseArray(conf, element);
      } else {
        headers += appHeaders(conf, JSON.stringify(element));
      }
    }
    if (envConf.hasOwnProperty(conf)) {
      const element = envConf[conf];
      if (Array.isArray(element)) {
        headers += parseArray(conf, element);
      } else {
        headers += appHeaders(conf, JSON.stringify(element));
      }
    }
  }
  console.log(headers);
}

module.exports = {
  envFileName,
  resolveApp,
  genMeta
};
