
import fs from 'fs'
import test from 'ava'
import parse from '../lib/parse'

test('parsing timer MD files correctly', t => {
  const timer1 = parse.parseFile('examples/timer1.md')
  t.deepEqual(timer1,
    [ 'function trigger () {\n  console.log(\'Started Timer\')\n}',
      'function action (initial_value) {\n  console.log(\'Action ::\', initial_value)\n}' ]
  )
  t.pass()
})

test('parsing watcher MD files correctly', t => {
  const watcher1 = parse.parseFile('examples/watcher1.md')
  t.deepEqual(watcher1,
    [ 'var trigger = function () {}',
      'var action = function () {}' ]
  )
  t.pass()
})
