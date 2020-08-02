const fs = require('fs')
const { promisify } = require('util')
const paths = require('../config/paths')

const write = promisify(fs.writeFile)
const read = promisify(fs.readFile)
const BETA_ICON = 'favicon-beta.png'

const beta = str => `[BETA] ${str}`
const readJSON = async dir => JSON.parse(await read(dir))
const serialize = json => JSON.stringify(json, null, '\t')

const decorateBETA = async () => {
  const secondsInWeek = `${Math.floor(+new Date() / 1000)}`.slice(-4)
  const manifest = await readJSON(paths.manifestFile)
  const betaManifest = {
    ...manifest,
    name: beta(manifest.name),
    short_name: beta(manifest.short_name),
    browser_action: { default_icon: BETA_ICON },
    icons: {
      16: BETA_ICON,
      32: BETA_ICON,
      48: BETA_ICON,
      96: BETA_ICON,
      128: BETA_ICON,
      512: BETA_ICON,
    },
    version: `${manifest.version}.${secondsInWeek}`,
    version_name: `${manifest.version} BETA`,
  }
  return write(paths.manifestFile, serialize(betaManifest))
}

decorateBETA()
