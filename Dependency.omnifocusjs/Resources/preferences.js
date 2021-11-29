/* global PlugIn Form flattenedTags */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const syncedPrefs = this.dependencyLibrary.loadSyncedPrefs()

    // get current preferences or set defaults if they don't yet exist
    const markerTag = (syncedPrefs.readString('markerTagID') !== null) ? await this.dependencyLibrary.getPrefTag('markerTag') : null
    const prerequisiteTag = (syncedPrefs.readString('prerequisiteTagID') !== null) ? await this.dependencyLibrary.getPrefTag('prerequisiteTag') : null
    const dependentTag = (syncedPrefs.readString('dependentTagID') !== null) ? await this.dependencyLibrary.getPrefTag('dependentTag') : null
    const updateDates = syncedPrefs.readBoolean('updateDates')
    const updateDeferDates = syncedPrefs.readBoolean('updateDeferDates')
    const addToNote = (syncedPrefs.read('addToNote') !== null) ? syncedPrefs.readBoolean('addToNote') : true

    // create and show form
    const form = new Form()
    const tagNames = flattenedTags.map(t => t.name)
    form.addField(new Form.Field.Option('markerTag', 'Marker Tag', flattenedTags, tagNames, markerTag, null))
    form.addField(new Form.Field.Option('prerequisiteTag', 'Prerequisite Tag', flattenedTags, tagNames, prerequisiteTag, null))
    form.addField(new Form.Field.Option('dependentTag', 'Dependent Tag', flattenedTags, tagNames, dependentTag, null))
    form.addField(new Form.Field.Checkbox('updateDates', 'Set due dates when updating \'Check Prerequisites\' action', updateDates))
    form.addField(new Form.Field.Checkbox('updateDeferDates', 'Set defer dates when updating \'Check Prerequisites\' action', updateDeferDates))
    form.addField(new Form.Field.Checkbox('addToNote', 'Add link to related tasks to notes', addToNote))
    await form.show('Preferences: Dependency', 'OK')

    // save preferences
    syncedPrefs.write('markerTagID', form.values.markerTag.id.primaryKey)
    syncedPrefs.write('prerequisiteTagID', form.values.prerequisiteTag.id.primaryKey)
    syncedPrefs.write('dependentTagID', form.values.dependentTag.id.primaryKey)
    syncedPrefs.write('updateDates', form.values.updateDates)
    syncedPrefs.write('updateDeferDates', form.values.updateDeferDates)
    syncedPrefs.write('addToNote', form.values.addToNote)

    // update notes if this setting has changed
    if (addToNote && !form.values.addToNote) {
      console.log('should be removing all notes')
      this.dependencyLibrary.removeAllNotes()
    }
    else if (!addToNote && form.values.addToNote) {
      console.log('should be adding all notes')
      this.dependencyLibrary.addAllNotes()
    }
  })

  action.validate = function (selection, sender) {
    // always available on Mac
    if (Device.current.mac) return true

    // otherwise only show when nothing is selected
    return selection.tasks.length === 0 && selection.projects.length === 0
  }

  return action
})()
