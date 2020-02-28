const fs = require('fs');
const { genMeta, envFileName, resolveApp } = require('./build-meta');

const config = resolveApp('.tampermonkey-config.js');

module.exports = function(bundler) {
  if (!fs.existsSync(config)) {
    console.error(config, 'is not exists!');
    throw Error(`${config} is not exists!`);
  }

  console.log(bundler.entryAsset);

  const headers = genMeta(config);
  fs.writeFileSync(resolveApp(`dist/${envFileName}`), headers);
};
