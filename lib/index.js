const minimist = require('minimist')
const cmdOptions = require('minimist-options')
const str = require('voca')
const path = require('path')
const fse = require('fs-extra')
const globby = require('globby')
const yaml = require('js-yaml')
const proc = require('child_process')
const onExit = require('signal-exit')

const log = require('./logs')
const manager = require('./manager')
const { projectInfo, convertFolder } = require('./parse')

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
    const folder = (args.folder || args._)[0]
    // Watch changes in Markdown files
    manager.watchSources(folder)
    // Watch changes in Javascript files
    manager.startProjects(folder)
    // Convert all MD to JS with a delay
    setTimeout(convertFolder, 250, folder)
  }
}

main()
