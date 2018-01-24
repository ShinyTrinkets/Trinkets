
module.exports = {
  target: 'node',
  entry: './lib/index.js',
  output: {
    filename: 'tk.bundle.js'
  },
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
};
