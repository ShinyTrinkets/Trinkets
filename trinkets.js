const str = require('voca')
const path = require('path')
const minimist = require('minimist')
const cmdOptions = require('minimist-options')

const code = require('./lib/code')
const pj = require('./lib/project')
const ps = require('./lib/process')

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
    console.log('Some helpful info ...')
    return
  }

  if (args.info && args.info.length > 0) {
    pj.projectInfo(args.info).then(console.log)
    return
  }

  if (args['list-sources'] && args['list-sources'].length > 0) {
    pj.listProjects(args['list-sources']).then(console.log)
    return
  }

  // Run only 1 file, not all the folder
  if (args['run-one'] && args['run-one'].length > 0) {
    code.convertFile(args['run-one'])
      .then(js => {
        return ps.startProc(path.parse(js))
      })
      .catch(console.error)
    return
  }

  // Run all valid files from the folder
  if (args.folder || args._.length === 1) {
    let folder = (args.folder || args._)[0]
    folder = str.trimRight(folder, '/') + '/'
    code.convertFolder(folder)
      .then(files => files.map(f => ps.startProc(path.parse(f))))
      .catch(console.error)
  }
}

main()
