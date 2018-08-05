
module.exports = {
  target: 'web',
  entry: './client.js',
  output: {
    filename: './app.js'
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
  }
}
