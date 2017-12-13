#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const cmdOptions = require('minimist-options')

const options = cmdOptions({
  exec: {
    type: 'string',
    alias: 'e'
  },
  // Special option for positional arguments (`_` in minimist)
  arguments: 'string'
})

function main () {
  const args = minimist(process.argv.slice(2), options)

  if (args.exec) {
    require(args.exec)
  }
}

main()
