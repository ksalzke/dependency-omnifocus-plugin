/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    // if called externally (from script) generate selection object
    if (typeof selection === 'undefined') {
      selection = document.windows[0].selection
    }

    // mark tasks as complete
    selection.tasks.forEach(task => task.markComplete())
    selection.projects.forEach(project => project.markComplete())

    // check dependents
    await this.dependencyLibrary.updateDependencies()
  })

  action.validate = function (selection, sender) {
    return selection.tasks.length > 0 || selection.projects.length > 0
  }

  return action
})()
