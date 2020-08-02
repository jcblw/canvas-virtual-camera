const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const cosmiconfig = require('cosmiconfig')
const rimraf = require('rimraf')
const paths = require('../config/paths')
const pkg = require('../package.json')
const { log } = require('./logger')

const stat = promisify(fs.stat)
const write = promisify(fs.writeFile)
const symlink = promisify(fs.symlink)
const rmrf = promisify(rimraf)
const mkdir = promisify(fs.mkdir)
const realpath = promisify(fs.realpath)

const promiseSeq = async (fn, arr) => {
  const resolves = []
  await arr.reduce(
    (promise, plugin, i) =>
      promise.then(async () => {
        const resolve = await fn(plugin, i)
        resolves.push(resolve)
        return Promise.resolve()
      }),
    Promise.resolve()
  )
  return resolves
}

const cleanDirectory = async () => {
  // cleans out synlinks
  await rmrf(paths.appPluginsDir)
  await mkdir(paths.appPluginsDir)
}

const symlinkPlugin = plugins => async (pluginPath, i) => {
  const pluginName = plugins[i]
  if (/\//g.test(pluginName)) {
    const subPath = pluginName.split('/').shift()
    await mkdir(path.resolve(paths.appPluginsDir, subPath))
  }
  await symlink(
    pluginPath,
    path.resolve(paths.appPluginsDir, plugins[i])
  )
}

const doesExist = async pluginPath => {
  try {
    await stat(pluginPath)
    return true
  } catch (e) {
    // will error if does not exist
  }
  return false
}

const createPluginFile = async plugins => {
  const content = `module.exports = [${plugins
    .map(plugin => {
      const pluginPath = path.relative(
        paths.appSrc,
        path.resolve(paths.appPluginsDir, plugin)
      )
      return `require('./${pluginPath}').default`
    })
    .join(',\n')}]`

  await write(paths.appPluginsJs, content)
}

const resolveConfig = async pluginPath => {
  const configPath = path.resolve(pluginPath, 'config.js')
  const configExist = await doesExist(configPath)
  if (configExist) {
    try {
      return require(configPath)({}) // TODO: add config options to plugins
    } catch (e) {
      log(`Error running plugin config: ${configPath}`)
      log(e.message)
      log(e.stack)
    }
  }
  return {}
}

const resolvePath = async (...args) => {
  try {
    const fullPath = await realpath(path.resolve(...args))
    return fullPath
  } catch (e) {
    return path.resolve(...args)
  }
}

const resolvePlugin = async pluginName => {
  const nodeModulePath = await resolvePath(
    paths.appNodeModules,
    pluginName
  )
  const isInNodeModule = await doesExist(
    path.resolve(paths.appNodeModules, pluginName)
  )
  const inRepoPath = await resolvePath(
    paths.inRepoPlugins,
    pluginName
  )
  const isInRepo = await doesExist(inRepoPath)

  const exists = isInNodeModule || isInRepo
  if (!exists) {
    //  Fail fast
    throw new TypeError(`Plugin "${pluginName}" does not exist`)
  }
  // TODO: check repo for config file to be able to add in permissions
  return isInRepo ? inRepoPath : nodeModulePath
}

module.exports = async () => {
  const name = pkg.name.toLowerCase()
  const explorer = cosmiconfig(name)
  const { config } = await explorer.search()
  const pluginNames = config.plugins.map(pluginName =>
    pluginName.replace(/\\/g, '')
  )
  await cleanDirectory()
  const plugins = await promiseSeq(resolvePlugin, pluginNames)
  const pluginConfigs = await promiseSeq(resolveConfig, plugins)
  await promiseSeq(symlinkPlugin(pluginNames), plugins)
  await createPluginFile(pluginNames)
  return [plugins, pluginConfigs]
}
