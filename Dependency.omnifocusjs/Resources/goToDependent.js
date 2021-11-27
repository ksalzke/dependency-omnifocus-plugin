/* global PlugIn Form */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    const deps = selected.flatMap(task => this.dependencyLibrary.getDependents(task))
    const uniqueDeps = Array.from(new Set(deps))

    const chooseDep = async () => {
      const form = new Form()
      form.addField(new Form.Field.Option('depToGoTo', 'Dependent To Go To', uniqueDeps, uniqueDeps.map(d => d.name), null))
      await form.show('Go To Dependent', 'OK')
      return form.values.depToGoTo
    }

    const dep = uniqueDeps.length === 1 ? uniqueDeps[0] : await chooseDep()
    URL.fromString('omnifocus:///task/' + dep.id.primaryKey).call(() => {})
  })

  action.validate = function (selection, sender) {
    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))
    return (selected.length === 1) && (this.dependencyLibrary.getDependents(selected[0]).length > 0)
  }

  return action
})()
