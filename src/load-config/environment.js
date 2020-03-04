'use strict';

const other = require('./other');

const env = process.env.TM_ENV
  ? process.env.TM_ENV
  : process.env.NODE_ENV
  ? process.env.NODE_ENV
  : 'development';

const environment = config => {
  let _environment = {};
  if (config && typeof config === 'object') {
    const env_config = config[env];
    if (env_config && typeof env_config === 'object') {
      Object.keys(env_config).forEach(key => {
        switch (key) {
          case 'updateURL':
          case 'downloadURL':
            if (typeof env_config[key] === 'string') break;
          case 'include':
          case 'exclude':
          case 'require':
          case 'resource':
          case 'connect':
            if (Array.isArray(env_config[key])) break;
          default:
            return;
        }
        _environment[key] = env_config[key];
      });
      _environment = { ..._environment, ...other(env_config.other) };
    }
  }

  return _environment;
};

module.exports = environment;

// console.log(environment({}));
// console.log(environment({ development: { version: '1.0.0' } }));
// console.log(
//   environment({
//     development: {
//       version: '1.0.0',
//       baseURL: 'baseurl',
//       downloadURL: 'downloadURL'
//     }
//   })
// );
// console.log(
//   environment({
//     development: {
//       version: '1.0.0',
//       downloadURL: 'downloadURL',
//       connect: []
//     }
//   })
// );
// console.log(
//   environment({
//     development: {
//       version: '1.0.0',
//       updateURL: 'updateurl',
//       downloadURL: 'downloadURL',
//       connect: [],
//       match: [],
//       test: '',
//       other: {
//         baseURL: 'baseurl'
//       }
//     }
//   })
// );
