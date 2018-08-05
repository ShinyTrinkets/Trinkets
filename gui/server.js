
const Hapi = require('hapi')
const fs = require('fs')
const util = require('util')
const readDir = util.promisify(fs.readdir)
const { projectInfo } = require('../lib/parse')

const FOLDER = 'examples'

const server = new Hapi.Server({
  port: 3000,
  host: '127.0.0.1',
  router: {
    isCaseSensitive: false,
    stripTrailingSlash: true
  }
})

const init = async () => {
  await server.register(require('inert'))
  await server.register(require('nes'))

  server.route({
    method: 'GET',
    path: '/',
    handler: {
      file: 'gui/index.html'
    }
  })

  server.route({
    method: 'GET',
    path: '/app.js',
    handler: {
      file: 'gui/app.js'
    }
  })

  server.route({
    method: 'GET',
    path: '/t',
    handler: async function (request, h) {
      const files = await readDir(FOLDER)
      const scripts = []
      for (let f of files) {
        // Only *.md ??
        if (f.substr(-3) !== '.md') {
          continue
        }
        f = `${FOLDER}/${f}`
        const meta = await projectInfo(f)
        // Check and append to the list of valid scripts
        if (meta.valid !== false) {
          meta.data.file = f
          scripts.push(meta.data)
        }
      }
      return scripts
    }
  })

  await server.start()

  console.log(`Server running at: ${server.info.uri}`)

  let int = 0
  setInterval(() => {
    int += 1
    server.broadcast(int + ' ping')
  }, 5000)
}

process.on('unhandledRejection', err => {
  console.error(err)
  process.exit(1)
})

init()
