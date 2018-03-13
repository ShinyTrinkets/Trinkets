---
id: ping-service
trinkets: true
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
import __ from 'lodash'
// This library needs to be installed
import { portScan } from '@croqaz/port-scan'

// Run heart-beat every 10 seconds
trigger('timer', '*/10 * * * * *', () => log.info('Heartbeat ♥️'))
// Every minute, run actions
trigger('timer', '0 */1 * * * *', actions)

async function actions () {
  for (const [host, ports] of __.entries(servers)) {
    const resp = await portScan({ host, ports })
    const ok = __.isEqual(resp, ports)
    if (ok) {
      log.info(`${host}:${ports} ✔︎`)
    } else {
      log.warn(`${host}:${ports} ✘`)
    }
    dbSave(host, ports, ok)
  }
}

// Ensure the ping "table" exists
db.defaults({ ping: [] }).write()

function dbSave (host, ports, ok) {
  db.get('ping')
    .push({ host, ports, ok, time: __.now() })
    .write()
}
```

## Good bye watcher 🛌
