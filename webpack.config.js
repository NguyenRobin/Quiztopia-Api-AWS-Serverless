const path = require('path');
const slsw = require('serverless-webpack');
// const nodeExternals = require('webpack-node-externals'); // Needed to export db

module.exports = {
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  stats: 'summary',
  resolve: {
    extensions: ['.js', '.mjs', '.json', '.ts'], // TO BE ABLE TO COMPILE src/services/db.ts
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.(ts?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
        ],
      },
    ],
  },
};
