const { TYPE_PREFIX_COCKPIT } = require('./constants')

const {
  createNodeFactory,
  generateNodeId,
} = require('gatsby-node-helpers').default({
  typePrefix: TYPE_PREFIX_COCKPIT,
})
const hash = require('string-hash')

function traverse (jsonObj, images) {
  if (jsonObj !== null && typeof jsonObj == 'object') {
    Object.entries(jsonObj).forEach(([key, value]) => {
      // key is either an array index or object key
      if (key === 'path') {
        if (images[jsonObj[key]] !== null) {
          const imageField = jsonObj
          const path = jsonObj[key]

          // imageField.value___NODE = images[path].id
          imageField.path = images[path].localPath
        } else {
          jsonObj[key] = null
        }
      } else {
        traverse(value, images)
      }
    })
  } else {
    // jsonObj is a number or string
  }
}

module.exports = class LayoutNodeFactory {
  constructor (createNode, images) {
    this.createNode = createNode
    this.images = images
  }

  create (layout) {
    traverse(layout, this.images)

    const stringifiedLayout = JSON.stringify(layout)
    const partialId = `${hash(stringifiedLayout)}`

    this.createNode(
      createNodeFactory('LayoutNode', node => {
        node.internal.mediaType = 'application/json'
        node.internal.content = stringifiedLayout
        delete node.cockpitId

        return node
      })({ id: partialId })
    )

    return generateNodeId('LayoutNode', partialId)
  }
}
