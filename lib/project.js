//
// This is the Source Manager
// It's basically a list of functions that deal with "sources" from a provided folder
// How the "sources" are created, updated or deleted is outside the scope of this lib
// Creating and updating can be done in a normal Markdown/ Text editor
// Deleting can be done from command line, file explorer, etc
//
const fs = require('fs')
const fse = require('fs-extra')
const str = require('voca')
const mem = require('mem')
const mm = require('micromatch')
const matter = require('gray-matter')
const { promisify } = require('util')
const readDir = promisify(fs.readdir)

const TK_SOURCES = '*.md'
const CACHE_AGE = 555

async function listProjects (folder) {
  /**
   * List all supported source files from the provided folder.
   * Supported micromatch patterns:
   * - https://github.com/micromatch/micromatch#matching-features
   *
   * @param {String} folder
   * @return {[String]} files
   */
  folder = str.trimRight(folder, '/') + '/'
  const allFiles = (await readDir(folder)) || []
  return allFiles.filter(f => mm.isMatch(f, TK_SOURCES))
}

// Cache the list of projects, so listing projects
// doesn't touch the HDD for every call
const memListProjects = mem(listProjects, { maxAge: CACHE_AGE })

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
  hasValidHeader,
  memListProjects
}
