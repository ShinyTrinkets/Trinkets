
const path = require('path')
const fs = require('fs-extra')
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

async function convertFile (file) {
  /**
   * Extract JS code from Markdown and write it in a separate file,
   * in the same folder.
   */
  let text = await parseFile(file)
  const root = path.dirname(file)
  const jsName = path.basename(file, path.extname(file))
  text = `const trigger = require('../lib/triggers');\n\n` + text
  await fs.outputFile(`${root}/${jsName}.js`, text)
}

async function parseFile (file) {
  const text = await fs.readFile(file, 'utf8')
  return parseString(text).join(';\n\n')
}

function parseString (text) {
  const regex = /^```js$([\w\W]+?)^```$/gm
  const output = []
  let matches
  while (matches = regex.exec(text)) { // eslint-disable-line
    output.push(matches[1].trim())
  }
  return output
}

module.exports = {
  parseFile,
  parseString,
  convertFile,
  convertFolder
}
