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
    const dir = bundler.options.outDir;
    const publicURL = bundler.options.publicURL;

    const requirePath = path.resolve(dir, 'parcel-test.js');
    const requireValue = new Map();

    console.info('📦PackageRequirePlugin');
    feedRequireValue(bundle, requireValue, publicURL);
    console.info(`require value: ${requirePath}`);

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

    const headers = genMeta(config);
    fs.writeFileSync(resolveApp(`dist/${envFileName(config)}`), headers);
  }
  bundler.on('bundled', bundle => {
    bundler.options.entryFiles.length > 1
      ? bundle.childBundles.forEach(entryPointHandler)
      : entryPointHandler(bundle);
    // console.log(bundler.entryAsset.bundles);
  });
};
