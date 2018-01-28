const str = require('voca')
const mm = require('micromatch')
const { resolve } = require('path')
const Emittery = require('emittery')
const watcher = require('@atom/watcher')
const log = require('./logs')

async function watchPath (folder, opts) {
  const defaultOpts = {
    recursive: false,
    extensions: '*.*',
    pollingThrottle: 1000,
    pollingInterval: 500
  }
  opts = { ...defaultOpts, ...opts }

  // HACK ? Kinda overkill to use an event emitter on top of another emitter
  // (Emittery on top of Event-kit)
  const ee = new Emittery()

  const absPath = str.trimRight(resolve(folder), '/')

  // Atom Watcher instance
  // Can be destroyed with dispose()
  ee.w = await watcher.watchPath(absPath, opts, async function (events) {
    for (const ev of events) {
      if (ev.kind !== 'file') {
        continue
      }
      // Absolute to relative path
      const file = str.trimLeft(str.slice(ev.path, absPath.length), '/')
      // At least one extension should match
      if (mm.isMatch(file, opts.extensions)) {
        ee.emit(ev.action, { file, folder: absPath })
      }
    }
  })
  // Catches event-kit errors
  ee.w.onDidError(error => ee.emit('error', error))
  log.info(`Watching [${opts.extensions}] from ${ee.w}.`)
  return ee
}

module.exports = {
  watchPath,
  stopWatchers: watcher.stopAllWatchers
}
