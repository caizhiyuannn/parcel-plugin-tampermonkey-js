const fs = require('fs');
const path = require('path');
const deepMerge = require('deepmerge');
const {
  genMeta,
  envFileName,
  isEnvDevelopment,
  resolveApp
} = require('./build-meta');
const loadconfig = require('./load-config');

const combineMerge = (target, source, options) => {
  const destination = target.slice();

  source.forEach((item, index) => {
    if (typeof destination[index] === 'undefined') {
      destination[index] = options.cloneUnlessOtherwiseSpecified(item, options);
    } else if (options.isMergeableObject(item)) {
      destination[index] = merge(target[index], item, options);
    } else if (target.indexOf(item) === -1) {
      destination.push(item);
    }
  });
  return destination;
};

module.exports = function(bundler) {
  let config = loadconfig.sync(process.cwd());

  const feedRequireValue = (bundle, requireValue, publicURL) => {
    let assetsMap = new Map();
    switch (bundle.type) {
      case 'js':
        assetsMap = requireValue.require;
        break;
      case 'css':
        assetsMap = requireValue.resource;
        break;
      default:
        break;
    }
    let name = path.join(publicURL, path.basename(bundle.name));

    const input = bundle.entryAsset
      ? bundle.entryAsset.relativeName
      : bundle.assets.size
      ? bundle.assets.values().next().value.relativeName
      : null;

    if (input && !assetsMap.get(input)) {
      assetsMap.set(input, name);
      console.info(`bundle: ${input} => ${name}`);
    }

    bundle.childBundles.forEach(bundle => {
      feedRequireValue(bundle, requireValue, publicURL);
    });
  };
  function entryPointHandler(bundle) {
    const dir = path.basename(bundler.options.outDir);
    const publicURL = bundler.options.publicURL;
    const protocol = bundler.options.https ? 'https' : 'http';
    const port = bundler.server ? bundler.server.address().port : 0;
    const host = bundler.options.hmrHostname
      ? bundler.options.hmrHostname
      : 'localhost';

    const requirePath = resolveApp(`${dir}/${envFileName(config)}`);
    const requireValue = {
      require: new Map(),
      resource: new Map()
    };
    const assetsRequireConfig = { require: [], resource: [], grant: [] };

    const combineURL = name => {
      const prefix = isEnvDevelopment
        ? `${protocol}://${host}:${port}`
        : config.baseURL;
      const params = isEnvDevelopment ? '' : config.params;
      return `${prefix}${name}${params}`;
    };

    console.info('📦PackageRequirePlugin');
    feedRequireValue(bundle, requireValue, publicURL);
    console.info(`require value: ${dir}/${envFileName(config)}`);

    for (const assetsType in requireValue) {
      if (requireValue.hasOwnProperty(assetsType)) {
        const element = requireValue[assetsType];
        assetsRequireConfig[assetsType] = Array.from(element.values()).map(
          value => `${combineURL(value)}`
        );
      }
    }
    assetsRequireConfig.grant =
      assetsRequireConfig.resource.length !== 0
        ? ['GM_addStyle', 'GM_getResourceText']
        : [];

    config = deepMerge(config, assetsRequireConfig, {
      arrayMerge: combineMerge
    });
    // console.log(config);

    const headers = genMeta(config);

    fs.writeFileSync(requirePath, headers);
  }
  bundler.on('bundled', bundle => {
    bundler.options.entryFiles.length > 1
      ? bundle.childBundles.forEach(entryPointHandler)
      : entryPointHandler(bundle);
    // console.log(bundler.entryAsset.bundles);
  });
  if (bundler.options.watch && isEnvDevelopment && !bundler.server) {
    bundler.serve();
  }
};
