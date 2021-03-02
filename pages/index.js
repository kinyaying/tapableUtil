import React from 'react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'
import mxgraph from './graph.js'
import handleCode from './analysisCode'
import style from './index.less'
const {
  mxGraph,
  mxClient,
  mxEdgeStyle,
  mxUtils,
  mxRubberband,
  mxPerimeter,
  mxConstants,
  mxPoint,
  mxFastOrganicLayout,
} = mxgraph
const initCode =
  'const { SyncBailHook } = require("tapable");\n' +
  'const hook = new SyncBailHook(["name", "age"]);\n' +
  'hook.tap("1", (name, age) => {\n' +
  'console.log(1, name, age);\n' +
  '});\n' +
  'hook.tap("2", (name, age) => {\n' +
  'console.log(2, name, age);\n' +
  'return 2;\n' +
  '});\n' +
  'hook.tap("3", (name, age) => {\n' +
  'console.log(3, name, age);\n' +
  'return 3;\n' +
  '});\n' +
  'hook.call("kinyaying", 10);\n'

export default () => {
  let graphInstance = null
  let monacoInstance = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark',
    scrollBeyondLastLine: false,
    value: [initCode].join('\n'),
    language: 'javascript',
  })
  console.log('index start ')

  function getValue() {
    // 获取编辑器代码
    let code = monacoInstance.getValue()
    // 代码片段 -> ast -> 梳理数据给graph绘制
    let graphData = handleCode(code)
    // 重新绘制图层
    renderGraph(graphInstance, graphData)
  }

  function createGraph(container) {
    // 初始化图层
    let graph = new mxGraph(container)
    graph.setTooltips(true)
    graph.setEnabled(false)
    graph.isCellFoldable = function (cell, collapse) {
      return false
    }
    // 创建样式
    var style = graph.getStylesheet().getDefaultVertexStyle()
    style[mxConstants.STYLE_FONTSIZE] = 16
    style[mxConstants.STYLE_FONTCOLOR] = 'black'
    style[mxConstants.STYLE_STROKECOLOR] = '#808080'
    style[mxConstants.STYLE_FILLCOLOR] = 'white'
    style[mxConstants.STYLE_ROUNDED] = true
    style[mxConstants.STYLE_FONTSTYLE] = 1
    style = graph.getStylesheet().getDefaultEdgeStyle()
    style[mxConstants.STYLE_EDGE] = mxEdgeStyle.ElbowConnector
    style[mxConstants.STYLE_STROKECOLOR] = '#808080'
    style[mxConstants.STYLE_ROUNDED] = true
    // 菱形样式
    style = []
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RHOMBUS
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RhombusPerimeter
    style[mxConstants.STYLE_STROKECOLOR] = '#6c8ebf'
    style[mxConstants.STYLE_FILLCOLOR] = '#dae8fc'
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE
    style[mxConstants.STYLE_FONTSIZE] = 10
    graph.getStylesheet().putCellStyle('step', style)
    // 开始样式
    style = []
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter
    style[mxConstants.STYLE_FILLCOLOR] = '#f8cecc'
    style[mxConstants.STYLE_STROKECOLOR] = '#b85450'
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE
    style[mxConstants.STYLE_FONTSIZE] = 10
    graph.getStylesheet().putCellStyle('start', style)
    // 结束样式
    style = mxUtils.clone(style)
    style[mxConstants.STYLE_FILLCOLOR] = '#d5e8d4'
    style[mxConstants.STYLE_STROKECOLOR] = '#82b366'
    graph.getStylesheet().putCellStyle('end', style)
    return graph
  }

  function renderGraph(graph, data) {
    new mxRubberband(graph)
    var parent = graph.getDefaultParent()
    // 清空画布
    graph.removeCells(graph.getChildVertices(graph.getDefaultParent()))
    // 开始绘制
    graph.getModel().beginUpdate()
    try {
      let x = 200,
        y = 30,
        w = 80,
        h = 50
      let cicleX = 220,
        cicleW = 40,
        cicleH = 40
      // 创建开始点
      var start = graph.insertVertex(
        parent,
        0,
        'start',
        cicleX,
        y,
        cicleW,
        cicleH,
        'start'
      )
      // 创建流程图主体
      var createBody = (stepInfo) => {
        let { stepText, trueLineFn, falseLineFn, nextCell } = stepInfo
        if (typeof trueLineFn !== 'function') {
          let trueLineText = trueLineFn
          trueLineFn = () => trueLineText
        }
        if (typeof falseLineFn !== 'function') {
          let falseLineText = falseLineFn
          falseLineFn = () => falseLineText
        }
        data.taps.forEach((tap, i) => {
          y += 100
          var cell = graph.insertVertex(parent, 0, tap, x, y, w, h)
          var lineText = ''
          if (preCell && preCell.style === 'step') {
            lineText = trueLineFn(i)
            stepList.push({
              step: preCell,
              nextCell: nextCell === 'nextCell' ? cell : nextCell,
              lineText: falseLineFn(i),
            })
          }
          graph.insertEdge(parent, null, lineText, preCell, cell)
          preCell = cell
          if (i !== data.taps.length - 1) {
            y += 100
            var step = graph.insertVertex(
              parent,
              0,
              stepText,
              x - 30,
              y,
              w + 60,
              h,
              'step'
            )

            graph.insertEdge(parent, null, '', preCell, step)
            preCell = step
          }
        })
      }
      // 创建结束点
      var createEndCell = () => {
        y += 100
        var end = graph.insertVertex(
          parent,
          0,
          'end',
          cicleX,
          y,
          cicleW,
          cicleH,
          'end'
        )
        graph.insertEdge(parent, null, '', preCell, end)
        return end
      }
      var stepList = [],
        preCell = start
      switch (data.type) {
        case 'basic':
          data.taps.forEach((tap, i) => {
            y += 100
            var cell = graph.insertVertex(parent, 0, tap, x, y, w, h)
            graph.insertEdge(parent, null, '', preCell, cell)
            preCell = cell
          })
          createEndCell()
          break
        case 'bail':
          createBody({
            stepText: 'result == "undefined"',
            trueLineFn: 'true',
            falseLineFn: 'false',
            nextCell: 'end',
          })
          let end = createEndCell()
          var pointX = 350,
            pointY = 0
          for (let i = stepList.length - 1; i >= 0; i--) {
            var line = graph.insertEdge(
              parent,
              null,
              stepList[i].lineText,
              stepList[i].step,
              end
            )
            line.geometry.points = [new mxPoint(pointX, pointY)]
            pointX += 50
          }
          break
        case 'waterfall':
          createBody({
            stepText: 'result != "undefined"',
            trueLineFn: (i) => {
              return `true\n(arg${i} = result)`
            },
            falseLineFn: (i) => {
              return `false\n(arg${i} = arg${i - 1})`
            },
            nextCell: 'nextCell',
          })
          createEndCell()
          var pointX = 350,
            pointY = 0
          for (let i = 0; i < stepList.length; i++) {
            var line = graph.insertEdge(
              parent,
              null,
              stepList[i].lineText,
              stepList[i].step,
              stepList[i].nextCell
            )
            line.geometry.points = [new mxPoint(pointX, pointY)]
          }
          break
        case 'loop':
          createBody({
            stepText: 'result != "undefined"',
            trueLineFn: 'true',
            falseLineFn: 'false',
            nextCell: 'start',
          })
          createEndCell()
          var pointX = 157,
            pointY = 0
          for (let i = 0; i < stepList.length; i++) {
            var line = graph.insertEdge(
              parent,
              null,
              stepList[i].lineText,
              stepList[i].step,
              start
            )
            line.geometry.points = [new mxPoint(pointX, pointY)]
            pointX += 50
          }
          break
      }
    } catch (e) {
      console.log('err', e)
    } finally {
      graph.getModel().endUpdate()
    }
    return graph
  }
  if (!mxClient.isBrowserSupported()) {
    mxUtils.error('Browser is not supported!', 200, false)
  } else {
    graphInstance = createGraph(document.getElementById('graph'))
  }
  getValue()
  return (
    <>
      <button onClick={getValue} className={style.button}>
        生成流程图
      </button>
    </>
  )
}
