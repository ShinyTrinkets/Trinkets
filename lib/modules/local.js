/*
 * Working with local files and folders.
 * All functions are Async/ Promises.
 */

const fse = require('fs-extra')
const trash = require('trash')
const remove = require('del')

async function localCopy (
  src,
  dest,
  options = { overwrite: false, preserveTimestamps: false }
) {
  /*
   * Move a file and optionally overwrite, if the destination exists.
   */
  const result = await fse.copy(src, dest, options)
  return result
}

async function localMove (src, dest, options = { overwrite: false }) {
  /*
   * Move a file and optionally overwrite, if the destination exists.
   */
  const result = await fse.move(src, dest, options)
  return result
}

async function localTrash (src, options = { glob: false }) {
  /*
   * Move files and folders to the trash.
   * Input a file, list of files, or a glob pattern.
   */
  const result = await trash(src, options)
  return result
}

async function localRemove (src, options = { glob: false }) {
  /*
   * Permanently DELETE a file, list of files, or a glob pattern.
   */
  const result = await remove(src, options)
  return result
}

module.exports = {
  localCopy,
  localMove,
  localTrash,
  localRemove
}
