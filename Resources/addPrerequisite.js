/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    // configure tags
    const markerTag = await this.dependencyLibrary.getPrefTag('markerTag')

    const dependantTasks = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    // get all tasks tagged with 'prerequisite'
    const prereqTasks = Array.from(markerTag.tasks)

    // add all selected tasks as dependants
    prereqTasks.forEach((prereq) => dependantTasks.forEach(async (dep) => await this.dependencyLibrary.makeDependant(prereq, dep)))
  })

  action.validate = async function (selection, sender) {
    // if marker tag not set return false
    const syncedPrefs = this.dependencyLibrary.loadSyncedPrefs()
    if (syncedPrefs.readString('markerTagID') == null) return false

    const markerTag = await this.dependencyLibrary.getPrefTag('markerTag')

    return (
      (selection.tasks.length > 0 || selection.projects.length > 0) &&
      markerTag.tasks.length >= 1
    )
  }

  return action
})()
