const fs = require('fs');
const path = require('path');
const {
  genMeta,
  envFileName,
  isEnvDevelopment,
  resolveApp
} = require('./build-meta');
const conf_path = resolveApp('.tampermonkey-config.js');

module.exports = function(bundler) {
  if (!fs.existsSync(conf_path)) {
    throw Error(`${conf_path} is not exists!`);
  }
  const config = require(conf_path);

  const feedRequireValue = (bundle, requireValue, publicURL) => {
    let name = path.join(publicURL, path.basename(bundle.name));

    const input = bundle.entryAsset
      ? bundle.entryAsset.relativeName
      : bundle.assets.size
      ? bundle.assets.values().next().value.relativeName
      : null;

    if (input && !requireValue.get(input)) {
      requireValue.set(input, name);
      console.info(`bundle: ${input} => ${name}`);
    }

    bundle.childBundles.forEach(bundle => {
      feedRequireValue(bundle, requireValue, publicURL);
    });
  };
  function entryPointHandler(bundle) {
    const dir = path.basename(bundler.options.outDir);
    const publicURL = bundler.options.publicURL;

    const requirePath = resolveApp(`${dir}/${envFileName(config)}`);
    const requireValue = new Map();

    console.info('📦PackageRequirePlugin');
    feedRequireValue(bundle, requireValue, publicURL);
    console.info(`require value: ${dir}/${envFileName(config)}`);

    const envConf = isEnvDevelopment
      ? config.configurations.development
      : config.configurations.production;

    if (!envConf.require) {
      envConf['require'] = Array.from(requireValue.values());
    } else {
      envConf.require = [
        ...envConf.require,
        ...Array.from(requireValue.values())
      ];
    }

    const headers = `// ==UserScript==\n${genMeta(
      config
    ).trim()}\n// ==/UserScript==\n`.trimLeft();

    fs.writeFileSync(requirePath, headers);
  }
  bundler.on('bundled', bundle => {
    bundler.options.entryFiles.length > 1
      ? bundle.childBundles.forEach(entryPointHandler)
      : entryPointHandler(bundle);
    // console.log(bundler.entryAsset.bundles);
  });
  if (bundler.options.watch && isEnvDevelopment) {
    bundler.serve();
  }
};
