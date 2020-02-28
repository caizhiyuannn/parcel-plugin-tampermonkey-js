const path = require('path');
const fs = require('fs');
// const config = require('./config');

const KEYWORDS = [
  'name',
  'namespace',
  'version',
  'author',
  'description',
  'homepage',
  'homepageURL',
  'website',
  'source',
  'icon',
  'iconURL',
  'defaulticon',
  'icon64',
  'icon64URL',
  'updateURL',
  'downloadURL',
  'supportURL',
  'include',
  'match',
  'exclude',
  'require',
  'resource',
  'connect',
  'run-at',
  'grant',
  'noframes',
  'unwrap',
  'nocompat'
];

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const isEnvDevelopment = process.env.TM_ENV === 'development';

const envFileName = config =>
  isEnvDevelopment ? `${config.name}-dev.user.js` : `${config.name}-prod.user.js`;

// console.log(envConf);

const appHeaders = (meta, value) =>
  `
// @${meta}     ${value}
`.trimLeft();

const parseArray = (mata, value, prefix = '', suffixParms = '') => {
  if (Array.isArray(value)) {
    const headers = value.reduce(
      (arr, cur) => arr + appHeaders(mata, prefix + cur + suffixParms),
      ''
    );
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
      if (!KEYWORDS.includes(conf)) continue;
      const element = config[conf];
      if (Array.isArray(element)) {
        headers += parseArray(conf, element);
      } else {
        headers += appHeaders(conf, element);
      }
    }
    if (envConf.hasOwnProperty(conf)) {
      const suffixParms = conf === 'require' ? envConf['suffixParms'] : '';
      const prefix = conf === 'require' ? envConf['baseURL'] : '';
      const element = envConf[conf];
      if (Array.isArray(element)) {
        headers += parseArray(conf, element, prefix, suffixParms);
      } else {
        headers += appHeaders(conf, element);
      }
    }
  }
  // console.log(headers);
  return headers;
}

module.exports = {
  envFileName,
  resolveApp,
  isEnvDevelopment,
  genMeta
};
