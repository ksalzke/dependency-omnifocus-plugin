/* global PlugIn Version Project Alert Tag Task */
(() => {
  const dependencyLibrary = new PlugIn.Library(new Version('1.0'))

  dependencyLibrary.loadSyncedPrefs = () => {
    const syncedPrefsPlugin = PlugIn.find('com.KaitlinSalzke.SyncedPrefLibrary')

    if (syncedPrefsPlugin !== null) {
      const SyncedPref = syncedPrefsPlugin.library('syncedPrefLibrary').SyncedPref
      return new SyncedPref('com.KaitlinSalzke.DependencyForOmniFocus')
    } else {
      const alert = new Alert(
        'Synced Preferences Library Required',
        'For the Dependency plug-in to work correctly, the \'Synced Preferences for OmniFocus\' plugin(https://github.com/ksalzke/synced-preferences-for-omnifocus) is also required and needs to be added to the plug-in folder separately. Either you do not currently have this plugin installed, or it is not installed correctly.'
      )
      alert.show()
    }
  }

  dependencyLibrary.getLinks = () => {
    const syncedPrefs = dependencyLibrary.loadSyncedPrefs()
    return syncedPrefs.read('links') || []
  }

  dependencyLibrary.addDependancy = async (prereq, dep) => {
    const syncedPrefs = dependencyLibrary.loadSyncedPrefs()
    const links = dependencyLibrary.getLinks()
    const prerequisiteTag = await dependencyLibrary.getPrefTag('prerequisiteTag')
    const dependantTag = await dependencyLibrary.getPrefTag('dependantTag')
    const markerTag = await dependencyLibrary.getPrefTag('markerTag')

    // add tags
    dep.addTag(dependantTag)
    prereq.addTag(prerequisiteTag)

    // if dependant is project, set to on hold
    if (dep.project !== null) dep.project.status = Project.Status.OnHold

    // prepend dependancy details to notes if that setting is selected
    const addToNote = (syncedPrefs.read('addToNote') !== null) ? syncedPrefs.readBoolean('addToNote') : true
    if (addToNote) {
      dep.note = `[ PREREQUISITE: omnifocus:///task/${prereq.id.primaryKey} ] ${prereq.name}\n\n${dep.note}`
      prereq.note = `[ DEPENDANT: omnifocus:///task/${dep.id.primaryKey} ] ${dep.name}\n\n${prereq.note}`
    }

    // save link in synced prefs
    links.push([prereq.id.primaryKey, dep.id.primaryKey])
    syncedPrefs.write('links', links)

    // if dependant task has children:
    if (dep.hasChildren && dep.sequential) dependencyLibrary.addDependency(dep.children[0])
    if (dep.hasChildren && !dep.sequential) dep.children.forEach(child => dependencyLibrary.addDependancy(prereq, child))

    // remove marker tag used for processing
    prereq.removeTag(markerTag)
  }

  dependencyLibrary.removeDependancy = async (prereqID, depID) => {
    const dependantTag = await dependencyLibrary.getPrefTag('dependantTag')
    const prerequisiteTag = await dependencyLibrary.getPrefTag('prerequisiteTag')
    const prereq = Task.byIdentifier(prereqID)
    const dep = Task.byIdentifier(depID)

    // remove link from prefs
    const syncedPrefs = dependencyLibrary.loadSyncedPrefs()
    const links = dependencyLibrary.getLinks()
    const updated = links.filter(link => !(link[0] === prereqID && link[1] === depID))
    syncedPrefs.write('links', updated)

    // update prereq task if it still exists
    if (prereq !== null) {
      // remove dep from prereq note
      const regexString1 = `[ ?DEPENDANT: omnifocus:///task/${depID} ?].+`
      RegExp.quote = (str) => str.replace(/([*^$[\]\\(){}|-])/g, '\\$1')
      const regexForNoteSearch1 = new RegExp(RegExp.quote(regexString1))
      prereq.note = prereq.note.replace(regexForNoteSearch1, '')

      // if no remaining dependancies, remove tag from prereq task
      const deps = await dependencyLibrary.getDependants(prereq)
      if (deps.length === 0) {
        prereq.removeTag(prerequisiteTag)
      }
    }

    // update dep task if it still exists
    if (dep !== null) {
      // remove prereq from dep note
      const regexString2 = `[ ?PREREQUISITE: omnifocus:///task/${prereqID} ?].+`
      RegExp.quote = (str) => str.replace(/([*^$[\]\\(){}|-])/g, '\\$1')
      const regexForNoteSearch2 = new RegExp(RegExp.quote(regexString2))
      dep.note = dep.note.replace(regexForNoteSearch2, '')

      // if no remaining prerequisites, remove tag from dependant task (and if project set to active)
      const prereqs = await dependencyLibrary.getPrereqs(dep)
      if (prereqs.length === 0) {
        dep.removeTag(dependantTag)
        if (dep.project !== null) dep.project.status = Project.Status.Active
      }

      // if dep has children also run on those
      if (dep.hasChildren && dep.sequential) dependencyLibrary.removeDependancy(dep.children[0], prereq)
      else if (dep.hasChildren) dep.children.forEach(child => dependencyLibrary.removeDependancy(child, prereq))
    }
  }

  dependencyLibrary.getPrefTag = async (prefTag) => {
    const preferences = dependencyLibrary.loadSyncedPrefs()
    const tagID = preferences.readString(`${prefTag}ID`)

    if (tagID !== null) return Tag.byIdentifier(tagID)

    // if not set, show preferences pane and then try again
    await this.action('preferences').perform()
    return dependencyLibrary.getPrefTag(prefTag)
  }

  dependencyLibrary.getDependants = (task) => {
    const links = dependencyLibrary.getLinks()
    return links.filter(link => link[0] === task.id.primaryKey).map(link => Task.byIdentifier(link[1]))
  }

  dependencyLibrary.getPrereqs = (task) => {
    const links = dependencyLibrary.getLinks()
    return links.filter(link => link[1] === task.id.primaryKey).map(link => Task.byIdentifier(link[0]))
  }

  dependencyLibrary.getAllPrereqs = (task) => {
    const getAllPrereqs = (tasks) => {
      const prereqs = tasks.flatMap(task => dependencyLibrary.getPrereqs(task))
      if (prereqs.length === 0) return tasks
      return getAllPrereqs(prereqs).concat(tasks)
    }

    const firstPrereqs = dependencyLibrary.getPrereqs(task)

    return getAllPrereqs(firstPrereqs)
  }

  dependencyLibrary.getAllDependants = (task) => {
    const getAllDependants = (tasks) => {
      const deps = tasks.flatMap(task => dependencyLibrary.getDependants(task))
      if (deps.length === 0) return tasks
      return getAllDependants(deps).concat(tasks)
    }

    const firstDeps = dependencyLibrary.getDependants(task)

    return getAllDependants(firstDeps)
  }

  dependencyLibrary.updateDependancies = () => {
    const links = dependencyLibrary.getLinks()

    // get links where one or both of the values has been completed, dropped, or no longer exists
    const linksToRemove = links.filter(link => {
      const [prereqID, depID] = link
      const [prereq, dep] = [Task.byIdentifier(prereqID), Task.byIdentifier(depID)]

      return prereq === null || dep === null || prereq.taskStatus === Task.Status.Completed || prereq.taskStatus === Task.Status.Dropped || dep.taskStatus === Task.Status.Completed || dep.taskStatus === Task.Status.Dropped
    })

    linksToRemove.forEach(link => dependencyLibrary.removeDependancy(link[0], link[1]))
  }

  dependencyLibrary.updateDueDates = () => {
    // make sure any old links have been cleared out
    dependencyLibrary.updateDependancies()

    // get all dependant tasks
    const deps = dependencyLibrary.getLinks().map(link => Task.byIdentifier(link[1]))

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
      const prereqs = dependencyLibrary.getAllPrereqs(dep)
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
  }

  dependencyLibrary.updateDeferDates = () => {
    // make sure any old links have been cleared out
    dependencyLibrary.updateDependancies()

    // get all prerequisite tasks
    const prereqs = dependencyLibrary.getLinks().map(link => Task.byIdentifier(link[0]))

    // limit to those with defer dates
    const deferredPrereqs = prereqs.filter(p => p.effectiveDeferDate !== null)

    // process each prerequisite task with defer date
    const updateDate = (tasks, date) => {
      // console.log('effective defer date: '+tasks.map(t => t.effectiveDeferDate))
      const tasksToUpdate = tasks.filter(t => t.effectiveDeferDate === null || date > t.effectiveDeferDate)
      // console.log('to update: '+tasksToUpdate)
      tasksToUpdate.forEach(t => (t.deferDate = date))
      return tasksToUpdate
    }

    deferredPrereqs.forEach(prereq => {
      // get a complete list of dependants (including indirect ones) and update the date
      const deps = dependencyLibrary.getAllDependants(prereq)
      if (prereq.id.primaryKey === 'jBlljdtdlfB') console.log(deps)
      const updatedDeps = updateDate(deps, prereq.effectiveDeferDate)

      // if part of a sequential action group/project, also update defer date of subsequent actions
      updatedDeps.forEach(d => {
        if (d.parent !== null && d.parent.sequential) {
          const siblings = d.parent.children
          const dIndex = siblings.indexOf(d)
          const subsequentTasks = siblings.slice(dIndex)
          updateDate(subsequentTasks, prereq.effectiveDeferDate)
        }
      })
    })
  }

  return dependencyLibrary
})()
