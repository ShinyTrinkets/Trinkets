const str = require('voca')
const nsfw = require('nsfw')
const mm = require('micromatch')
const { resolve } = require('path')
const Emittery = require('emittery')

const actions = {
  0: 'created',
  1: 'deleted',
  2: 'modified',
  3: 'renamed'
}

async function watch (folder, options) {
  const ee = new Emittery()

  const defaultOpts = {
    recursive: false,
    extensions: '*.*',
    debounceMS: 500,
    errorCallback (err) {
      ee.emit('error', err)
    }
  }
  options = { ...defaultOpts, ...options }
  const { extensions } = options
  delete options.extensions

  const absPath = str.trimRight(resolve(folder), '/')
  console.log(`Watching all [${extensions}] from "${absPath}" ...`)

  nsfw(absPath, function (events) {
    for (const ev of events) {
      // At least one extension should match
      if (mm.isMatch(ev.file, extensions)) {
        ee.emit(actions[ev.action], { file: ev.file, folder: ev.directory })
      }
    }
  })
    .then(function (watcher) {
      ee.w = watcher
      return watcher.start()
    })
    .catch(err => ee.emit('error', err))

  return ee
}

module.exports = watch
