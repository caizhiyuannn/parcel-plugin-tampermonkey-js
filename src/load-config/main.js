'use strict';
const deepmerge = require('deepmerge');
const environment = require('./environment');

const main = config => {
  let _main = {};
  if (config && typeof config === 'object' && !Array.isArray(config)) {
    Object.keys(config).forEach(key => {
      switch (key) {
        case 'name':
        case 'version':
        case 'author':
        case 'description':
        case 'homepage':
        case 'homepageURL':
        case 'website':
        case 'source':
        case 'icon':
        case 'iconURL':
        case 'defaulticon':
        case 'updateURL':
        case 'downloadURL':
        case 'run-at':
        case 'nocompat':
          if (typeof config[key] === 'string') break;
        case 'include':
        case 'exclude':
        case 'match':
        case 'require':
        case 'resource':
        case 'connect':
        case 'grant':
          if (Array.isArray(config[key])) break;
        case 'noframes':
        case 'unwrap':
          if (typeof config[key] === 'boolean') break;
        default:
          return;
      }
      _main[key] = config[key];
    });
    _main = deepmerge(_main, environment(config.environment));
  }
  return _main;
};

module.exports = main;
