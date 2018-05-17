const str = require('voca')
const path = require('path')
const minimist = require('minimist')
const cmdOptions = require('minimist-options')

const log = require('./lib/logs')
const { convertFolder } = require('./lib/code')
const { projectInfo } = require('./lib/project')
const { startProc } = require('./lib/process')

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
    log.info('Some helpful info ...')
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
