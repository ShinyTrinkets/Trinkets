/**
 * Original code by Azer Koçulu from:
 * https://github.com/azer/english-time
 */

const enUnits = require('./units')

const reOne = /(\d+(?:\.\d+)?)\s?(\w+)/

function reAll () {
  return /(\d+(?:\.\d+)?\s*\w+)/g
}

function findAll (input, units = enUnits) {
  if (typeof input === 'number') {
    return input
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
    all[i] = findOne(all[i], units)
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

function findOne (input, units) {
  let matching, n, unit

  matching = input.split(reOne)
  n = matching[1]
  unit = matching[2]

  if (!units[unit]) return

  return units[unit](parseInt(n))
}

module.exports = findAll
