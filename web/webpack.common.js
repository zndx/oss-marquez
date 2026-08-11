const postCssModulesValues = require("postcss-modules-values")
const path = require('path')
const autoprefixer = require('autoprefixer')

module.exports = {
  entry: './src/index.tsx',
  module: {
    rules: [{
        test: /\.css$/,
      use: [{
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules : {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
            }
        }]
      },
      // Images (do NOT include svg here — dual-handled below)
      {
        test: /\.(png|jpe?g|gif)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: '[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name][ext]'
        }
      },
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        test: /\.ico$/,
        type: 'asset/resource'
      },
      // SVG dual mode:
      //   import Icon from './x.svg'        → React component (@svgr)
      //   import url from './x.svg?url'     → file URL (img src)
      // The previous file-loader rule matched ALL svgs first and broke
      // `import { ReactComponent as X }` (undefined → React error #130 white screen).
      {
        test: /\.svg$/i,
        oneOf: [
          {
            resourceQuery: /url/,
            type: 'asset/resource',
            generator: {
              filename: '[name].[hash:8][ext]'
            }
          },
          {
            issuer: /\.[jt]sx?$/,
            use: [{
              loader: '@svgr/webpack',
              options: {
                svgo: false,
                titleProp: true,
                ref: true,
              }
            }]
          },
          {
            type: 'asset/resource',
            generator: {
              filename: '[name].[hash:8][ext]'
            }
          }
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    symlinks: false
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
  }
};
