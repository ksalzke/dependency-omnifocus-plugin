/* global PlugIn Form */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))

    const prereqs = selected.flatMap(task => this.dependencyLibrary.getPrereqs(task))
    const uniquePrereqs = Array.from(new Set(prereqs))

    const choosePrereq = async () => {
      const form = new Form()
      form.addField(new Form.Field.Option('prereqToGoTo', 'Prerequisite To Go To', uniquePrereqs, uniquePrereqs.map(p => p.name), null))
      await form.show('Go To Prerequisite', 'OK')
      return form.values.prereqToGoTo
    }

    const prereq = uniquePrereqs.length === 1 ? uniquePrereqs[0] : await choosePrereq()
    URL.fromString('omnifocus:///task/' + prereq.id.primaryKey).call(() => {})
  })

  action.validate = function (selection, sender) {
    const selected = Array.from(selection.tasks).concat(Array.from(selection.projects).map(p => p.task))
    return (selected.length === 1) && (this.dependencyLibrary.getPrereqs(selected[0]).length > 0)
  }

  return action
})()
