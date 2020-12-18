/**
 * 将mxgraph挂载在window上
 */
import mx from '../node_modules/mxgraph/javascript/dist/build.js'
const mxgraph = mx({
  mxImageBasePath: './pages/images',
  mxBasePath: './pages',
})

// decode bug https://github.com/jgraph/mxgraph/issues/49
window.mxGraph = mxgraph.mxGraph
window.mxGraphModel = mxgraph.mxGraphModel
window.mxEditor = mxgraph.mxEditor
window.mxGeometry = mxgraph.mxGeometry
window.mxDefaultKeyHandler = mxgraph.mxDefaultKeyHandler
window.mxDefaultPopupMenu = mxgraph.mxDefaultPopupMenu
window.mxStylesheet = mxgraph.mxStylesheet
window.mxDefaultToolbar = mxgraph.mxDefaultToolbar
export default mxgraph
