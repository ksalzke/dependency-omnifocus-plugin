/* global PlugIn Project */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    // configure tags
    const markerTag = await this.dependencyLibrary.getPrefTag('markerTag')
    const prerequisiteTag = await this.dependencyLibrary.getPrefTag('prerequisiteTag')
    const dependantTag = await this.dependencyLibrary.getPrefTag('dependantTag')

    const dependantTasks = selection.tasks
    selection.projects.forEach(project => {
      dependantTasks.push(project.task)
    })

    function makeDependant (dep, prereq) {
      const pId = prereq.id.primaryKey
      dep.addTag(dependantTag) // add waiting tag to selected note
      dep.note =
        '[ PREREQUISITE: omnifocus:///task/' +
        pId +
        ' ] ' +
        prereq.name +
        '\n\n' +
        dep.note // prepend prerequisite details to selected note

      if (dep.project !== null) {
        dep.project.status = Project.Status.OnHold
      }

      // if dependant task has children:
      if (dep.hasChildren) {
        if (dep.sequential) {
          makeDependant(dep.children[0], prereq)
        } else {
          dep.children.forEach((child) => {
            makeDependant(child, prereq)
          })
        }
      }
    }

    // GET PREREQUISITE
    // get all tasks tagged with 'prerequisite'
    const prereqTasks = markerTag.tasks

    prereqTasks.forEach((prereqTask) => {
      dependantTasks.forEach(dependantTask => {
        // DEAL WITH SELECTED (DEPENDENT) NOTE
        makeDependant(dependantTask, prereqTask)

        // DEAL WITH PREREQUISITE TASK
        prereqTask.addTag(prerequisiteTag) // add tag to prerequisite
        prereqTask.note =
          '[ DEPENDANT: omnifocus:///task/' +
          dependantTask.id.primaryKey +
          ' ] ' +
          dependantTask.name +
          '\n\n' +
          prereqTask.note // prepend dependant details to prerequisite note
      })
      prereqTask.removeTag(markerTag) // remove marker tag used for processing;
    })
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
