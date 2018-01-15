
const str = require('voca')
const yaml = require('js-yaml')

// Using a top-down approach to code (higher level functions are first)

function generateHeader (data) {
  /**
   * Create project header from the meta-data provided in the source.
   */
  // Convert Trinkets meta object to a project header code.
  const head = `
// THIS FILE IS GENERATED AUTOMATICALLY by Trinkets
// Do not edit; Your changes will be overwritten!
const trinkets = ${JSON.stringify(data)};
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
    // Strip the "js"
    return str.slice(text, 3) + ';'
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
const log = pinoStream({
  base: null,
  streams: [{ stream: require('fs').createWriteStream('${data.id}.log') }]
});\n`
}

function dbCode (data) {
  return `\nlet FileSync = require('lowdb/adapters/FileSync')
const db = require('lowdb')(new FileSync('${data.id}.json'));\n`
}

module.exports = {
  generateHeader,
  convertBlock
}
