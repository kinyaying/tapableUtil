## 学习 tapable 工具

## 功能介绍

功能参考了正则的可视化网页[regulex](<https://jex.im/regulex/#!flags=&re=%5E(a%7Cb)*%3F%24>)

左侧是代码编辑器，可以输入 tapable 的代码段，点击【生成流程图】按钮，可以生成右侧的流程图。

## 框架

- mxGraph： 绘制流程图
- esprima + estraverse: 解析分析代码
- monaco-editor：代码编辑器
- Umi：基础框架

##

启动

```
npx umi dev
```

构建

```
npx umi build
```
