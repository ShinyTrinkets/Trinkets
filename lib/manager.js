//
// If this file is executed, it means this is MAIN
// This watches all Markdown and JavaScript files and launches child processes
//
const fse = require('fs-extra')
const onExit = require('signal-exit')
const { spawn } = require('child_process')
const { parse, dirname, basename } = require('path')
const log = require('./logs')
const watch = require('./watcher')
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

async function watchSources (folder) {
  /**
   * Start watching all Markdown text files from the folder.
   */
  mdWatcher = await watch.watchPath(folder, { extensions: '*.md' })

  mdWatcher.on('created', async function (o) {
    try {
      await convertFile(`${o.folder}/${o.file}`)
    } catch (err) {
      log.error(err)
    }
  })
  mdWatcher.on('modified', async function (o) {
    try {
      await deleteProjectFile(`${o.folder}/${o.file}`)
      await convertFile(`${o.folder}/${o.file}`)
    } catch (err) {
      log.error(err)
    }
  })
  // mdWatcher.on('renamed', async function(o)
  mdWatcher.on('deleted', async function (o) {
    try {
      await deleteProjectFile(`${o.folder}/${o.file}`)
    } catch (err) {
      log.error(err)
    }
  })
  mdWatcher.on('error', error => log.error(`MD watcher error: ${error}`))
}

async function startProjects (folder) {
  /**
   * Start watching all JavaScript files from the folder.
   */
  log.info(`Start all projects from "${folder}" ...`)

  jsWatcher = await watch.watchPath(folder, { extensions: '*.js' })

  jsWatcher.on('created', async function (o) {
    try {
      startProj(o.file, o.folder)
    } catch (err) {
      log.error(err)
    }
  })
  jsWatcher.on('modified', async function (o) {
    try {
      stopProj(`${o.folder}/${o.file}`)
      startProj(o.file, o.folder)
    } catch (err) {
      log.error(err)
    }
  })
  // jsWatcher.on('renamed', async function(o)
  jsWatcher.on('deleted', async function (o) {
    try {
      stopProj(`${o.folder}/${o.file}`)
    } catch (err) {
      log.error(err)
    }
  })
  jsWatcher.on('error', error => log.error(`JS watcher error: ${error}`))
}

function startProj (file, cwd) {
  const path = `${cwd}/${file}`
  if (procs[path]) {
    // log.warn(`Child process "${path}" is already started!`)
    return
  }
  const child = spawn('node', [file], { cwd })

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
    // log.warn(`Child process "${path}" is not started!`)
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
  watch.stopWatchers()
  if (mdWatcher) {
    mdWatcher.w.dispose()
    mdWatcher = null
    log.info('Stop src watcher.')
  }
  if (jsWatcher) {
    jsWatcher.w.dispose()
    jsWatcher = null
    log.info('Stop code watcher.')
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
