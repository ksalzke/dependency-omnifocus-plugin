/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {

    // configure tags
    const markerTag = await this.dependencyLibrary.getPrefTag('markerTag')

    const deps = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    // get all tasks tagged with 'prerequisite'
    const prereqTasks = Array.from(markerTag.tasks)

    // add all selected tasks as dependents
    prereqTasks.forEach((prereq) => deps.forEach(async (dep) => await this.dependencyLibrary.addDependency(prereq, dep)))

    // show prompt re whether there are more tasks to be linked, if option is set
    const syncedPrefs = this.dependencyLibrary.loadSyncedPrefs()
    if (!syncedPrefs.read('promptForAdditional')) return
    const anotherAlert = new Alert('Add more dependent tasks?', '')
    anotherAlert.addOption('Yes')
    anotherAlert.addOption('No')
    const index = await anotherAlert.show()
    if (index === 0) prereqTasks.forEach(task => task.addTag(markerTag))
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
