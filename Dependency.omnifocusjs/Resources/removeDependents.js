/* global PlugIn Form */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    const deps = selected.flatMap(task => this.dependencyLibrary.getDependents(task))
    const uniqueDeps = Array.from(new Set(deps))

    // create and show form
    const form = new Form()
    form.addField(new Form.Field.MultipleOptions('depsToRemove', 'Dependents To Remove', uniqueDeps, uniqueDeps.map(d => d.name), uniqueDeps.length === 1 ? uniqueDeps : []))
    await form.show('Remove Dependent(s)', 'OK')

    form.values.depsToRemove.forEach(dep => selected.forEach(async selected => await this.dependencyLibrary.removeDependency(selected.id.primaryKey, dep.id.primaryKey)))
  })

  action.validate = function (selection, sender) {
    if (selection.tasks.length === 0 && selection.projects.length === 0) return false

    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))
    return selected.some(task => this.dependencyLibrary.getDependents(task).length > 0)
  }

  return action
})()
