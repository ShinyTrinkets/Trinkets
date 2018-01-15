//
// If this file is executed, it means this is MAIN
//
const { watch } = require('chokidar')
const { spawn } = require('child_process')
const onExit = require('signal-exit')
const log = require('./logs')

// Projects watcher instance
var watcher = null
// List of children processes
const procs = {}

function startAll (folder) {
  /**
   * Start watching all JavaScript files from the folder,
   * one level deep.
   */
  const opts = { cwd: folder, ignoreInitial: true, depth: 1 }
  log.info(`Start all projects from "${folder}" ...`)
  watcher = watch('*.js', opts)
    .on('add', function (path) {
      path = `${folder}/${path}`
      log.info('Project file created ::', path)
      startOne(path)
    })
    .on('change', function (path) {
      path = `${folder}/${path}`
      log.info('Project file changed ::', path)
      stopOne(path)
      startOne(path)
    })
    .on('unlink', function (path) {
      path = `${folder}/${path}`
      log.info('Project file removed ::', path)
      stopOne(path)
    })
}

function startOne (path) {
  if (procs[path]) {
    throw new Error('The process is already started!')
  }
  const child = spawn('./lib/cli.js', ['--exec', `../${path}`])

  child.stdout.on('data', data => {
    log.info(`"${path}" stdout: ${data}`)
  })
  child.stderr.on('data', data => {
    log.error(`"${path}" stderr: ${data}`)
  })
  child.on('error', error => {
    log.error(`"${path}" error ${error}`)
  })
  child.on('exit', (code, sig) => {
    log.info(`"${path}" exit code ${code}, signal ${sig}`)
    child.stdout.destroy()
    child.stderr.destroy()
  })

  log.info(`Started process "${path}"`)
  procs[path] = child
}

function stopOne (path) {
  if (!procs[path]) {
    // log.warn(`The process from "${path}" is not started!`)
    return
  }
  procs[path].kill()
  delete procs[path]
}

function stopAll () {
  log.info('Stop all projects ...')
  // Cycle and stop
  Object.keys(procs).map(stopOne)
  // Stop watching
  if (watcher) {
    watcher.close()
    watcher = null
  }
}

onExit(() => {
  stopAll()
})

module.exports = {
  startOne,
  stopOne,
  startAll,
  stopAll
}
