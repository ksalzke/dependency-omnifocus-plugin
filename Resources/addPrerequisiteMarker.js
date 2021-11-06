/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const markerTag = await this.dependencyLibrary.getPrefTag('markerTag')

    selection.tasks.forEach(function (task) {
      task.addTag(markerTag)
    })

    selection.projects.forEach(function (project) {
      project.task.addTag(markerTag)
    })
  })

  action.validate = function (selection, sender) {
    return selection.tasks.length > 0 || selection.projects.length > 0
  }

  return action
})()
