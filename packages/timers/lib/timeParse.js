/**
 * Original code by Azer Koçulu from:
 * https://github.com/azer/english-time
 */

const ms = require('ms')

function reAll () {
  return /(\d+(?:\.\d+)?\s*\w+)/g
}

function findAll (input) {
  if (typeof input === 'number') {
    return input
  }

  if (/^\d+$/.test(input)) {
    return parseInt(input)
  }

  let match
  let matching
  let all = []

  input = input.toString().toLowerCase()

  if (!reAll().test(input) || !/\d+[\w\s,]+/.test(input) || !/\w$/.test(input)) {
    throw new Error('Invalid time: "' + input + '"')
  }

  match = reAll()

  while ((matching = match.exec(input))) {
    all.push(matching[1])
  }

  let i = all.length
  while (i--) {
    all[i] = ms(all[i])
  }

  all = all.filter(isNotNil)

  if (all.length === 0) return

  return all.reduce(function (a, b) {
    return a + b
  })
}

function isNotNil (el) {
  return !!el
}

module.exports = findAll
