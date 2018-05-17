/* eslint-disable */
const path = require('path')
const proc = require('child_process')
const minimist = require('minimist')
const cmdOptions = require('minimist-options')
const str = require('voca')
const fse = require('fs-extra')
const yaml = require('js-yaml')
const onExit = require('signal-exit')
/* eslint-enable */

const log = require('./logs')
const { startProc } = require('./process')
const { convertFolder } = require('./code')
const { projectInfo } = require('./project')

const options = cmdOptions({
  help: {
    alias: 'h',
    type: 'boolean',
    default: false
  },
  info: {
    alias: 'i',
    type: 'string'
  },
  convert: {
    alias: 'c',
    type: 'string'
  },
  folder: {
    alias: 'f',
    type: 'string'
  },
  // Special option for positional arguments (`_` in minimist)
  arguments: 'string'
})

function main () {
  const args = minimist(process.argv.slice(2), options)

  if (args.help) {
    log.info(process)
    log.info('Some help info ...')
    return
  }

  if (args.info && args.info.length > 0) {
    projectInfo(args.info).then(console.log)
    return
  }

  if (args.convert && args.convert.length > 0) {
    convertFolder(args.convert).then(console.log)
    return
  }

  if (args.folder || args._.length === 1) {
    let folder = (args.folder || args._)[0]
    folder = str.trimRight(folder, '/') + '/'
    convertFolder(folder).then(files => files.map(f => startProc(path.parse(f))))
  }
}

main()
