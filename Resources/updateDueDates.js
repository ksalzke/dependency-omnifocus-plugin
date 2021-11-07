/* global PlugIn Task */
(() => {
  const action = new PlugIn.Action(function (selection, sender) {
    // make sure any old links have been cleared out
    this.dependencyLibrary.updateDependancies()

    // get all dependant tasks
    const deps = this.dependencyLibrary.getLinks().map(link => Task.byIdentifier(link[1]))

    // limit to those with due dates
    const dueDeps = deps.filter(d => d.effectiveDueDate !== null)

    // process each dependent task with due date
    const updateDate = (tasks, date) => {
      const tasksToUpdate = tasks.filter(t => t.effectiveDueDate === null || date < t.effectiveDueDate)
      tasksToUpdate.forEach(t => (t.dueDate = date))
      return tasksToUpdate
    }

    dueDeps.forEach(dep => {
      // get a complete list of prerequisites (including indirect ones) and update the date
      const prereqs = this.dependencyLibrary.getAllPrereqs(dep)
      const updatedPrereqs = updateDate(prereqs, dep.effectiveDueDate)

      // if part of a sequential action group/project, also update due date of preceding actions
      updatedPrereqs.forEach(p => {
        if (p.parent !== null && p.parent.sequential) {
          const siblings = p.parent.children
          const pIndex = siblings.indexOf(p)
          const precedingTasks = siblings.slice(0, pIndex)
          updateDate(precedingTasks, dep.effectiveDueDate)
        }
      })
    })
  })

  action.validate = function (selection, sender) {
    // only valid if nothing is selected - so does not show in share menu
    return selection.tasks.length === 0 && selection.projects.length === 0
  }

  return action
})()
