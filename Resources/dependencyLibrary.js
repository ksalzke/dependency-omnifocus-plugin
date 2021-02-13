/* global PlugIn Version ApplyResult Project */
(() => {
  const dependencyLibrary = new PlugIn.Library(new Version('1.0'))

  dependencyLibrary.dependantTag = function () {
    return PlugIn.find('com.KaitlinSalzke.DependencyForOmniFocus')
      .library('dependencyConfig')
      .dependantTag()
  }

  dependencyLibrary.prereqTag = function () {
    return PlugIn.find('com.KaitlinSalzke.DependencyForOmniFocus')
      .library('dependencyConfig')
      .prerequisiteTag()
  }

  dependencyLibrary.getDependants = (task) => {
    const dependantTag = dependencyLibrary.dependantTag()

    const dependantTasks = []

    // use regex to find [DEPENDANT: taskid] matches in the notes and capture task IDs
    const regex = /\[ ?DEPENDANT: omnifocus:\/\/\/task\/(.*?) ?\]/g
    let regexArray = []
    while ((regexArray = regex.exec(task.note)) !== null) {
      // for each captured task ID
      const dependantTaskId = regexArray[1]
      // get the task with that ID
      dependantTag.tasks.forEach(function (task) {
        if (task.id.primaryKey === dependantTaskId) {
          dependantTasks.push(task)
          return ApplyResult.Stop
        }
      })
    }
    return dependantTasks
  }

  dependencyLibrary.getPrereqs = (task) => {
    const prereqTag = dependencyLibrary.prereqTag()

    const prereqTasks = []

    // use regex to find [PREREQUISITE: taskid] matches in the notes and capture task IDs
    const regex = /\[ ?PREREQUISITE: omnifocus:\/\/\/task\/(.*?) ?\]/g
    let regexArray = []
    while ((regexArray = regex.exec(task.note)) !== null) {
      // for each captured task ID
      const prereqTaskId = regexArray[1]
      // get the task with that ID
      prereqTag.tasks.forEach(function (task) {
        if (task.id.primaryKey === prereqTaskId) {
          prereqTasks.push(task)
          return ApplyResult.Stop
        }
      })
    }
    return prereqTasks
  }

  dependencyLibrary.checkDependants = (task) => {
    const dependantTag = dependencyLibrary.dependantTag()

    const prerequisiteTask = task

    // get array of dependant tasks
    const dependantTasks = dependencyLibrary.getDependants(task)

    function removeDependant (dependant, prerequisiteTask) {
      // get task ID of selected task
      const prerequisiteTaskId = prerequisiteTask.id.primaryKey
      // remove the prerequisite tag from the dependant task
      const regexString =
        '[ ?PREREQUISITE: omnifocus:///task/' + prerequisiteTaskId + ' ?].+'
      RegExp.quote = function (str) {
        return str.replace(/([*^$[\]\\(){}|-])/g, '\\$1')
      }
      const regexForNoteSearch = new RegExp(RegExp.quote(regexString))
      dependant.note = dependant.note.replace(regexForNoteSearch, '')
      // check whether any remaining prerequisite tasks listed in the note
      // (i.e. whether all prerequisites completed) - and if so
      if (!/\[ ?PREREQUISITE:/.test(dependant.note)) {
        // if no remaining prerequisites, remove 'Waiting' tag from dependant task
        // (and if project set to Active)
        dependant.removeTag(dependantTag)
        if (dependant.project !== null) {
          dependant.project.status = Project.Status.Active
        }
      }

      // if dependant task has children:
      if (dependant.hasChildren) {
        if (dependant.sequential) {
          removeDependant(dependant.children[0], prerequisiteTask)
        } else {
          dependant.children.forEach((child) => {
            removeDependant(child, prerequisiteTask)
          })
        }
      }
    }

    dependantTasks.forEach((dependantTask) => {
      if (prerequisiteTask.completed) {
        removeDependant(dependantTask, prerequisiteTask)
      }
    })
  }

  dependencyLibrary.checkDependantsForTaskAndAncestors = (task) => {
    const functionLib = PlugIn.find('com.KaitlinSalzke.functionLibrary').library(
      'functionLibrary'
    )

    // get list of all "parent" tasks (up to project level)
    const listOfTasks = [task]
    let parent = functionLib.getParent(task)
    while (parent !== null) {
      listOfTasks.push(parent)
      parent = functionLib.getParent(parent)
    }

    // check this task, and any parent tasks, for dependants
    listOfTasks.forEach((task) => {
      dependencyLibrary.checkDependants(task)
    })
  }

  return dependencyLibrary
})()
