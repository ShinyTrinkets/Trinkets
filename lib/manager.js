//
// If this file is executed, it means this is MAIN
// This watches all Markdown and JavaScript files and launches child processes
//
const fse = require('fs-extra')
const { watch } = require('chokidar')
const { spawn } = require('child_process')
const onExit = require('signal-exit')
const { parse, dirname, basename } = require('path')
const log = require('./logs')
const { convertFile } = require('./parse')

// Markdown file watcher instance
var mdWatcher = null
// JavaScript file watcher instance
var jsWatcher = null
// List of children processes
const procs = {}

async function deleteProjectFile (mdPath) {
  const p = parse(mdPath)
  // Remove the converted JS file
  await fse.remove(`${p.dir}/${p.name}.js`)
}

function watchSources (folder, extensions = ['*.md', '*.mdown', '*.mkdown']) {
  /**
   * Start watching all Markdown text files from the folder,
   * one level deep.
   */
  const opts = { cwd: folder, ignoreInitial: true, depth: 1 }
  log.info(`Watching all [${extensions}] from "${folder}" ...`)

  mdWatcher = watch(extensions, opts)
    .on('add', function (path) {
      convertFile(`${folder}/${path}`)
    })
    .on('change', async function (path) {
      path = `${folder}/${path}`
      await deleteProjectFile(path)
      convertFile(path)
    })
    .on('unlink', async function (path) {
      path = `${folder}/${path}`
      await deleteProjectFile(path)
    })
    .on('error', error => log.error(`MD watcher error: ${error}`))
}

function startProjects (folder) {
  /**
   * Start watching all JavaScript files from the folder,
   * one level deep.
   */
  const opts = { cwd: folder, ignoreInitial: true, depth: 1 }
  log.info(`Start all projects from "${folder}" ...`)

  jsWatcher = watch('*.js', opts)
    .on('add', function (path) {
      path = `${folder}/${path}`
      log.info('Project file added ::', path)
      startProj(path)
    })
    .on('change', function (path) {
      path = `${folder}/${path}`
      log.info('Project file changed ::', path)
      stopProj(path)
      startProj(path)
    })
    .on('unlink', function (path) {
      path = `${folder}/${path}`
      log.info('Project file removed ::', path)
      stopProj(path)
    })
    .on('error', error => log.error(`JS watcher error: ${error}`))
}

function startProj (path) {
  if (procs[path]) {
    log.warn(`Child process "${path}" is already started!`)
    return
  }
  const cwd = dirname(path)
  const name = basename(path)
  const child = spawn('node', [name], { cwd })

  child.stdout.on('data', data => {
    log.info(`"${path}" stdout: ${data.toString().trim()}`)
  })
  child.stderr.on('data', data => {
    log.error(`"${path}" stderr: ${data.toString().trim()}`)
  })
  child.on('error', error => {
    log.error(`"${path}" error: ${error}`)
  })
  child.on('exit', (code, sig) => {
    const exitFunc = code ? `exit(${code})` : `signal(${sig})`
    log.info(`Process stop ${exitFunc} :: "${path}"`)
    child.stdout.destroy()
    child.stderr.destroy()
  })

  log.info(`Process start :: "${path}"`)
  procs[path] = child
}

function stopProj (path) {
  if (!procs[path]) {
    log.warn(`Child process "${path}" is not started!`)
    return
  }
  procs[path].kill()
  delete procs[path]
}

function stopProjects () {
  log.info('Stop all projects ...')
  // Cycle and stop
  Object.keys(procs).map(stopProj)
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
  stopProjects()
})

module.exports = {
  watchSources,
  startProj,
  stopProj,
  startProjects,
  stopProjects
}
