//
// If this file is executed, it means this is MAIN
//
const { watch } = require('chokidar')
const { spawn } = require('child_process')
const onExit = require('signal-exit')

// Projects watcher instance
var watcher = null
// List of children processes
const procs = {}

function startAll (folder) {
  /**
   * Start watching all JavaScript files from the folder,
   * one level deep.
   */
  const opts = { cwd: folder, depth: 1 }
  console.log('Starting projects from', folder, '...')
  watcher = watch('*.js', opts)
    .on('add', function (path) {
      path = `${folder}/${path}`
      console.log('Project file created ::', path)
      startOne(path)
    })
    .on('change', function (path) {
      path = `${folder}/${path}`
      console.log('Project file changed ::', path)
      stopOne(path)
      startOne(path)
    })
    .on('unlink', function (path) {
      path = `${folder}/${path}`
      console.log('Project file removed ::', path)
      stopOne(path)
    })
}

function startOne (path) {
  if (procs[path]) {
    throw new Error('The process is already started!')
  }
  const child = spawn('./lib/cli.js', ['--exec', `../${path}`])

  child.stdout.on('data', data => {
    console.log(`stdout: ${data}`)
  })
  child.stderr.on('data', data => {
    console.log(`stderr: ${data}`)
  })
  child.on('error', error => {
    console.log(`Child error ${error}`)
  })
  child.on('exit', (code, sig) => {
    console.log(`Child exit code ${code}, signal ${sig}`)
    child.stdout.destroy()
    child.stderr.destroy()
  })

  procs[path] = child
}

function stopOne (path) {
  if (!procs[path]) {
    throw new Error('The process is not started!')
  }
  procs[path].kill()
  delete procs[path]
}

function stopAll () {
  console.log('Stopping all processes ...')
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
