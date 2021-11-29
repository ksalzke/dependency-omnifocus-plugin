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

  dependencyLibrary.addNotes = (prereq, dep) => {
    // remove note before adding - prevents note being added twice
    dependencyLibrary.removeNotes (prereq, dep)

    dep.note = `[ Go to prerequisite task: omnifocus:///task/${prereq.id.primaryKey} ] ${prereq.name}\n\n${dep.note}`
    prereq.note = `[ Go to dependent task: omnifocus:///task/${dep.id.primaryKey} ] ${dep.name}\n\n${prereq.note}`
  }

  dependencyLibrary.removeNotes = (prereq, dep) => {
    RegExp.quote = (str) => str.replace(/([*^$[\]\\(){}|-])/g, '\\$1')

    if (dep !== null) {
      // remove prereq from dep note
      const regexString1 = `[ ?PREREQUISITE: omnifocus:///task/${prereq.id.primaryKey} ?].+`
      const regexString2 = `[ ?Go to prerequisite task: omnifocus:///task/${prereq.id.primaryKey} ?].+`
      const regexForNoteSearch1 = new RegExp(RegExp.quote(regexString1), 'g')
      const regexForNoteSearch2 = new RegExp(RegExp.quote(regexString2), 'g')
      dep.note = dep.note.replace(regexForNoteSearch1, '').replace(regexForNoteSearch2, '')
    }

    if (prereq !== null) {
      // remove dep from prereq note
      const regexString1 = `[ ?DEPENDANT: omnifocus:///task/${dep.id.primaryKey} ?].+`
      const regexString2 = `[ ?Go to dependent task): omnifocus:///task/${dep.id.primaryKey} ?].+`
      const regexForNoteSearch1 = new RegExp(RegExp.quote(regexString1), 'g')
      const regexForNoteSearch2 = new RegExp(RegExp.quote(regexString2), 'g')
      prereq.note = prereq.note.replace(regexForNoteSearch1, '').replace(regexForNoteSearch2, '')
    }
  }

  dependencyLibrary.removeAllNotes = () => {
    console.log('removing all notes')
    const links = dependencyLibrary.getLinks()
    links.forEach(link => dependencyLibrary.removeNotes(Task.byIdentifier(link[0]), Task.byIdentifier(link[1])))
  }

  dependencyLibrary.addAllNotes = () => {
    console.log('adding all notes')
    const links = dependencyLibrary.getLinks()
    links.forEach(link => dependencyLibrary.addNotes(Task.byIdentifier(link[0]), Task.byIdentifier(link[1])))
  }

  dependencyLibrary.addDependency = async (prereq, dep) => {
    const syncedPrefs = dependencyLibrary.loadSyncedPrefs()
    const links = dependencyLibrary.getLinks()
    const prerequisiteTag = await dependencyLibrary.getPrefTag('prerequisiteTag')
    const dependentTag = await dependencyLibrary.getPrefTag('dependentTag')
    const markerTag = await dependencyLibrary.getPrefTag('markerTag')

    // add tags
    dep.addTag(dependentTag)
    prereq.addTag(prerequisiteTag)

    // if dependent is project, set to on hold
    if (dep.project !== null) dep.project.status = Project.Status.OnHold

    // prepend dependency details to notes if that setting is selected
    const addToNote = (syncedPrefs.read('addToNote') !== null) ? syncedPrefs.readBoolean('addToNote') : true
    if (addToNote) dependencyLibrary.addNotes(prereq, dep)

    // save link in synced prefs
    links.push([prereq.id.primaryKey, dep.id.primaryKey, new Date()])
    syncedPrefs.write('links', links)

    // if dependent task has children:
    if (dep.hasChildren && dep.sequential) dependencyLibrary.addDependency(dep.children[0])
    if (dep.hasChildren && !dep.sequential) dep.children.forEach(child => dependencyLibrary.addDependency(prereq, child))

    // remove marker tag used for processing
    prereq.removeTag(markerTag)
  }

  dependencyLibrary.removeDependency = async (prereqID, depID) => {
    const dependentTag = await dependencyLibrary.getPrefTag('dependentTag')
    const prerequisiteTag = await dependencyLibrary.getPrefTag('prerequisiteTag')
    const prereq = Task.byIdentifier(prereqID)
    const dep = Task.byIdentifier(depID)

    // remove link from prefs
    const syncedPrefs = dependencyLibrary.loadSyncedPrefs()
    const links = dependencyLibrary.getLinks()
    const updated = links.filter(link => !(link[0] === prereqID && link[1] === depID))
    syncedPrefs.write('links', updated)

    // remove notes
    dependencyLibrary.removeNotes(prereq, dep)

    // update prereq task if it still exists
    if (prereq !== null) {
      // if no remaining dependencies, remove tag from prereq task
      const deps = await dependencyLibrary.getDependents(prereq)
      if (deps.length === 0) {
        prereq.removeTag(prerequisiteTag)
      }
    }

    // update dep task if it still exists
    if (dep !== null) {
      // if no remaining prerequisites, remove tag from dependent task (and if project set to active)
      const prereqs = await dependencyLibrary.getPrereqs(dep)
      if (prereqs.length === 0) {
        dep.removeTag(dependentTag)
        if (dep.project !== null) dep.project.status = Project.Status.Active
      }

      // if dep has children also run on those
      if (dep.hasChildren && dep.sequential) dependencyLibrary.removeDependency(dep.children[0], prereq)
      else if (dep.hasChildren) dep.children.forEach(child => dependencyLibrary.removeDependency(child, prereq))
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

  dependencyLibrary.getDependents = (task) => {
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

  dependencyLibrary.getAllDependents = (task) => {
    const getAllDependents = (tasks) => {
      const deps = tasks.flatMap(task => dependencyLibrary.getDependents(task))
      if (deps.length === 0) return tasks
      return getAllDependents(deps).concat(tasks)
    }

    const firstDeps = dependencyLibrary.getDependents(task)

    return getAllDependents(firstDeps)
  }

  dependencyLibrary.updateDependencies = async () => {
    const links = dependencyLibrary.getLinks()

    // get links where one or both of the values has been completed, dropped, or no longer exists
    const linksToRemove = links.filter(link => {
      const [prereqID, depID, dateString=''] = link
      const [prereq, dep, date] = [Task.byIdentifier(prereqID), Task.byIdentifier(depID), new Date(dateString)]

      const lastInstance = (task) => {
          // returns latest instance of a repeating task, or current instance if no previous instances
          const instances = flattenedTasks.filter(t => t.id.primaryKey.includes(task.id.primaryKey))
          const last = instances.sort((a, b) => b.id.primaryKey.split('.')[1] - a.id.primaryKey.split('.')[1])[0]
          return last
      }

      return prereq === null || dep === null || prereq.taskStatus === Task.Status.Completed || prereq.taskStatus === Task.Status.Dropped || dep.taskStatus === Task.Status.Completed || dep.taskStatus === Task.Status.Dropped || (prereq.repetitionRule !== null && date !== null && lastInstance(prereq).completionDate > date)
    })

    linksToRemove.forEach(link => dependencyLibrary.removeDependency(link[0], link[1]))

    // check tasks tagged with 'dependent' or 'prerequisite' and if they are not included in links, remove tag
    const prerequisiteTag = await dependencyLibrary.getPrefTag('prerequisiteTag')
    prerequisiteTag.tasks.forEach(async task => {
      const deps = await dependencyLibrary.getDependents(task)
      if (deps.length === 0) task.removeTag(prerequisiteTag)
    })

    const dependentTag = await dependencyLibrary.getPrefTag('dependentTag')
    dependentTag.tasks.forEach(async task => {
      const prereqs = await dependencyLibrary.getPrereqs(task)
      if (prereqs.length === 0) task.removeTag(dependentTag)
    })
  }

  dependencyLibrary.updateDueDates = async () => {
    // make sure any old links have been cleared out
    await dependencyLibrary.updateDependencies()

    // get all dependent tasks
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

  dependencyLibrary.updateDeferDates = async () => {
    // make sure any old links have been cleared out
    await dependencyLibrary.updateDependencies()

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
      // get a complete list of dependents (including indirect ones) and update the date
      const deps = dependencyLibrary.getAllDependents(prereq)
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
