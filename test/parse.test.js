
import test from 'ava'
import parse from '../lib/parse'

test('extracting a js block correctly', async t => {
  const txt = '\nx = 1\n\n```js\na = 0\n```\n\ny = 2\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['js\na = 0'])
})

test('extracting json and yaml blocks correctly', async t => {
  const txt = '\nx = 1\n\n```json\n[1, 2]\n```\n\ny = 2\n\n```yaml\n- 1\n- 2\n```\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['json\n[1, 2]', 'yaml\n- 1\n- 2'])
})

test('parsing js and json text correctly', async t => {
  const txt = '\n# Hello\n\n```json // const x =\n{"a": 1, "b": 2}\n```\n\nSomething in between\n\n```js\nyes = true\n```\n\n## Good bye\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['json // const x =\n{"a": 1, "b": 2}', 'js\nyes = true'])
  const c = await parse.convertText(txt)
  t.is(c, 'const x = {"a": 1, "b": 2}\n\nyes = true')
})

test('parsing timer MD files correctly', async t => {
  const txt = '\n# Hello timer 🕰\n\nToday is a nice day...\n\n```js\ntrigger(\'timer\', \'*/20 * * * * *\', actions)\n```\n\nTomorrow will be even nicer.\n\n```js\nfunction actions (initial_value) {\n  console.log(\'Action ::\', initial_value)\n}\n```\n\n## Good bye ⏰\n'
  const c = await parse.convertText(txt)
  t.is(c,
    "trigger('timer', '*/20 * * * * *', actions)\n\n" +
    'function actions (initial_value) {\n  console.log(\'Action ::\', initial_value)\n}'
  )
})
