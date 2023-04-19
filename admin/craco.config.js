const CracoAlias = require('craco-alias');
const publicPath = process.env.REACT_APP_PUBLIC_PATH;
console.log({ publicPath });
module.exports = {
  reactScriptsVersion: 'react-scripts' /* (default value) */,
  webpack: {
    alias: {},
    configure(webpackConfig, { env, paths }) {
      // 配置扩展扩展名
      webpackConfig.resolve.extensions = [...webpackConfig.resolve.extensions, ...['.scss', '.css']];
      // 接入微前端框架qiankun的配置,不接入微前端可以不需要
      // webpackConfig.output.library = `${name}-[name]`;
      // webpackConfig.output.libraryTarget = 'umd';
      // webpackConfig.output.globalObject = 'window';
      // webpackConfig.output.publicPath = '/admin/xia-admin/';
      return webpackConfig;
    },
  },
  plugins: [
    // 重写路径别名
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: '.',
        tsConfigPath: './tsconfig.path.json',
      },
    },
  ],
  devServer: {
    // 本地服务的端口号
    port: 3001,
    // 本地服务的响应头设置
    headers: {
      // 允许跨域
      'Access-Control-Allow-Origin': '*',
    },
  },
};
