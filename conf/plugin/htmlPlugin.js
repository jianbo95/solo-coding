const assert = require("assert");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const TRIM_ARGS = [/^\.\//, /^\s*/, /\s*$/, /\/$/]

// clear path
function trim(path) {
  return TRIM_ARGS.reduce((ret, arg) => {
      ret = ret.replace(arg, '')
      return ret
  }, path)
}

function fixPath(assetPath, htmlPath) {
  let defaultPath = assetPath;
  assetPath = trim(assetPath)
  htmlPath = trim(htmlPath)

  //if asset is from cdn, ignore it
  if (assetPath.startsWith('//')) {
      return assetPath
  }

  if (assetPath.charAt(0) === '/') {
      assetPath = assetPath.substring(1)
  }

  let assetSegs = assetPath.split('/')
  const htmlSegs = htmlPath.split('/')

  let dupNum = 0
  for (let i = 0, len = htmlSegs.length; i < len; i++) {
      if (htmlSegs[i] === assetSegs[i]) {
          ++dupNum
      } else {
          break
      }
  }

  if (dupNum) {
      htmlSegs.splice(0, dupNum)
      assetSegs.splice(0, dupNum)
  }

  const htmlSize = htmlSegs.length

  // console.log('htmlSize:' + htmlSize + " assetPath:" + assetPath + " htmlPath:" + htmlPath);

  if (htmlSize == 1) {
    return defaultPath;
  }

  if (htmlSize > 1) {
      const lpad = new Array(htmlSize - 1)
      lpad.fill('..')
      assetSegs = [...lpad, ...assetSegs]
  }

  return assetSegs.join('/')
}


class HtmlWebpackProcessingPlugin {
  constructor(options) {
    assert.equal(
      options,
      undefined,
      "The HtmlWebpackProcessingPlugin does not accept any options"
    );
  }

  apply(compiler) {
    let self = this;

    compiler.hooks.compilation.tap(
      "HTMLWebpackProcessingPlugin",
      (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tap(
          "HTMLWebpackProcessingPlugin",
          (htmlPluginData, callback) => {
            self.preProcessing(htmlPluginData, callback);
          }
        );
      }
    );
    compiler.hooks.compilation.tap(
      "HTMLWebpackProcessingPlugin",
      (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(
          "HTMLWebpackProcessingPlugin",
          (htmlPluginData, callback) => {
            self.postProcessing(htmlPluginData, callback);
          }
        );
      }
    );

    compiler.hooks.compilation.tap(
      "HTMLWebpackProcessingPlugin",
      (compilation) => {
        HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tap(
          "HTMLWebpackProcessingPlugin",
          (htmlPluginData, callback) => {
            self.assetProcessing(htmlPluginData, callback);
          }
        );
      }
    );
    
  }

  preProcessing(htmlPluginData, callback) {
    if (typeof htmlPluginData.plugin.options.preProcessing === "function") {
      try {
        
        htmlPluginData.html = htmlPluginData.plugin.options.preProcessing(
          htmlPluginData.html
        );
        typeof callback === "function" && callback(null, htmlPluginData);
      } catch (err) {
        typeof callback === "function" && callback(err);
      }
    } else {
      typeof callback === "function" && callback(null, htmlPluginData);
    }
  }

  postProcessing(htmlPluginData, callback) {
    if (typeof htmlPluginData.plugin.options.postProcessing === "function") {
      try {
        htmlPluginData.html = htmlPluginData.plugin.options.postProcessing(
          htmlPluginData.html
        );
        typeof callback === "function" && callback(null, htmlPluginData);
      } catch (err) {
        typeof callback === "function" && callback(err);
      }
    } else {
      typeof callback === "function" && callback(null, htmlPluginData);
    }
  }

  assetProcessing(htmlPluginData, calback) {
    try {
      const outputName = htmlPluginData.outputName;
      const assets = htmlPluginData.assets;
      assets.js = assets.js.map(assetfile => {
        return fixPath(assetfile, outputName)
      })

      assets.css = assets.css.map(assetfile => {
        console.log(assetfile);
          return fixPath(assetfile, outputName)
      })

    } catch (err) {
    }
    typeof callback === "function" && callback(null, htmlPluginData);
  }
}

module.exports = HtmlWebpackProcessingPlugin;
