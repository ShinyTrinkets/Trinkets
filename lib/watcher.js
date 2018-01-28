const str = require('voca')
const mm = require('micromatch')
const { resolve } = require('path')
const Emittery = require('emittery')
const { watchPath } = require('@atom/watcher')
const log = require('./logs')

async function watch (folder, options) {
  const defaultOpts = {
    recursive: false,
    extensions: '*.*',
    pollingThrottle: 1000,
    pollingInterval: 250
  }
  options = { ...defaultOpts, ...options }
  const { extensions } = options
  delete options.extensions

  const ee = new Emittery()

  const absPath = str.trimRight(resolve(folder), '/')
  log.info(`Watching all [${extensions}] from "${absPath}" ...`)

  ee.w = await watchPath(absPath, options, async function (events) {
    for (const ev of events) {
      if (ev.kind !== 'file') {
        continue
      }
      // Absolute to relative path
      const file = str.trimLeft(str.slice(ev.path, absPath.length), '/')
      // At least one extension should match
      if (mm.isMatch(file, extensions)) {
        ee.emit(ev.action, { file, folder: absPath })
      }
    }
  })

  ee.w.onDidError(error => ee.emit('error', error))

  return ee
}

module.exports = watch
