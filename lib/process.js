//
// The Process Manager
// Functions to list, start and stop processes
//
const path = require('path')
const onExit = require('signal-exit')
const { spawn } = require('child_process')
const evt = require('./event')
const log = require('./logs')

// List of children processes
const procs = {}

function startProc (pathObj) {
  /**
   * Start a Node.js process running the file from pathObj.
   * https://nodejs.org/dist/latest-v8.x/docs/api/path.html#path_path_format_pathobject
   *
   * @param {Object} pathObj
   */
  const pathStr = path.format(pathObj)
  // Normalize a possibly bad formed pathObj
  pathObj = path.parse(pathStr)
  if (procs[pathStr]) {
    // log.warn(`Child process "${pathStr}" is already started!`)
    return
  }
  const child = spawn('node', [pathObj.base], { cwd: pathObj.dir })
  log.info(`Process start :: "${pathStr}"`)
  procs[pathStr] = child

  child.stdout.on('data', data => {
    log.info(`"${pathStr}" stdout: ${data.toString().trim()}`)
  })
  child.stderr.on('data', data => {
    log.error(`"${pathStr}" stderr: ${data.toString().trim()}`)
  })
  child.on('error', error => {
    log.error(`"${pathStr}" error: ${error}`)
  })

  // When process stops for some reason
  child.on('exit', (code, sig) => {
    const exitCode = code ? `exit(${code})` : `signal(${sig})`
    log.info(`Process stop ${exitCode} :: "${pathStr}"`)
    // GC output buffers
    child.stdout.destroy()
    child.stderr.destroy()
  })
}

function stopProc (pathStr) {
  if (!procs[pathStr]) {
    // log.warn(`Child process "${pathStr}" is not started!`)
    return
  }
  procs[pathStr].kill()
  delete procs[pathStr]
}

function stopAll () {
  log.info('Stop all processes!')
  // Cycle and stop all
  Object.keys(procs).map(stopProc)
}

onExit(() => {
  stopAll()
  // All clients might be interested in this event
  evt.emit('exit')
})

module.exports = {
  startProc,
  stopProc,
  stopAll
}
