---
trinkets: true
---

# Hello timer 🕰

Today is a nice day...

```js
// Every 30 seconds, run actions
trigger('timer', '*/30 * * * * *', actions)
```

Tomorrow will be even nicer.

```js
function actions (initial_value) {
  console.log('Action ::', initial_value)
}
```

## Good bye ⏰
