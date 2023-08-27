/* global PlugIn */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const fuzzySearchLib = this.dependencyLibrary.getFuzzySearchLib()
    const prereqs = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    // get all tasks tagged with 'prerequisite'
    const depTasks = []

    let depForm
            do {
                depForm = fuzzySearchLib.remainingTasksFuzzySearchForm()
                depForm.addField(new Form.Field.Checkbox('another', 'Add another dependant', false), null)
                // show form
                await depForm.show('Add Dependent', 'Confirm')

                // processing
                const dep = depForm.values.menuItem
                depTasks.push(dep)
            } while (depForm.values.another)

    // add all selected tasks as dependents

    await this.dependencyLibrary.addDependencies(prereqs, depTasks)
  })

  action.validate = async function (selection, sender) {
    return selection.tasks.length > 0 || selection.projects.length > 0
  }

  return action
})()
