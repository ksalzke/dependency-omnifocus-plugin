/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const fuzzySearchLib = this.dependencyLibrary.getFuzzySearchLib()
    const deps = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    // get all tasks tagged with 'prerequisite'
    const prereqTasks = []

    let prereqForm
            do {
                prereqForm = fuzzySearchLib.remainingTasksFuzzySearchForm()
                prereqForm.addField(new Form.Field.Checkbox('another', 'Add another prerequisite?', false), null)
                // show form
                await prereqForm.show('Add Prerequisite', 'Confirm')

                // processing
                const prereq = prereqForm.values.menuItem
                prereqTasks.push(prereq)
            } while (prereqForm.values.another)

    // add all selected tasks as dependents

    await this.dependencyLibrary.addDependencies(prereqTasks, deps)
  })

  action.validate = async function (selection, sender) {
    return selection.tasks.length > 0 || selection.projects.length > 0
  }

  return action
})()
