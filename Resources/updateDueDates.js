/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    // config
    const prereqTag = await this.dependencyLibrary.getPrefTag('dependantTag')

    const dependencyLibrary = this.dependencyLibrary

    prereqTag.remainingTasks.forEach((task) => {
      // for each remaining task tagged as a prerequisite...

      // recursively get directly dependant tasks (and tasks dependent on those tasks, etc)
      const dependentTasks = []
      const allDeps = preReq => {
        const depTasks = dependencyLibrary.getDependants(preReq)
        depTasks.forEach(dep => {
          dependentTasks.push(dep)
          if (dep.tags.includes(prereqTag)) {
            allDeps(dep)
          }
        })
      }
      allDeps(task)

      // find earliest due date of dependent tasks
      let earliestDue = null
      dependentTasks.forEach((dep) => {
        if (dep.effectiveDueDate !== null && (dep.effectiveDueDate < earliestDue || earliestDue === null)) {
          earliestDue = dep.effectiveDueDate
        }
      })

      if (
        (earliestDue <= task.effectiveDueDate && earliestDue !== null) ||
        task.effectiveDueDate == null
      ) {
        // if earlier than task's current effective due date, use earlier date
        if (earliestDue < task.effectiveDueDate) {
          task.dueDate = earliestDue
        }
        // if prerequisite task is part of a sequential action group/project, also update due date of preceding actions
        if (task.parent !== null && task.parent.sequential) {
          const siblings = task.parent.children
          for (let i = 0; i < siblings.indexOf(task); i++) {
            const sibling = siblings[i]
            if (sibling.effectiveDueDate === null || earliestDue < sibling.effectiveDueDate) {
              sibling.dueDate = earliestDue
            }
          }
        }
      }
    })
  })

  action.validate = function (selection, sender) {
    // only valid if nothing is selected - so does not show in share menu
    return selection.tasks.length === 0 && selection.projects.length === 0
  }

  return action
})()
