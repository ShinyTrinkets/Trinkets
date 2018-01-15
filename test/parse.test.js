
import test from 'ava'
import parse from '../lib/parse'

test('extracting meta headers', t => {
  const txt = '---\nTrinkets: true\nid: test1\nDB: true\n---\n\n# Hello\n\n'
  const [meta, body] = parse.extractMeta(txt)
  t.deepEqual(meta, {
    Trinkets: true,
    trinkets: true,
    id: 'test1',
    DB: true,
    db: true
  })
  t.is(body, '\n\n# Hello\n\n')
})

test('extracting a js block correctly', t => {
  const txt = '\nx = 1\n\n```js\na = 0\n```\n\ny = 2\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['js\na = 0'])
})

test('extracting json and yaml blocks correctly', t => {
  const txt = '\nx = 1\n\n```json\n[1, 2]\n```\n\ny = 2\n\n```yaml\n- 1\n- 2\n```\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['json\n[1, 2]', 'yaml\n- 1\n- 2'])
})

test('parsing js and json text correctly', async t => {
  // block types should be case insensitive
  const txt = '\n# Hello !\n\n```Json // const x =\n{"a": 1, "b": 2}\n```\n\nSomething in between\n\n```JS\nyes = true\n```\n\n## Good bye\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['Json // const x =\n{"a": 1, "b": 2}', 'JS\nyes = true'])
  const c = parse.convertBlocks(txt)
  t.is(c, 'const x = {"a": 1, "b": 2};\n\nyes = true;')
})

test('parsing js and yaml text correctly', async t => {
  const txt = '\n# Hello ?\n\n```js\nfunction () {\n  return x.a && x.b\n}\n```\n\nSomething in between\n\n```yaml // const x =\na: 1\nb: 2\n```\n\n## Good bye\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['js\nfunction () {\n  return x.a && x.b\n}', 'yaml // const x =\na: 1\nb: 2'])
  const c = parse.convertBlocks(txt)
  t.is(c, 'function () {\n  return x.a && x.b\n};\n\nconst x = {\n  "a": 1,\n  "b": 2\n};')
})

test('parsing timer MD files correctly', async t => {
  const txt = '\n# Hello timer 🕰\n\nToday is a nice day...\n\n```js\ntrigger(\'timer\', \'*/20 * * * * *\', actions)\n```\n\nTomorrow will be even nicer.\n\n```js\nfunction actions (initial_value) {\n  console.log(\'Action ::\', initial_value)\n}\n```\n\n## Good bye ⏰\n'
  const c = parse.convertBlocks(txt)
  t.is(c,
    "trigger('timer', '*/20 * * * * *', actions);\n\n" +
    'function actions (initial_value) {\n  console.log(\'Action ::\', initial_value)\n};'
  )
})
