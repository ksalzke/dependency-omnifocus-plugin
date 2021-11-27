/* global PlugIn Form */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    const prereqs = selected.flatMap(task => this.dependencyLibrary.getPrereqs(task))
    const uniquePrereqs = Array.from(new Set(prereqs))

    // create and show form
    const form = new Form()
    form.addField(new Form.Field.MultipleOptions('prereqsToRemove', 'Prerequisites To Remove', uniquePrereqs, uniquePrereqs.map(p => p.name), uniquePrereqs.length === 1 ? uniquePrereqs : []))
    await form.show('Remove Prerequisite(s)', 'OK')

    form.values.prereqsToRemove.forEach(prereq => selected.forEach(async selected => await this.dependencyLibrary.removeDependency(prereq.id.primaryKey, selected.id.primaryKey)))
  })

  action.validate = function (selection, sender) {
    if (selection.tasks.length === 0 && selection.projects.length === 0) return false

    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))
    return selected.some(task => this.dependencyLibrary.getPrereqs(task).length > 0)
  }

  return action
})()
