//
// Using a top-down approach to code (higher level functions are first)
//
const str = require('voca')
const path = require('path')
const fse = require('fs-extra')
const yaml = require('js-yaml')
const globby = require('globby')
const matter = require('gray-matter')
const objPath = require('object-path')
const { generateHeader, convertBlock } = require('./code')

async function projectInfo (file) {
  /**
   * Extract info about a Trinkets project file.
   */
  let text
  try {
    text = await fse.readFile(file, 'utf8')
  } catch (err) {
    return {
      valid: false,
      error: err.message
    }
  }
  const meta = matter(text, { excerpt: false })
  if (objPath.has(meta, 'data.trinkets') && objPath.get(meta, 'data.id', '').length > 0) {
    objPath.del(meta, 'excerpt')
    return meta
  } else {
    meta.valid = false
    return meta
  }
}

async function convertFolder (folder, extensions = ['*.md']) {
  /**
   * Extract JavaScript code from all valid Markdown files in a folder,
   * and export the code to separate files.
   * Supported minimatch patterns: https://github.com/isaacs/minimatch#usage
   */
  folder = str.trimRight(folder, '/') + '/'
  const files = await globby(extensions.map(e => folder + e), {
    expandDirectories: false
  })
  for (const f of files) {
    await convertFile(f)
  }
}

async function convertFile (file) {
  /**
   * Extract all JavaScript code from a Markdown and write it
   * in a separate file, in the same folder.
   * Ignore files without headers, or with Trinkets = off.
   */
  let text, meta
  text = await fse.readFile(file, 'utf8')
  ;[meta, text] = extractMeta(text)
  const p = path.parse(file)
  const jsPath = `${p.dir}/${p.name}.js`
  // Cleanup associated JS files, from files that contain ID and Trinkets tags
  if (meta && meta.id && Object.keys(meta).indexOf('trinkets') > -1) {
    const exists = await fse.pathExists(jsPath)
    if (exists) {
      await fse.remove(jsPath)
    }
  }
  // Don't convert files without header, or with "trinkets: false"
  if (!meta || !meta.id || !meta.trinkets) {
    return
  }
  const body = convertBlocks(text)
  await fse.outputFile(jsPath, generateHeader(meta) + body)
}

function convertBlocks (text) {
  /*
   * Helper function, converts all raw code blocks to a valid JavaScript string.
   */
  const blocks = []
  for (let b of extractBlocks(text)) {
    blocks.push(convertBlock(b))
  }
  return blocks.join('\n\n')
}

function extractMeta (text) {
  /*
   * Extract the "--- ... ---" header from a text and convert to meta-data.
   */
  const head = text.match(/^---$([\w\W]+?)^---$/m)
  if (!head) {
    return [{}, text]
  }
  const body = str.slice(text, head[0].length)
  try {
    var meta = yaml.safeLoad(head[1])
  } catch (err) {
    console.error('Error loading YAML:', head[1], err)
    return [{}, text]
  }
  for (const k of Object.keys(meta)) {
    if (!k) {
      continue
    }
    // Duplicate lowercase keys
    meta[k.toLowerCase()] = meta[k]
  }
  return [meta, body]
}

function extractBlocks (text) {
  /*
   * Extract all "```js ... ```" like blocks a text.
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
  projectInfo,
  convertFolder,
  convertFile,
  extractMeta,
  extractBlocks,
  convertBlocks
}
