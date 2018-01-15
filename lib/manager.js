//
// If this file is executed, it means this is MAIN
// This watches all Markdown and JavaScript files and launches child processes
//
const { watch } = require('chokidar')
const { spawn } = require('child_process')
const onExit = require('signal-exit')
const log = require('./logs')
const { convertFile } = require('./parse')

// Markdown file watcher instance
var mdWatcher = null
// JavaScript file watcher instance
var jsWatcher = null
// List of children processes
const procs = {}

function watchSources (folder, extensions = ['*.md', '*.mdown', '*.mkdown']) {
  /**
   * Start watching all Markdown text files from the folder,
   * one level deep.
   */
  const opts = { cwd: folder, ignoreInitial: true, depth: 1 }
  log.info(`Watching all sources from "${folder}" ...`)

  mdWatcher = watch(extensions, opts)
    .on('add', function (path) {
      convertFile(`${folder}/${path}`)
    })
    .on('change', function (path) {
      convertFile(`${folder}/${path}`)
    })
    .on('unlink', async function (path) {
      await remove(`${folder}/${path}`, { glob: false })
    })
}

function startAll (folder) {
  /**
   * Start watching all JavaScript files from the folder,
   * one level deep.
   */
  const opts = { cwd: folder, ignoreInitial: true, depth: 1 }
  log.info(`Start all projects from "${folder}" ...`)

  jsWatcher = watch('*.js', opts)
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
    log.warn(`Child process "${path}" is already started!`)
    return
  }
  const child = spawn('./lib/cli.js', ['--exec', `../${path}`])

  child.stdout.on('data', data => {
    log.info(`"${path}" stdout: ${data}`)
  })
  child.stderr.on('data', data => {
    log.error(`"${path}" stderr: ${data}`)
  })
  child.on('error', error => {
    log.error(`"${path}" error: ${error}`)
  })
  child.on('exit', (code, sig) => {
    log.info(`Child process "${path}" exit(${code}) signal(${sig})`)
    child.stdout.destroy()
    child.stderr.destroy()
  })

  log.info(`Started process "${path}"`)
  procs[path] = child
}

function stopOne (path) {
  if (!procs[path]) {
    log.warn(`Child process "${path}" is not started!`)
    return
  }
  procs[path].kill()
  delete procs[path]
}

function stopAll () {
  log.info('Stop all projects ...')
  // Cycle and stop
  Object.keys(procs).map(stopOne)
  // Stop watching files
  if (mdWatcher) {
    mdWatcher.close()
    mdWatcher = null
  }
  if (jsWatcher) {
    jsWatcher.close()
    jsWatcher = null
  }
}

onExit(() => {
  stopAll()
})

module.exports = {
  watchSources,
  startOne,
  stopOne,
  startAll,
  stopAll
}
