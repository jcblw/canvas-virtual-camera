const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const ChangeCase = require('change-case')
const cosmiconfig = require('cosmiconfig')
const deepMerge = require('deepmerge')
const chalk = require('react-dev-utils/chalk')
const paths = require('../config/paths')
const pkg = require('../package.json')

const write = promisify(fs.writeFile)

const BACKGROUND_PATTERN = /background|vendor/
const MAP_PATTERN = /map/

const stampDefaultManifest = () => ({
  manifest_version: 2,
  short_name: pkg.name,
  version: pkg.version,
  offline_enabled: true,
  background: {},
})

const getScripts = PATTERN => {
  const assets = require('../build/asset-manifest.json')
  return Object.keys(assets.files)
    .filter(
      filename =>
        PATTERN.test(filename) && !MAP_PATTERN.test(filename)
    )
    .map(file => assets.files[file].replace('./', ''))
}

const changeKeyCasing = (object, fn) => {
  const keys = Object.keys(object)
  return keys
    .map(fn)
    .reduce(
      (accum, key, i) => ({ ...accum, [key]: object[keys[i]] }),
      {}
    )
}

const createSecurityPolicyString = contentSecurityPolicy =>
  Object.keys(contentSecurityPolicy)
    .reduce((accum, key) => {
      const values = contentSecurityPolicy[key] || []
      return `${accum} ${key} ${values.join(' ')};`
    }, '')
    .trim()

const createManifest = async () => {
  const name = pkg.name.toLowerCase()
  const explorer = cosmiconfig(name)
  const results = await explorer.search()
  const manifestDefaults = stampDefaultManifest()
  if (!results || !results.config) {
    throw new TypeError(
      'No config found please create a .mujorc.yml in the root diretory'
    )
  }
  const { plugins, ...config } = results.config
  const manifestOverrides = changeKeyCasing(
    config,
    ChangeCase.snakeCase
  )
  const backgroundScripts = getScripts(BACKGROUND_PATTERN)
  backgroundScripts.unshift(await createBackgroundAssetMap())
  return {
    ...manifestDefaults,
    ...manifestOverrides,
    content_security_policy: changeKeyCasing(
      manifestOverrides.content_security_policy,
      ChangeCase.paramCase
    ),
    background: {
      scripts: backgroundScripts,
      persistent: true,
    },
  }
}

const createBackgroundAssetMap = async () => {
  const assets = require('../build/asset-manifest.json')
  const fileName = 'asset-map.js'
  const outputFile = path.resolve(paths.appBuild, fileName)
  const content = `window.mujo_assets = ${JSON.stringify(assets)}`
  await write(outputFile, content)
  return fileName
}

const caseManifest = config => {
  const manifestOverrides = changeKeyCasing(
    config,
    ChangeCase.snakeCase
  )
  const csp = config.contentSecurityPolicy || {}
  return {
    ...manifestOverrides,
    content_security_policy: changeKeyCasing(
      csp,
      ChangeCase.paramCase
    ),
  }
}

module.exports = async (additionalConfigs = []) => {
  const casedConfigs = additionalConfigs.map(caseManifest)
  const outputfile = path.resolve(paths.appBuild, 'manifest.json')
  const mainManifest = await createManifest()
  const {
    content_security_policy,
    ...mergedManifest
  } = deepMerge.all([...casedConfigs, mainManifest])
  const manifest = {
    ...mergedManifest,
    content_security_policy: createSecurityPolicyString(
      content_security_policy
    ),
  }
  await write(outputfile, JSON.stringify(manifest, null, '  '))
  console.log(`Manifest.json created: ${chalk.green(outputfile)}`)
}
