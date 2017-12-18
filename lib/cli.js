#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const cmdOptions = require('minimist-options')

const options = cmdOptions({
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

  // Require specific JS from the same executable (like fork pid)
  if (args.exec) {
    console.log('Launching ::', args.exec)
    require(args.exec)
    return
  }

  if (args.folder || args._.length === 1) {
    const folder = args.folder || args._
    console.log('Start Trinkets in folder ::', folder)
    // ...
  }
}

main()
