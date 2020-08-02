const HtmlWebpackPlugin = require("html-webpack-plugin");
const isWsl = require("is-wsl");
const PnpWebpackPlugin = require("pnp-webpack-plugin");
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin");
const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const ManifestPlugin = require("webpack-manifest-plugin");

const getClientEnvironment = require("./env");
const modules = require("./modules");
const paths = require("./paths");

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
const webpackConfig = webpackEnv => ({ plugins }) => {
  const isEnvDevelopment = webpackEnv === "development";
  const isEnvProduction = webpackEnv === "production";

  // Webpack uses `publicPath` to determine where the app is being served from.
  // It requires a trailing slash, or the file assets will get an incorrect
  // path.
  // In development, we always serve from the root. This makes config easier.
  const publicPath = isEnvProduction
    ? paths.servedPath
    : isEnvDevelopment && "/";

  // `publicUrl` is just like `publicPath`, but we will provide it to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  const publicUrl = isEnvProduction
    ? publicPath.slice(0, -1)
    : isEnvDevelopment && "";
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(publicUrl);

  return {
    mode: isEnvProduction ? "production" : isEnvDevelopment && "development",
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: "source-map",
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are
    // included in JS bundle.
    entry: {
      background: paths.appBackgroundJs,
      content: paths.appContentJs
    },
    output: {
      // The build folder.
      path: paths.appBuild,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: "static/js/[name].js",
      // TODO: remove this when upgrading to webpack 5
      futureEmitAssets: true,
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: "static/js/[name].chunk.js",
      // We inferred the "public path" (such as / or /my-project) from homepage.
      // We use "/" in development.
      publicPath
    },
    optimization: {
      minimize: isEnvProduction, //  TODO: see size differnce with this
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: {
              // we want terser to parse ecma 8 code. However, we don't want it
              // to apply any minfication steps that turns valid ecma 5 code
              // into invalid ecma 5 code. This is why the 'compress' and
              // 'output'
              // sections only apply transformations that are ecma 5 safe
              // https://github.com/facebook/create-react-app/pull/4234
              ecma: 8
            },
            compress: {
              ecma: 5,
              warnings: false,
              // Disabled because of an issue with Uglify breaking seemingly
              // valid code:
              // https://github.com/facebook/create-react-app/issues/2376
              // Pending further investigation:
              // https://github.com/mishoo/UglifyJS2/issues/2011
              comparisons: false,
              // Disabled because of an issue with Terser breaking valid code:
              // https://github.com/facebook/create-react-app/issues/5250
              // Pending futher investigation:
              // https://github.com/terser-js/terser/issues/120
              inline: 2
            },
            mangle: { safari10: true },
            output: {
              ecma: 5,
              comments: false,
              // Turned on because emoji and regex is not minified properly
              // using default
              // https://github.com/facebook/create-react-app/issues/2488
              ascii_only: true
            }
          },
          // Use multi-process parallel running to improve the build speed
          // Default number of concurrent runs: os.cpus().length - 1
          // Disabled on WSL (Windows Subsystem for Linux) due to an issue with
          // Terser
          // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
          parallel: !isWsl,
          // Enable file caching
          cache: true,
          sourceMap: true
        })
      ],
      // optimize chunks for Chrome extensions
      // on make a few files
      runtimeChunk: false,
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            enforce: true,
            chunks: "all"
          }
        }
      }
    },
    resolve: {
      // This allows you to set a fallback for where Webpack should look for
      // modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      modules: ["node_modules", paths.appNodeModules].concat(
        modules.additionalModulePaths || []
      ),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: paths.moduleFileExtensions.map(ext => `.${ext}`),
      alias: {
        "react-native": "react-native-web"
        // Alias react to always be local version to support linked packages
        // https://github.com/facebook/react/issues/13991#
        // react: paths.react
        // 'react-modal': paths.reactModal,
        // same issue but this is to allow context to be shared between linked
        // packages
        // '@mujo/plugins': paths.pluginsLib,
        // '@mujo/ingress': paths.ingressLib,
        // '@mujo/box': paths.boxLib,
        // '@mujo/ui': paths.uiLib,
      },
      plugins: [
        // Adds support for installing with Plug'n'Play, leading to faster
        // installs and adding
        // guards against forgotten dependencies and such.
        PnpWebpackPlugin,
        // Prevents users from importing files from outside of src/
        // (or node_modules/).
        // This often causes confusion because we only process files within src/
        // with babel.
        // To fix this, we prevent you from importing files out of src/ -- if
        // you'd like to,
        // please link the files into your node_modules/ and let
        // module-resolution kick in.
        // Make sure your source files are compiled, as they will not be
        // processed in any way.
        new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])
      ]
    },
    resolveLoader: {
      plugins: [
        // Also related to Plug'n'Play, but this time it tells Webpack to load
        // its loaders
        // from the current package.
        PnpWebpackPlugin.moduleLoader(module)
      ]
    },
    module: {
      strictExportPresence: true,
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },

        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          test: /\.(js)$/,
          enforce: "pre",
          use: [
            {
              options: {
                formatter: require.resolve("react-dev-utils/eslintFormatter"),
                eslintPath: require.resolve("eslint")
              },
              loader: require.resolve("eslint-loader")
            }
          ],
          include: paths.appSrc
        },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            // "url" loader works like "file" loader except that it embeds
            // assets
            // smaller than specified limit in bytes as data URLs to avoid
            // requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve("url-loader"),
              options: {
                limit: 10000,
                name: "static/media/[name].[hash:8].[ext]"
              }
            },
            // Process application JS, and in repo plugins with Babel
            // TODO: decide if we should also process node modules plugins ?
            {
              test: /\.(js)$/,
              include: [paths.appSrc, ...plugins.paths],
              loader: require.resolve("babel-loader"),
              options: {
                customize: require.resolve(
                  "babel-preset-react-app/webpack-overrides"
                ),

                plugins: [
                  [
                    require.resolve("babel-plugin-named-asset-import"),
                    {
                      loaderMap: {
                        svg: {
                          ReactComponent: "@svgr/webpack?-svgo,+ref![path]"
                        }
                      }
                    }
                  ]
                ],
                // This is a feature of `babel-loader` for webpack
                // (not Babel itself).
                // It enables caching results in
                // ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                cacheCompression: isEnvProduction,
                compact: isEnvProduction
              }
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard
            // ES features.
            {
              test: /\.(js)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve("babel-loader"),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [
                    require.resolve("babel-preset-react-app/dependencies"),
                    { helpers: true }
                  ]
                ],
                cacheDirectory: true,
                cacheCompression: isEnvProduction,

                // If an error happens in a package, it's possible to be
                // because it was compiled. Thus, we don't want the browser
                // debugger to show the original code. Instead, the code
                // being evaluated would be much more helpful.
                sourceMaps: false
              }
            },
            // "file" loader makes sure those assets get served by
            // WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve("file-loader"),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through
              // "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.js$/, /\.html$/, /\.json$/],
              options: { name: "static/media/[name].[hash:8].[ext]" }
            }
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ]
        }
      ]
    },
    plugins: [
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      // In production, it will be an empty string unless you specify "homepage"
      // in `package.json`, in which case it will be the pathname of that URL.
      // In development, this will be an empty string.
      new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin(env.stringified),
      // If you require a missing module and then `npm install` it,
      // you still have to restart the development server for Webpack to
      // discover it.
      // This plugin makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebook/create-react-app/issues/186
      // Generate a manifest file which contains a mapping of all asset
      // filenames to their corresponding output file so that tools can pick
      // it up without  having to parse `index.html`.
      new ManifestPlugin({
        fileName: "asset-manifest.json",
        publicPath,
        generate: (seed, files) => {
          const manifestFiles = files.reduce(
            (manifest, file) => ({
              ...manifest,
              [file.name]: file.path
            }),
            seed
          );

          return { files: manifestFiles };
        }
      }),
      // Limit chunks to 1
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      module: "empty",
      dgram: "empty",
      dns: "mock",
      fs: "empty",
      http2: "empty",
      net: "empty",
      tls: "empty",
      child_process: "empty"
    },
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false
  };
};

module.exports = webpackConfig;
