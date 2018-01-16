---
trinkets: false
id: ping-service
log: true
db: true
---

## Service watcher ⌚️

This project watches a list of services, that are running on a list of servers.

This is the list of servers:

```yaml // const servers =
qwant.com: [80, 443]
duckduckgo.com: [80, 443]
```

And this is the actual code that makes the ping-ing:

```js
// This library needs to be installed
const { portCheck } = require('@croqaz/port-scan')

// Run heart-beat every 10 seconds
trigger('timer', '*/10 * * * * *', () => log.info('Heartbeat ♥️'))
// Every 30 seconds, run actions
trigger('timer', '*/30 * * * * *', actions)

async function actions () {
  for (const host of Object.keys(servers)) {
    for (const port of servers[host]) {
      const r = await portCheck({ host, port })
      if (r > 0) {
        log.info(`${host}:${port} ✔︎`)
      } else {
        log.warn(`${host}:${port} ✘`)
      }
      dbSave(host, port, r)
    }
  }
}

// Ensure the ping "table" exists
db.defaults({ ping: [] }).write()

function dbSave (host, port, ms) {
  const time = new Date().getTime()
  db.get('ping')
    .push({ host, port, ms, time })
    .write()
}
```

## Good bye watcher 🛌
