
const { watch } = require('chokidar')
const { spawn } = require('child_process')
const onExit = require('signal-exit')

// Projects watcher
var watcher = null
// List of children processes
const procs = {}

function startAll (folder) {
  // All JS files, depth = 0
  watcher = watch('*.js', {
    depth: 1,
    cwd: folder
  })
    .on('add', function (path) {
      console.log('Project file created ::', path)
      startOne(path)
    })
    .on('change', function (path) {
      console.log('Project file changed ::', path)
      stopOne(path)
      startOne(path)
    })
    .on('unlink', function (path) {
      console.log('Project file removed ::', path)
      stopOne(path)
    })
}

function startOne (path) {
  if (procs[path]) {
    throw new Error('The process is already started!')
  }
  const child = spawn('./lib/cli.js', ['--exec', `../examples/${path}`])

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
  for (let k of Object.keys(procs)) {
    stopOne(k)
  }
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
