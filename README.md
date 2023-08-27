# About

This is an Omni Automation plug-in bundle for OmniFocus that allows for the creation of task dependencies.

_Please note that all scripts on my GitHub account (or shared elsewhere) are works in progress. If you encounter any issues or have any suggestions please let me know--and do please make sure you backup your database before running scripts from an amateur on the internet!)_

## Known issues 

Refer to ['issues'](https://github.com/ksalzke/dependency-omnifocus-plugin/issues) for known issues and planned changes/enhancements.

Changes to the way data from this plug-in is stored were made in version 3. If you were using a previous version, you can use the script `updateToV3.omnifocusjs` (saved in this repository) to move to the new structure. Simply move this file into your plug-ins folder; once it has been run once, it may be deleted.

# Installation & Set-Up

**Important note: for this plug-in bundle to work correctly, my [Synced Preferences for OmniFocus plug-in](https://github.com/ksalzke/synced-preferences-for-omnifocus) is also required and needs to be added to the plug-in folder separately.**

1. Download the [latest release](https://github.com/ksalzke/dependency-omnifocus-plugin/releases/latest).
2. Unzip the downloaded file.
3. Move the `.omnifocusjs` file to your OmniFocus plug-in library folder (or open it to install).
4. Manually create the three tags below in OmniFocus. (These can be placed anywhere in your OmniFocus database.)
5. Configure your preferences using the `Preferences` action. (Note that to run this action on iOS, no tasks can be selected.)

The plug-in makes use of three tags:

| Tag          | Example             | Description                                                                                                             |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Marker       | `Make Prerequisite` | A temporary tag used to denote which actions should become prerequisites when the `Add Prerequisite` action is run.     |
| Prerequisite | `🔑`                 | Denotes a task that is required to be completed before another (dependent) task becomes available.                      |
| Dependent    | `🔒`                 | Denotes a task that is currently unavailable because it is waiting for another task to be completed. (Set to `On Hold`) |

These tags can be set by using the 'Preferences' action, or the user will be prompted to choose them when one is first required.

# Actions

This plug-in contains the following actions:

## Add Prerequisite Marker

This action can be run when one or more tasks are selected. It adds the temporary marker tag to the selected task(s) in preparation for the `Add Prerequisite` step.

The tag can also be manually added, however this action is included to allow a keyboard shortcut to be easily assigned to this tag.

## Add Prerequisite

This action can be run when one or more tasks have the marker tag and one or more tasks or projects are selected.

For each prerequisite/dependent pair, the `addDependency` function is run i.e. each selected task becomes a dependent of each tagged task: the relevant tags are applied, and, if the option is selected, links are added to the notes.

Optionally, the user may choose to be prompted to add another dependent task. (This avoids having to re-apply the 'marker' tag to any prerequisite tasks.)

![Running 'Add Prerequisite Marker' and 'Add Prerequisite' actions](https://user-images.githubusercontent.com/16893787/144363268-f488e45c-30a7-461d-baa7-f6a2c8c02c35.mp4)

<img width="541" alt="Example note" src="https://user-images.githubusercontent.com/16893787/144363485-eb9d4e6a-a9d6-4af3-9b97-46ed23c9b31b.png">

## Search and Add Prerequisite(s)

This action is available when one or more tasks or projects are selected.

The user is prompted to search the database for one or more tasks, and these are then added as prerequisites of the selected task(s) and/or project(s).

## Search and Add Dependant(s)

This action is available when one or more tasks or projects are selected.

The user is prompted to search the database for one or more tasks, and these are then added as dependants of the selected task(s) and/or project(s).

## Remove Prerequisite(s)

This action is available when one or more tasks or projects with prerequisite actions are selected.

It prompts the user to select from a list of the tasks' prerequisite actions and removes the chosen prerequisite(s) from any selected tasks by using the `removeDependency` function.

![Capto_Capture 2021-12-02_04-33-19_pm](https://user-images.githubusercontent.com/16893787/144363689-87538bd2-baff-4ebf-8d80-12ddbd83cbac.png)

## Remove Dependent(s)

This action is available when one or more tasks or projects with dependent actions are selected.

It prompts the user to select from a list of the tasks' dependent actions and removes the chosen dependent(s) from any selected tasks by using the `removeDependency` function.

![Capto_Capture 2021-12-02_04-32-28_pm](https://user-images.githubusercontent.com/16893787/144363609-5e437687-6316-4134-9968-c73cb857b7ad.png)

## Go To Prerequisite

This action is available when a single task or project with one or more prerequisite actions is selected.

If there is only one prerequisite task, this action navigates to that task.

If there is more than one prerequisite task, the user is first prompted to select which one they would like to navigate to.

## Go To Dependent

This action is available when a single task or project with one or more dependent actions is selected.

If there is only one dependent task, this action navigates to that task.

If there is more than one dependent task, the user is first prompted to select which one they would like to navigate to.

## Check Prerequisites

This action can only be run when no tasks or projects are selected on iOS (to avoid taking space in the share sheet). It is always available on macOS.

It reviews all the dependencies and updates them as needed by running `updateDependencies`.

If the preference to "Set due dates when updating 'Check Prerequisites' action" has been selected, then `updateDueDates` is also run.

If the preference to "Set defer dates when updating 'Check Prerequisites' action" has been selected, then `updateDeferDates` is also run.

## Complete For Prerequisites

This action can be run when one or more tasks or projects are selected.

It marks the selected tasks or projects as complete and runs the `updateDependencies` function, to make any tasks that were waiting on selected tasks (or completed parent tasks) available.

![Complete For Prerequisite](https://user-images.githubusercontent.com/16893787/144363891-00434559-da7b-4dc1-bc84-cd587c9e8e63.mp4)

## Update Due Dates

This action can be run when no tasks or projects are selected. It runs the `updateDueDates` function.

## Update Defer Dates

This action can be run when no tasks or projects are selected. It runs the `updateDeferDates` function.

## Preferences

This action allows the user to set the preferences for the plug-in. These sync between devices using the Synced Preferences plug-in linked above.

There is a preference to select each of the tags outlined above. In addition, the following preferences are available:

* **Set due dates when updating 'Check Prerequisites' action**. If this is selected, then `updateDueDates` is also run as part of the 'Check Prerequisites' action.
* **Set defer dates when updating 'Check Prerequisites' action**. If this is selected, then `updateDeferDates` is also run as part of the 'Check Prerequisites' action.
* **Add link to related tasks to notes**. If this is selected, a link to the prerequisite task is added to the note of the dependent task when a new link is created, and vice versa. (Note that changing this setting will add or remove notes from all tasks.)
* **Prompt for additional tasks to be added (leaves marker tag applied)** If this is selected, the user is asked whether they would like to add additional tasks after running the 'Add Prerequisite' action. (This avoids having to re-apply the 'marker' tag to any prerequisite tasks.)

# Functions

This plug-in contains the following functions within the `dependencyLibrary` library:

## `loadSyncedPrefs () : SyncedPref`

Returns the [SyncedPref](https://github.com/ksalzke/synced-preferences-for-omnifocus) object for this plug-in.

If the user does not have the plug-in installed correctly, they are alerted.

## `getFuzzySearchLib (): PlugIn.Library`

Returns the library from my [Fuzzy Search Library](https://github.com/ksalzke/fuzzy-search-library) plug-in.

## `getLinks () : Array<Array[string]>`

Returns an array containing a list of dependency pairs, as stored in the SyncedPref object for this plug-in.

Each pair is stored as a two-element array: the first is the ID of the prerequisite task and the second is the ID of the dependent task.

e.g. a sample return value might be `[["joAuGBEjN5C","gPTdVFqONl9"],["odwDCDRUWng","joAuGBEjN5C"],["oYQo_hRwCER","joAuGBEjN5C"],["dECOjinH-_3","joAuGBEjN5C"],["ptHMBTN7FMz","hhepNkpRFwh"]]`

If no links have been created yet, an empty array is returned.

## `addNotes (prereq: Task, dep: Task)`

This function creates a note 'link' between the two tasks. The notes have the form `[ Go to prerequisite task: omnifocus:///task/someid123 ] Task name` and `[ Go to dependent task: omnifocus:///task/someid123 ] Task name`

Before creating the new notes, it removes any existing notes linking the two tasks using the `removeNotes` function. This is to avoid the same note 'link' being entered twice.

## `removeNotes (prereq: Task, dep: Task)`

This function removes the note 'link' between the two tasks. This includes those in the form specified above, as well as some other forms previously used by this plug-in.

## `removeAllNotes ()`

This function runs `removeNotes` for all links.

## `addAllNotes ()`

This function runs `addNotes` for all links.

## `addDependencies (prereqs: Task[], deps: Task[]): Promise`

This asynchronous function creates a dependency between all of the prerequisite tasks and all of the dependent tasks (using the `addDependency` function).

## `addDependency (prereq: Task, dep: Task) : Promise`

This asynchronous function:
1. Adds the dependent tag to the dependent task and the prerequisite tag to the prerequisite task
2. Prepends a link to the prerequisite tasks in the dependent task's note in the form `[ DEPENDANT: omnifocus:///task/<id> ] Task name`, and prepends a similar link to the dependent task's note. (This is not done if the option is deselected in preferences.)
3. Saves a "link" in the SyncedPref object (see `getLinks` for details on how these are stored)
4. If the dependent task has children, then the function is called again for either all children (in the case of a parallel action group) or the first child (in the case of a sequential action group).
5. Removes the marker tag from the prerequisite

## `removeDependency (prereqID: string, depID: string) : Promise`

This asynchronous function takes the ID of two tasks as input, and:
1. Removes the "link" from the SyncedPref object (see `getLinks` for details on how these are stored)
2. If the prerequisite task still exists:
   * Removes the link to the dependent task from its note
   * If there are no remaining dependencies, removes the prerequisite tag from the prerequisite task
3. If the dependent task still exists:
    * Removes the link to the prerequisite task from its note
    * If there are no remaining prerequisites, removes the dependent tag from the dependent task
    * Runs `removeDependent` on all children (in the case of a parallel action group) or the first child (in the case of a sequential action group).


## `getPrefTag(prefTag: string) : Promise<Tag>`

This asynchronous function takes the name of a preference tag (`markerTag`, `prerequisiteTag` or `dependentTag`) as input and, if the tag ID is set in preferences, returns the tag. If no preference has been set, the `Preferences` action is run and then the function is called again.

## `getDependents (task: Task) : Array<Task>`

This function takes a task object as input, and returns an array of its (direct) dependent tasks. If it has no dependent tasks, it returns an empty array.

## `getPrereqs (task: Task) : Array<Task>`

This function takes a task object as input, and returns an array of its (direct) prerequisite tasks. If it has no prerequisite tasks, it returns an empty array.

## `getAllPrereqs (task: Task) : Array<Task>`

This function takes a task object as input, and returns an array of its prerequisites, both direct and indirect. i.e. if T1 is a prerequisite of T2 and T2 is a prerequisite of T3, then passing T3 as a parameter would return an array containing both T1 and T2.

## `getAllDependents (task: Task) : Array<Task>`

This function takes a task object as input, and returns an array of its dependents, both direct and indirect. i.e. if T1 is a prerequisite of T2 and T2 is a prerequisite of T3, then passing T1 as a parameter would return an array containing both T2 and T3.

## `updateDependencies ()`

This asynchronous function goes through the links stored in the SyncedPref object, removes any duplicates, and for any link where one or both of the values has been completed, dropped, or no longer exists, runs the `removeDependency` function.

It also checks for any tasks that have been tagged with the dependent or prerequisite tags but are not saved as such (most likely to occur when tags are inherited in a project or action group). It removes these tags from the task.

## `updateDueDates ()`

For each dependent task, this asynchronous function finds all prerequisites (direct and indirect) using the `getAllPrerequisites` function. For each prerequisite, it then updates the due date if there is no effective due date set, or if the currently set due date is _after_ the dependent's due date. It also updates any sequential actions that precede the prerequisite task.

## `updateDeferDates ()`

For each prerequisite task, this asynchronous function finds all dependents (direct and indirect) using the `getAllDependents` function. For each dependent, it then updates the defer date if there is no effective defer date set, or if the currently set defer date is _before_ the prerequisite's defer date. It also updates any sequential actions that follow the dependent task.
