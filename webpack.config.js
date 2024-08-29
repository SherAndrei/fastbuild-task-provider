const path = require('path');

module.exports = {
  target: 'node', // Ensures Webpack understands this is a Node.js environment
  entry: './src/extension.ts', // Entry file for your extension
  output: {
    path: path.resolve(__dirname, 'out'), // Output directory
    filename: 'extension.js', // Output file
    libraryTarget: 'commonjs2', // Format for Node.js compatibility
    chunkFormat: 'commonjs', // Ensure CommonJS chunk format
  },
  externals: {
    vscode: 'commonjs vscode', // Exclude VSCode's built-in modules
  },
  resolve: {
    extensions: ['.ts', '.js'], // Support for TypeScript and JavaScript files
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Rule for TypeScript files
        exclude: /node_modules/,
        use: 'ts-loader', // Use ts-loader to handle TypeScript files
      },
      {
        test: /\.m?js$/, // Rule for .js and .mjs files (ESM files)
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use Babel to transpile ESM files
          options: {
            presets: ['@babel/preset-env'], // Use preset-env for the latest JavaScript features
          },
        },
      },
    ],
  },
  experiments: {
    outputModule: false,
  },
};
