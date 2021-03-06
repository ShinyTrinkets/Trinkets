//
// Generate Javascript source code
// Using a top-down approach to code (higher level functions are first)
//
const str = require('voca')
const fse = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const { projectInfo, listProjects } = require('./project')

async function convertFolder (folder) {
  /**
   * Extract "code" from all valid "source" files in a folder,
   * and export the code to separate files.
   *
   * @param {String} folder
   * @return {[String]} files
   */
  folder = str.trimRight(folder, '/') + '/'
  let files = await listProjects(folder)
  files = await Promise.all(files.map(f => convertFile(folder + f)))
  return files.filter(f => !!f)
}

async function convertFile (file) {
  /**
   * Extract all blocks of code from a "source" file and write it
   * in a separate file, in the same folder.
   * Ignore files without headers, or with Trinkets = false.
   */
  const data = await projectInfo(file)
  // Don't convert files with invalid headers, or content
  if (!data.valid) {
    console.error(data.error)
    return false
  }
  const p = path.parse(file)
  const jsPath = `${p.dir}/${p.name}.js`
  const blocks = extractBlocks(data.content)
    .map(b => convertBlock(b))
    .join('\n\n')
  const code = generateHeader(data.data) + blocks
  await fse.outputFile(jsPath, code)
  return jsPath
}

function extractBlocks (text) {
  /**
   * Extract all ```js ... ``` like blocks of code.
   */
  const regex = /^```(\w+(?:[ ]+\/\/[ ]+[\w\W]+?)?$[\w\W]+?)^```$/gm
  const output = []
  let matches
  while ((matches = regex.exec(text))) {
    output.push(matches[1].trim())
  }
  return output
}

function generateHeader (data) {
  /**
   * Create project header from the meta-data provided in the source.
   */
  // Convert Trinkets meta object to a project header code.
  const head = `
// THIS FILE IS GENERATED AUTOMATICALLY by Trinkets
// Don't edit; Your changes will be overwritten!
const trinkets = ${JSON.stringify(data)};
let fse = require('fs-extra')
${data.log ? logCode(data) : ''}${data.db ? dbCode(data) : ''}
const trigger = require('../lib/triggers');
`
  return head
}

function convertBlock (text) {
  // Convert a raw block string into valid JavaScript code.
  // Block types: js, JSON, YAML, etc
  // Future TODO: register extension -> converter function.
  let [h, ...t] = text.split('\n')
  h = h.toLowerCase()

  if (h === 'js') {
    // Strip the "js" and convert text
    text = str.slice(text, 3).replace(/;+/g, ';')
    return text + ';'
  } else if (str.startsWith(h, 'json // ')) {
    // Strip the comment from the first line
    h = str.slice(h, 8) + ' '
    return h + t.join('\n') + ';'
  } else if (str.startsWith(h, 'yaml // ')) {
    // Strip the comment from the first line
    h = str.slice(h, 8) + ' '
    // Parse the YAML and dump as JSON
    t = yaml.safeLoad(t.join('\n'))
    t = JSON.stringify(t, null, 2)
    return h + t + ';'
  } else {
    // else, ignore the block and warn
    const type = text.split('\n')[0].trim()
    console.warn(`Unknown block type: "${type}"`)
  }
}

function logCode (data) {
  return `\nlet pinoStream = require('pino-multi-stream')
fse.ensureDirSync('logs/')
const log = pinoStream({
  base: null,
  streams: [{ stream: require('fs').createWriteStream('logs/${data.id}.log') }]
});\n`
}

function dbCode (data) {
  return `\nlet FileSync = require('lowdb/adapters/FileSync')
fse.ensureDirSync('dbs/')
const db = require('lowdb')(new FileSync('dbs/${data.id}.json'));\n`
}

module.exports = {
  convertFolder,
  convertFile,
  extractBlocks,
  generateHeader,
  convertBlock
}
