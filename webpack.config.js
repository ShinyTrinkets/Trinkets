
const MinifyPlugin = require("babel-minify-webpack-plugin")

module.exports = {
  target: 'node',
  entry: './trinkets.js',
  output: {
    filename: './tk.bundle.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }, {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  plugins: [
    new MinifyPlugin({ mangle: false})
  ]
};
