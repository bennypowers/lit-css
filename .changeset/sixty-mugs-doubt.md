---
"lit-css-loader": patch
---

Fix `lit-css-loader` options which previously had to be wrapped in an object under `options.options`

### Before
```js
module: {
  rules: [{
    test: /\.css$/,
    loader: 'lit-css-loader',
    options: {
      options: {
        uglify: true,
      },
    },
  }],
},
```

### After
```js
module: {
  rules: [{
    test: /\.css$/,
    loader: 'lit-css-loader',
    options: {
      uglify: true,
    },
  }],
},
```
