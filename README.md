# PROJECT: web-components-test

> 实验小组 (**SIX WALNUTS**): 六个核桃

## Features

- 基于原生 `WebComponent` 实现自定义组件
  - 自动内部实现挂载时设置监听器, 卸载元素自动移除监听器
  - 利用代理实现部分属性监听/劫持
- 基于 `typescript`, 带来更加友好的类型系统
- 简单的白天/黑夜主题模式切换
- 暂时就先这样...

## References

- [MDN](https://developer.mozilla.org/)
- [CAN I USE](https://caniuse.com/)

## Notes

- 不支持 ~~IE 全家桶~~ >\_< (您或许可以考虑 Polyfill)
- 您需要使用 `tsc` 进行编译(是的, 这不是一个 webpack 或者 vite 等构建工具的项目)
  - 但项目已经设置好了 `tsconfig.json` 文件, 所以只需简单操作即可(这要求安装好了 node 环境和 typescript 模块)
    ```sh
    # 通过 zsh, bash, powershell, git-bash等 shell进入到项目根目录内(不要使用 cmd)
    cd web-components-test
    tsc -p ./tsconfig.json --watch
    ```
- 因为使用了 ES module 系统(要求同源), 所以需要一个 `dev server`, 比如 vscode 插件: `live server`
- 此外, 因为使用了 sass 来简化编写样式, 所以您可能还需要一个转译插件, 比如 vscode 下的: `Live Sass` 插件
- ~~你他可以直接粘贴到一个 vite 的空 typescript 项目里, 添加 sass 依赖, 直接 npm run dev~~
