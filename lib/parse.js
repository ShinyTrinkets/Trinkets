
// Using a top-down approach to code (higher level functions are first)

const str = require('voca')
const path = require('path')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const globby = require('globby')
const { generateHeader, convertBlock } = require('./code')

async function convertFolder (folder) {
  /**
   * Extract JavaScript code from all valid Markdown files in a folder,
   * and export the code to separate files.
   * Supported minimatch patterns: https://github.com/isaacs/minimatch#usage
   */
  const files = await globby(folder)
  for (const f of files) {
    await convertFile(f)
  }
}

async function convertFile (file) {
  /**
   * Extract JavaScript code from Markdown and write it
   * in a separate file, in the same folder.
   * Ignores files with Trinkets = off.
   */
  let text, meta
  text = await fs.readFile(file, 'utf8');
  [meta, text] = extractMeta(text)
  // Ignore files without header, or with "trinkets: false"
  if (!meta || !meta.trinkets) {
    return
  }
  const body = convertBlocks(text)
  text = null
  const root = path.dirname(file)
  const jsName = path.basename(file, path.extname(file))
  await fs.outputFile(`${root}/${jsName}.js`, generateHeader(meta) + body)
}

function convertBlocks (text) {
  const blocks = []
  for (let b of extractBlocks(text)) {
    blocks.push(convertBlock(b))
  }
  return blocks.join('\n\n')
}

function extractMeta (text) {
  /*
   * Extract "--- ... ---" meta-data from Markdown files.
   */
  const head = text.match(/^---$(.+?)^---$/ms)
  if (!head) {
    return [{}, text]
  }
  const body = str.slice(text, head[0].length)
  const meta = yaml.safeLoad(head[1])
  for (const k of Object.keys(meta)) {
    if (!k) { continue }
    // Duplicate lowercase keys
    meta[k.toLowerCase()] = meta[k]
  }
  return [meta, body]
}

function extractBlocks (text) {
  /*
   * Extract "```js ... ```" like blocks from Markdown files.
   */
  const regex = /^```(\w+(?:[ ]+\/\/[ ]+[\w\W]+?)?$[\w\W]+?)^```$/gm
  const output = []
  let matches
  while ((matches = regex.exec(text))) {
    output.push(matches[1].trim())
  }
  return output
}

module.exports = {
  convertFolder,
  convertFile,
  extractMeta,
  extractBlocks,
  convertBlocks
}
