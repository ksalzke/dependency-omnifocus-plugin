/* global PlugIn Project */
(() => {
  const action = new PlugIn.Action(function (selection, sender) {
    const config = this.dependencyConfig

    // configure tags
    const markerTag = config.markerTag()
    const prerequisiteTag = config.prerequisiteTag()
    const dependantTag = config.dependantTag()

    const task = selection.tasks[0] || selection.projects[0].task

    function makeDependant (task, prereqTask) {
      const prereqTaskId = prereqTask.id.primaryKey
      task.addTag(dependantTag) // add waiting tag to selected note
      task.note =
        '[ PREREQUISITE: omnifocus:///task/' +
        prereqTaskId +
        ' ] ' +
        prereqTask.name +
        '\n\n' +
        task.note // prepend prerequisite details to selected note

      if (task.project !== null) {
        task.project.status = Project.Status.OnHold
      }

      // if dependant task has children:
      if (task.hasChildren) {
        if (task.sequential) {
          makeDependant(task.children[0], prereqTask)
        } else {
          task.children.forEach((child) => {
            makeDependant(child, prereqTask)
          })
        }
      }
    }

    // GET PREREQUISITE
    // get all tasks tagged with 'prerequisite'
    const prereqTasks = markerTag.tasks

    prereqTasks.forEach((prereqTask) => {
      // DEAL WITH SELECTED (DEPENDENT) NOTE
      makeDependant(task, prereqTask)

      // DEAL WITH PREREQUISITE TASK
      prereqTask.addTag(prerequisiteTag) // add tag to prerequisite
      prereqTask.note =
        '[ DEPENDANT: omnifocus:///task/' +
        task.id.primaryKey +
        ' ] ' +
        task.name +
        '\n\n' +
        prereqTask.note // prepend dependant details to prerequisite note
      prereqTask.removeTag(markerTag) // remove marker tag used for processing;
    })
  })

  action.validate = function (selection, sender) {
    return (
      (selection.tasks.length === 1 || selection.projects.length === 1) &&
      this.dependencyConfig.markerTag().tasks.length >= 1
    )
  }

  return action
})()
