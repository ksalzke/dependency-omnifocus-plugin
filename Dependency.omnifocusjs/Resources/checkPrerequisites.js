/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const syncedPrefs = this.dependencyLibrary.loadSyncedPrefs()
    syncedPrefs.readBoolean('updateDates') ? this.dependencyLibrary.updateDueDates() : await this.dependencyLibrary.updateDependencies()
    if (syncedPrefs.readBoolean('updateDeferDates')) this.dependencyLibrary.updateDeferDates()
  })

  action.validate = function (selection, sender) {
    // always available on Mac
    if (Device.current.mac) return true
    
    // only valid if nothing is selected - so does not show in share menu
    return selection.tasks.length === 0 && selection.projects.length === 0
  }

  return action
})()
