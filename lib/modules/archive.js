
const fs = require('fs')
const fse = require('fs-extra')
const isGlob = require('is-glob')
const archiver = require('archiver')
const decompress = require('decompress')

async function compress (src, dest, options = {}) {
  /**
   * Compress a file, a folder, or a glob pattern, into an archive file.
   * Supported archive file formats: ZIP and TAR.GZ.
   */
  const opts = { type: 'zip', level: 6 } //, overwrite: true }
  options = { ...opts, ...options }

  if (options.type === 'tar') {
    options.gzip = true
    options.gzipOptions = { level: options.level }
  } else {
    options.zlib = { level: options.level }
  }

  delete options.level

  const output = fs.createWriteStream(dest)
  const archive = archiver(options.type, options)

  output.on('close', function() {
    console.log('Done.', archive.pointer() + ' total bytes.')
  })

  // Good practice to catch errors explicitly
  archive.on('error', function(err) {
    console.error(err)
  })

  // Pipe archive data to the file
  archive.pipe(output)

  if (isGlob(src)) {
    archive.glob(src)
  } else {

    try {
      var stat = fs.statSync(src)
      if (stat.isDirectory()) {
        archive.directory(src)
      } else if (stat.isFile()) {
        archive.append(fs.createReadStream(src), { name: src })
      }
    } catch (err) {
      console.error(err.message)
    }
  }

  // Write and finalize
  archive.finalize()
}

module.exports = {
  compress,
  decompress
}
