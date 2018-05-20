---
id: splash-screens
trinkets: false
log: true
db: false
---

# Work in progress

Generate splash screen images for Android and iOS mobile apps, starting from very large images.

When developing mobile applications, there's the huge problem of creating lots of splash screens for all the different mobile device sizes out there. This is a [List of Screen Sizes](https://github.com/phonegap/phonegap/wiki/App-Splash-Screen-Sizes).

This Trinkets example can also be modified to allow for different image sizes, to suit your needs.

**Note**: This is definitely a rough way of resizing images - because it's a lot of code.

```js
const Jimp = require('jimp')

// Jimp.read('input.jpg')
// image.resize(800, 800).toFile('input.jpg')
```
