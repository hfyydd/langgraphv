// webpack.config.js

const path = require('path');

module.exports = {
  entry: [path.join(__dirname, 'app', 'index.tsx'),
  path.join(__dirname, 'src/view', 'tailwind.css')],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: '/node_modules/',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader','postcss-loader'],
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'out', 'app'),
  },
};