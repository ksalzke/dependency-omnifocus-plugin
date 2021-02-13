/* global PlugIn */
(() => {
  const action = new PlugIn.Action(function (selection, sender) {
    const config = this.dependencyConfig

    // configure tags
    const markerTag = config.markerTag()

    selection.tasks.forEach(function (task) {
      task.addTag(markerTag)
    })
  })

  action.validate = function (selection, sender) {
    return selection.tasks.length > 0
  }

  return action
})()
