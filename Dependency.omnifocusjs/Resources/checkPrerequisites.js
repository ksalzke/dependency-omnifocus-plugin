/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const syncedPrefs = this.dependencyLibrary.loadSyncedPrefs()
    syncedPrefs.readBoolean('updateDates') ? this.dependencyLibrary.updateDueDates() : await this.dependencyLibrary.updateDependencies()
    if (syncedPrefs.readBoolean('updateDeferDates')) this.dependencyLibrary.updateDeferDates()
  })

  action.validate = function (selection, sender) {
    return true
  }

  return action
})()
