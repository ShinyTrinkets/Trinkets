
const Nes = require('nes')

const client = new Nes.Client('ws://127.0.0.1:3000')

const start = async () => {
  await client.connect()

  client.onUpdate = (update) => {
    console.log('WS:', update)
  }
}

start()
