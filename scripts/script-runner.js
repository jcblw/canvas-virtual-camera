const { spawn: cspawn } = require('child_process')
const { log } = require('./logger')

const spawn = (cmd, args, output = 'pipe') =>
  cspawn(cmd, args, {
    stdio: ['pipe', output, process.stderr],
    detached: true,
  })

module.exports.runScript = (scriptName, output) => {
  let hasExited = false
  const p = spawn('npm', ['run', scriptName], output)
  log(`script "${scriptName}" running`)
  p.on('close', code => {
    hasExited = true
    const badCode = code === null
    const out = badCode ? 'was canceled' : 'has exited'
    const icon = code === 0 ? '👍' : '👎'
    log(`script "${scriptName}" ${out} ${icon}`)
  })
  return () => {
    if (hasExited) return
    log(`script "${scriptName}" tearing down with pid of ${-p.pid}`)
    process.kill(-p.pid)
  }
}
