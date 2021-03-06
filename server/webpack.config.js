const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const package = require('./package.json');
const path = require('path');

module.exports = {
    "mode": "production",
    "entry": [ "./static/index.html", "./src/rastercarve-web.js" ],
    "output": {
        "path": __dirname+'/dist',
        "filename": "bundle.js"
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'static' }
        ]),
        new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            minRatio: 0.8
        }),
        new CompressionPlugin({
            filename: '[path].br[query]',
            algorithm: 'brotliCompress',
            compressionOptions: { level: 11 },
            test: /\.js$|\.css$|\.html$/,
            minRatio: 0.8
        }),
    ],
    optimization: {
        minimize: true
    },
    node: {
        fs: 'empty',
        net: 'empty',
        child_process: 'empty'
    },
    resolve: {
        alias: {
            // Alias the caman js library for imports.
            // Also need to use this pattern with the import loader below
            'caman': 'caman/dist/caman.min'
        },
        modules: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'vendor'),
            path.resolve(__dirname, 'src')
        ]
    },
    module: {
        rules: [
            // We need to help Caman load properly
            // Caman adds to the window object within a browser
            // The import loader ensures it it recognised as browser env not NodeJS
            {
                test: /caman\.min\.js$/,
                use: "imports-loader?exports=>undefined,require=>false,this=>window"
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-env"
                        ]
                    }
                }
            },
            {
                test: /\.(html)$/,
                use: [
                    'file-loader?name=[name].[ext]',
                    'extract-loader',
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true
                        }
                    },
                    {
                        loader: 'string-replace-loader',
                        options: {
                            multiple: [
                                { search: '__VERSION__', replace: package.version, flags: 'g' },
                                { search: '__DATE__',    replace: new Date().toDateString(), flags: 'g' }
                            ]
                        }
                    },
                ]
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8000, // Convert images < 8kb to base64 strings
                        name: 'images/[hash]-[name].[ext]'
                    }
                }]
            }
        ]
    }
}
