
const str = require('voca')
const path = require('path')
const fs = require('fs-extra')
const yaml = require('js-yaml')
const globby = require('globby')

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

function makeHead (data) {
  /**
   * Create project header from the data provided in the source.
   */
  const head = `
const trinkets = ${JSON.stringify(data)}

const log = require('pino')({ name: '${data.id}' })

const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('${data.id}.json')
const db = require('lowdb')(adapter)

const trigger = require('../lib/triggers');
`
  return head
}

async function convertFile (file) {
  /**
   * Extract JavaScript code from Markdown and write it
   * in a separate file, in the same folder.
   */
  let text, meta, body
  text = await fs.readFile(file, 'utf8');
  [meta, text] = extractMeta(text)
  body = convertBlocks(text)
  text = null
  const root = path.dirname(file)
  const jsName = path.basename(file, path.extname(file))
  await fs.outputFile(`${root}/${jsName}.js`, makeHead(meta) + body)
}

function convertBlocks (text) {
  /**
   * Convert a Markdown text string into pure JavaScript code.
   */
  const conv = []

  for (let b of extractBlocks(text)) {
    if (str.startsWith(b, 'js\n')) {
      // Strip the "js"
      conv.push(str.slice(b, 3) + ';')
    } else if (str.startsWith(b, 'json // ')) {
      let [h, ...t] = b.split('\n')
      // Strip the comment from the first line
      h = str.slice(h, 8) + ' '
      conv.push(h + t.join('\n') + ';')
    } else if (str.startsWith(b, 'yaml // ')) {
      let [h, ...t] = b.split('\n')
      // Strip the comment from the first line
      h = str.slice(h, 8) + ' '
      // Parse the YAML and dump as JSON
      t = yaml.safeLoad(t.join('\n'))
      t = JSON.stringify(t, null, 2)
      conv.push(h + t + ';')
    } else {
      // else, ignore the block and warn
      const type = b.split('\n')[0].trim()
      console.warn(`Unknown block type: "${type}"`)
    }
  }

  return conv.join('\n\n')
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
  extractMeta,
  extractBlocks,
  convertBlocks,
  convertFile,
  convertFolder
}
