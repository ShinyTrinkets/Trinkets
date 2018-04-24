'use strict'
const { execFile } = require('child_process')

function unzip (pathToArchive, target, overwrite = false) {
  console.log('Unzipping from ' + pathToArchive + ' to ' + target)

  const process = new Promise((resolve, reject) => {
    var args = ['x', pathToArchive, '-o' + target, '-r']
    if (overwrite) {
      args.push('-aoa')
    } else {
      args.push('-aos')
    }

    execFile('7z', args, (error, stdout, stderr) => {
      if (error) {
        console.error('stderr', stderr)
        reject(stderr)
        throw error
      }
      resolve('stdout', stdout)
    })
  })

  return process
}

function zip (input, output) {
  console.log('Zipping from ' + input + ' to ' + output)

  const process = new Promise((resolve, reject) => {
    execFile(
      '7z',
      ['a', '-t7z', output, input + '/*', '-r'],
      (error, stdout, stderr) => {
        if (error) {
          console.error('stderr', stderr)
          reject(stderr)
          throw error
        }
        resolve('stdout', stdout)
      }
    )
  })

  return process
}

module.exports = {
  zip,
  unzip
}
