import resolvePlugin from "rollup-plugin-node-resolve"; // 帮助寻找node_modules里的包
import babelPlugin from "rollup-plugin-babel"; // rollup 的 babel 插件，ES6转ES5
// import typescript from "@rollup/plugin-typescript"; // 编译TS
import commonjs from "@rollup/plugin-commonjs"; // 将非ES6语法的包转为ES6可用
import { terser } from 'rollup-plugin-terser'; // 压缩包
// import replace from 'rollup-plugin-replace' // 替换待打包文件里的一些变量，如process在浏览器端是不存在的，需要被替换
import serve from 'rollup-plugin-serve';
import { eslint } from 'rollup-plugin-eslint';
import livereload from 'rollup-plugin-livereload';

const isDev = process.env.NODE_ENV !== 'production'

export default [
  {
    input: "src/index.js",
    output: {
      file: isDev ? "dist/getuidata.umd.js" : "dist/getuidata.min.js", // 导出文件
      format: "umd", // 打包文件支持的形式
      name: "GetuiData", // 打包后的全局变量，如浏览器端 window.GetuiData
    },
    plugins: [
      // 热更新 默认监听根文件夹
      isDev && livereload({
        watch: ['dist', 'src', 'examples']
      }),
      // 本地服务器
      isDev && serve({
        open: true, // 自动打开页面
        port: 8000,
        openPage: '/examples/index.html', // 打开的页面
        contentBase: ''
      }),
      // typescript(),
      commonjs(),
      eslint({
        throwOnError: true,
        throwOnWarning: true,
        include: ['src/**'],
        exclude: ['node_modules/**']
      }),
      babelPlugin({
        exclude: "node_modules/**",
        runtimeHelpers: true, // 使plugin-transform-runtime生效
      }),
      resolvePlugin(),
      // replace({
      //   'process.env.NODE_ENV': JSON.stringify(env)
      // }),
      !isDev && terser()
    ],
  }
]