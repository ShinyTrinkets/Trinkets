
const str = require('voca')
const path = require('path')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const globby = require('globby')

async function convertFolder (folder) {
  /**
   * Extract JS code from all Markdown files in a folder,
   * and export the code to separate files.
   * Supported minimatch patterns: https://github.com/isaacs/minimatch#usage
   */
  const files = await globby(folder)
  for (const f of files) {
    await convertFile(f)
  }
}

const head = `const pino = require('pino')
const lowdb = require('lowdb')
const trigger = require('../lib/triggers');
`

async function convertFile (file) {
  /**
   * Extract JS code from Markdown and write it in a separate file,
   * in the same folder.
   */
  let text = await fs.readFile(file, 'utf8')
  const body = await convertText(text)
  text = null
  const root = path.dirname(file)
  const jsName = path.basename(file, path.extname(file))
  await fs.outputFile(`${root}/${jsName}.js`, head + body)
}

async function convertText (text) {
  const conv = []
  for (let b of extractBlocks(text)) {
    if (str.startsWith(b, 'js\n')) {
      // Strip the "js"
      conv.push(str.slice(b, 3))
    } else if (str.startsWith(b, 'json // ')) {
      let [h, ...t] = b.split('\n')
      // Strip the comment from the first line
      h = str.slice(h, 8) + ' '
      conv.push(h + t.join('\n'))
    } else if (str.startsWith(b, 'yaml // ')) {
      let [h, ...t] = b.split('\n')
      // Strip the comment from the first line
      h = str.slice(h, 8) + ' '
      // Parse the YAML and dump as JSON
      t = yaml.safeLoad(t.join('\n'))
      t = JSON.stringify(t, null, 2)
      conv.push(h + t)
    }
    // else, ignore
  }
  return conv.join('\n\n')
}

function extractBlocks (text) {
  /*
   * Extract ```js ... ``` like blocks from Markdown files.
   */
  const regex = new RegExp(
    '^```(\\w+(?: // [\\w\\W]+?)?$[\\w\\W]+?)^```$',
    'gm'
  )
  const output = []
  let matches
  while ((matches = regex.exec(text))) {
    output.push(matches[1].trim())
  }
  return output
}

module.exports = {
  extractBlocks,
  convertText,
  convertFile,
  convertFolder
}
