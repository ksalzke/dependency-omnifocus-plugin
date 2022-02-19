/* global PlugIn */
(() => {
  const action = new PlugIn.Action(function (selection, sender) {
    this.dependencyLibrary.updateDueDates()
  })

  action.validate = function (selection, sender) {
    return true
  }

  return action
})()
