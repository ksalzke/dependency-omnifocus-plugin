/* global PlugIn Form flattenedTags */
(() => {
  const action = new PlugIn.Action(async function (selection, sender) {
    const syncedPrefs = this.dependencyLibrary.loadSyncedPrefs()

    // get current preferences or set defaults if they don't yet exist
    const markerTag = (syncedPrefs.readString('markerTagID') !== null) ? await this.dependencyLibrary.getMarkerTag() : null
    const prerequisiteTag = (syncedPrefs.readString('prerequisiteTagID') !== null) ? await this.dependencyLibrary.prereqTag() : null
    const dependantTag = (syncedPrefs.readString('dependantTagID') !== null) ? await this.dependencyLibrary.dependantTag() : null

    // create and show form
    const form = new Form()
    const tagNames = flattenedTags.map(t => t.name)
    form.addField(new Form.Field.Option('markerTag', 'Marker Tag', flattenedTags, tagNames, markerTag, null))
    form.addField(new Form.Field.Option('prerequisiteTag', 'Prerequisite Tag', flattenedTags, tagNames, prerequisiteTag, null))
    form.addField(new Form.Field.Option('dependantTag', 'Dependant Tag', flattenedTags, tagNames, dependantTag, null))
    await form.show('Preferences: Dependency', 'OK')

    // save preferences
    syncedPrefs.write('markerTagID', form.values.markerTag.id.primaryKey)
    syncedPrefs.write('prerequisiteTagID', form.values.prerequisiteTag.id.primaryKey)
    syncedPrefs.write('dependantTagID', form.values.dependantTag.id.primaryKey)
  })

  action.validate = function (selection, sender) {
    // only show when nothing is selected
    return selection.tasks.length === 0 && selection.projects.length === 0
  }

  return action
})()
