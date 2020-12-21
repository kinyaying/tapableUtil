import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin'

export default {
  chainWebpack: (memo) => {
    // 更多配置 https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    memo.plugin('monaco-editor-webpack-plugin').use(MonacoWebpackPlugin, [
      // 按需配置
      { languages: ['javascript'] },
    ])
    return memo
  },
  publicPath: '/tapableUtil/dist/',
}
