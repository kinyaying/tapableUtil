var esprima = require('esprima')
import estraverse from 'estraverse'
import { basicHooks, bailHooks, waterfallHooks, loopHooks } from './constant'
let hooks = {
  list: [],
  map: {},
}
function handleHooks(list, type) {
  list.forEach((i) => {
    hooks.list.push(i)
    hooks.map[i] = type
  })
  return handleHooks
}
handleHooks(basicHooks, 'basic')(bailHooks, 'bail')(
  waterfallHooks,
  'waterfall'
)(loopHooks, 'loop')

function handleCode(code) {
  let ast = esprima.parse(code) // 代码转ast
  let graphData = {
    isTapable: false,
    hookName: '',
    type: '',
    taps: [],
  }

  // 遍历ast语法树
  estraverse.traverse(ast, {
    enter(node) {
      if (node.type === 'VariableDeclaration') {
        node.declarations.forEach((item) => {
          if (!item.init.arguments) return
          let name = item.init.arguments[0].value
          let calleeName = item.init.callee.name
          if (name === 'tapable') {
            graphData.isTapable = true
          }
          if (
            item.init.type === 'NewExpression' &&
            hooks.list.includes(calleeName)
          ) {
            graphData.hookName = calleeName
            graphData.type = hooks.map[calleeName]
          }
        })
      }
      if (node.type === 'ExpressionStatement') {
        if (
          node.expression.type === 'CallExpression' &&
          node.expression.callee.type === 'MemberExpression'
        ) {
          if (node.expression.callee.property.name.indexOf('tap') !== -1) {
            graphData.taps.push(node.expression.arguments[0].value)
          }
        }
      }
    },
    leave(node) {},
  })
  return graphData
}

export default handleCode
