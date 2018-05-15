
import fs from 'fs'
import test from 'ava'
import mock from 'mock-fs'
import proj from '../lib/project'
import parse from '../lib/code'

test('extracting meta headers', async t => {
  mock({
    'source.md': '---\ntrinkets: true\nid: test1\ndb: true\n---\n\n# Hello\n\n'
  })
  const nfo = await proj.projectInfo('source.md')
  t.deepEqual(nfo.data, {
    trinkets: true,
    id: 'test1',
    db: true
  })
  t.is(nfo.content, '\n# Hello\n\n')
  mock.restore()
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
})

test('parsing js and yaml text correctly', async t => {
  const txt = '\n# Hello ?\n\n```js\nfunction n() {\n  return x.a && x.b\n}\n```\n\nSomething in between\n\n```yaml // const x =\na: 1\nb: 2\n```\n\n## Good bye\n'
  const blks = parse.extractBlocks(txt)
  t.deepEqual(blks, ['js\nfunction n() {\n  return x.a && x.b\n}', 'yaml // const x =\na: 1\nb: 2'])
})
