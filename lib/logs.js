const pino = require('pino')
module.exports = pino({ name: 'T', base: { pid: null, hostname: null } })
