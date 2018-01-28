const str = require('voca')
const mm = require('micromatch')
const { resolve } = require('path')
const Emittery = require('emittery')
const watchr = require('watchr/es2015')

async function watch (folder, options) {
  const ee = new Emittery()

  const defaultOpts = {
    recursive: false,
    extensions: '*.*',
    ignorePaths: true,
    ignoreHiddenFiles: true,
    ignoreCommonPatterns: true
  }

  options = { ...defaultOpts, ...options }
  const { extensions } = options
  delete options.extensions

  const absPath = str.trimRight(resolve(folder), '/')

  function listener (changeType, fullPath, currentStat, previousStat) {
    // At least one extension should match
    // if (mm.isMatch(fullPath, extensions))
    // ee.emit(changeType, { file: file, folder: directory })
    switch (changeType) {
      case 'update':
        console.log('the file', fullPath, 'was updated', currentStat, previousStat)
        break
      case 'create':
        console.log('the file', fullPath, 'was created', currentStat)
        break
      case 'delete':
        console.log('the file', fullPath, 'was deleted', previousStat)
        break
    }
  }
  function next (err) {
    if (err) return console.error('watch failed on', absPath, 'with error', err)
    console.log(`Watching all [${extensions}] from "${absPath}" ...`)
  }

  ee.w = watchr.open(absPath, listener, next)
  ee.w.setConfig(options)
  return ee
}

module.exports = watch
