#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const cmdOptions = require('minimist-options')

const options = cmdOptions({
  help: {
    type: 'string',
    alias: 'h'
  },
  exec: {
    type: 'string',
    alias: 'e'
  },
  folder: {
    type: 'string',
    alias: 'f'
  },
  // Special option for positional arguments (`_` in minimist)
  arguments: 'string'
})

function main () {
  const args = minimist(process.argv.slice(2), options)

  if (typeof args.help === 'string') {
    console.log(process)
    console.log('Help info ...')
    return
  }

  // Require specific JS from the same executable (like fork pid)
  if (args.exec) {
    require(args.exec)
    return
  }

  if (args.folder || args._.length === 1) {
    let folder = args.folder || args._
    folder = folder[0]
    const manager = require('./manager')
    const { convertFolder } = require('./parse')
    // Watch changes in Markdown files
    manager.watchSources(folder)
    // Watch changes in Javascript files
    manager.startProjects(folder)
    // Convert all MD to JS
    setTimeout(convertFolder, 100, folder)
  }
}

main()
