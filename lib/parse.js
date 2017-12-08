
const fs = require('fs')

function parseFile (path) {
  const text = fs.readFileSync(path, {encoding: 'utf8'})
  return parseString(text)
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
  parseString
}
