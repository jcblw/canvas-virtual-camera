/* eslint-disable-next-line */
const { Gaze } = require('gaze')
const { log } = require('./logger')
const { runScript } = require('./script-runner')

const gaze = new Gaze([
  '{public,src,plugins}/**/*.{json,js,html}',
  '!**/mujo-plugins.js',
  '!src/plugins/**/*',
  '.mujorc.yml',
])
const isDevToolsEnabled = process.env.DEVTOOLS

log('starting up server')
const teardownHttp = runScript('serve')
let teardownDevtools
if (isDevToolsEnabled) {
  log('starting up devtools')
  teardownDevtools = runScript('devtools')
}

let teardown = null
const runBuild = () => {
  if (teardown) {
    teardown()
  }
  log('rebuilding development')
  teardown = runScript('build:dev', process.stdout)
}

let hasShutdown = false
const teardownAll = () => {
  if (hasShutdown) return
  hasShutdown = true
  log('shutting down')
  teardownHttp()
  if (teardownDevtools) {
    teardownDevtools()
  }
  if (teardown) {
    teardown()
  }
  log('shutdown complete')
  process.exit(0)
}

process.on('SIGINT', teardownAll)
process.on('exit', teardownAll)
gaze.on('ready', runBuild)
gaze.on('all', (...args) => {
  console.log(...args)
  runBuild()
})
