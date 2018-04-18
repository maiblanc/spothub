module.exports = {
  mode: "development",
  entry: "./mock/src/script/main.js",
  output: {
    filename: "bundle.js"
  },

  module: {
    loaders: [
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015']
      }
    ]
  },

  devtool: 'source-map',
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};