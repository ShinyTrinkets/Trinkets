//
// If this file is executed, it means this is MAIN
// This watches all Markdown and JavaScript files and launches child processes
//
const mem = require('mem')
const fse = require('fs-extra')
const onExit = require('signal-exit')
const { spawn } = require('child_process')
const { parse } = require('path')
const evt = require('./event')
const log = require('./logs')
const watch = require('./watcher')
const { convertFile } = require('./parse')

// Markdown file watcher instance
// Saved here so it can be disposed when needed
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
      evt.emit('script:will_create', { file: o.file, folder: o.folder })
      await convertFile(`${o.folder}/${o.file}`)
    } catch (err) {
      log.error(err)
    }
  })
  mdWatcher.on('modified', async function (o) {
    const p = `${o.folder}/${o.file}`
    try {
      evt.emit('script:will_change', { file: o.file, folder: o.folder })
      await deleteProjectFile(p)
      await convertFile(p)
    } catch (err) {
      log.error(err)
    }
  })
  mdWatcher.on('renamed', async function (o) {
    try {
      evt.emit('script:will_rename', { file: o.file, folder: o.folder })
      await deleteProjectFile(`${o.folder}/${o.oldFile}`)
      await convertFile(`${o.folder}/${o.file}`)
    } catch (err) {
      log.error(err)
    }
  })
  mdWatcher.on('deleted', async function (o) {
    try {
      evt.emit('script:will_delete', { file: o.file, folder: o.folder })
      await deleteProjectFile(`${o.folder}/${o.file}`)
    } catch (err) {
      log.error(err)
    }
  })
  mdWatcher.on('error', error => log.error(`MD watcher error: ${error}`))
}

async function watchProjects (folder) {
  /**
   * Start watching all JavaScript files from the folder.
   */
  log.info(`Start all projects from "${folder}" ...`)

  jsWatcher = await watch.watchPath(folder, { extensions: '*.js' })

  jsWatcher.on('created', async function (o) {
    try {
      startProj(o.file, o.folder)
      evt.emit('script:start', { file: o.file, folder: o.folder })
    } catch (err) {
      log.error(err)
    }
  })
  jsWatcher.on('modified', async function (o) {
    try {
      stopProj(`${o.folder}/${o.file}`)
      startProj(o.file, o.folder)
      evt.emit('script:restart', { file: o.file, folder: o.folder })
    } catch (err) {
      log.error(err)
    }
  })
  jsWatcher.on('deleted', async function (o) {
    try {
      stopProj(`${o.folder}/${o.file}`)
      evt.emit('script:stop', { file: o.file, folder: o.folder })
    } catch (err) {
      log.error(err)
    }
  })
  jsWatcher.on('error', error => log.error(`JS watcher error: ${error}`))
}

// Memoize starting of projects
const startProj = mem(
  function debouncedStartProj (file, cwd) {
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
  },
  { maxAge: 500 }
)

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
  // All clients might be interested in this event
  evt.emit('exit')
})

module.exports = {
  watchSources,
  startProj,
  stopProj,
  watchProjects,
  stopProjects
}
