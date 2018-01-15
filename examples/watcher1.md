---
trinkets: true
---

# I am watching files and folders 🗄

```js
trigger('watcher', ['./test/*.js'], actions)
console.log('W1: Watching all test files ...')
```

### How lovely

```js
function actions (path) {
  console.log('File changed ::', path)
}
```

## This is good bye 🛌
