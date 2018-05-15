//
// This is the Source Manager
// It's basically a list of functions that deal with "sources" from a provided folder
// How the "sources" are created, updated or deleted is outside the scope of this lib
// Creating and updating can be done in a normal Markdown/ Text editor
// Deleting can be done from command line, file explorer, etc
//
const fs = require('fs')
const util = require('util')
const fse = require('fs-extra')
const mm = require('micromatch')
const matter = require('gray-matter')
const readDir = util.promisify(fs.readdir)

const TK_SOURCES = '*.md'

async function listProjects (folder) {
  /**
   * List all supported source files from the provided folder.
   * Supported micromatch patterns: https://github.com/micromatch/micromatch#matching-features
   */
  const allFiles = (await readDir(folder)) || []
  return allFiles.filter(f => mm.isMatch(f, TK_SOURCES))
}

async function projectInfo (file) {
  /**
   * Extract info about a Trinkets source file.
   */
  let text, meta
  try {
    text = await fse.readFile(file, 'utf8')
  } catch (err) {
    return {
      valid: false,
      error: err.message
    }
  }
  try {
    meta = matter(text, { excerpt: false })
  } catch (err) {
    return {
      valid: false,
      error: err.message
    }
  }
  if (hasValidHeader(meta)) {
    delete meta.excerpt
    meta.valid = true
    return meta
  } else {
    meta.valid = false
    meta.error = 'file headers are invalid'
    return meta
  }
}

function hasValidHeader (meta) {
  /**
   * A source header is valid only if it contains:
   * trinkets: true | false
   * id: a non-empty string, or number
   */
  let data
  if (typeof meta.data === 'object') {
    data = meta.data
  } else {
    data = meta
  }
  if (typeof data.trinkets !== 'boolean') {
    return false
  }
  if (typeof data.id !== 'string' && typeof data.id !== 'number') {
    return false
  }
  if (data.id.length < 1) {
    return false
  }
  return true
}

module.exports = {
  projectInfo,
  listProjects,
  hasValidHeader
}
