# About

This is an Omni Automation plug-in bundle for OmniFocus that allows for the creation of task dependencies.

_Please note that all scripts on my GitHub account (or shared elsewhere) are works in progress. If you encounter any issues or have any suggestions please let me know--and do please make sure you backup your database before running scripts from an amateur on the internet!)_

## Known issues 

Refer to the 'issues' in this repo for known issues and planned changes/enhancements.

# Installation & Set-Up

**Important note: for this plug-in bundle to work correctly, my [Synced Preferences for OmniFocus plugin](https://github.com/ksalzke/synced-preferences-for-omnifocus) is also required and needs to be added to the plug-in folder separately.**

1. Click on the green `Clone or download` button above to download a `.zip` file of all the files in this GitHub repository.
2. Unzip the downloaded file.
3. Rename the entire folder to anything you like, with the extension `.omnifocusjs`
4. Move the resulting file to your OmniFocus plug-in library folder.
5. Manually create the three tags below in OmniFocus. (These can be placed anywhere in your OmniFocus database.)
6. Configure your preferences using the `Preferences` action. (Note that to run this action, no tasks can be selected.)

The plugin makes use of three tags:

| Tag          | Example             | Description                                                                                                             |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Marker       | `Make Prerequisite` | A temporary tag used to denote which actions should become prerequisites when the `Add Prerequisite` action is run.     |
| Prerequisite | `🔑`                 | Denotes a task that is required to be completed before another (dependant) task becomes available.                      |
| Dependant    | `🔒`                 | Denotes a task that is currently unavailable because it is waiting for another task to be completed. (Set to `On Hold`) |

These tags can be set by using the 'Preferences' action, or the user will be prompted to choose them when one is first required.

# Actions

This plug-in contains the following actions:

## Add Prerequisite Marker

This action can be run when one or more tasks are selected. It adds the temporary marker tag to the selected task(s) in preparation for the `Add Prerequisite` step.

## Add Prerequisite

This action can be run when one or more tasks have the marker tag and one or more tasks or projects are selected.

For each prerequisite/dependant pair, the `addDependency` function is run i.e. each selected task becomes a dependant of each tagged task.

## Remove Prerequisite(s)

This action is available when one or more tasks or projects with prerequisite actions are selected.

It prompts the user to select from a list of the tasks' prerequisite actions and removes the chosen prerequisite(s) from any selected tasks by using the `removeDependancy` function.

## Check Prerequisites

This action can be run when no tasks or projects are selected.

It reviews all the dependencies and updates them as needed by running `updateDependencies`.

## Complete For Prerequisites

This action can be run when one or more tasks or projects are selected.

It marks the selected tasks or projects as complete and runs the `updateDependencies` function, to make any tasks that were waiting on selected tasks (or completed parent tasks) available.

## Update Due Dates

**Important note: This action is not currently working as expected and requires review/fixing. I hope to fix this soon.**

This action can be run when no tasks or projects are selected.

For each task tagged as a prerequisite, it finds the earliest effective due date of its dependent tasks (including tasks that are indirectly dependent, i.e. a task that is dependent on the original task's dependant, and so on)

It then updates the due dates on the prerequisite task, and any sequential actions that preceed it, to match the earliest due date.

## Preferences

This action allows the user to set the preferences for the plug-in. These sync between devices using the Synced Preferences plugin linked above. Currently, there are three preferences—one to set each of the tags outlined above.

# Functions

This plugin contains the following functions within the `dependencyLibrary` library:

## `loadSyncedPrefs () : SyncedPref`

Returns the [SyncedPref](https://github.com/ksalzke/synced-preferences-for-omnifocus) object for this plugin.

If the user does not have the plugin installed correctly, they are alerted.

## `getLinks () : Array<Array[string]>`

Returns an array containing a list of dependancy pairs, as stored in the SyncedPref object for this plugin.

Each pair is stored as a two-element array: the first is the ID of the prerequisite task and the second is the ID of the dependant task.

e.g. a sample return value might be `[["joAuGBEjN5C","gPTdVFqONl9"],["odwDCDRUWng","joAuGBEjN5C"],["oYQo_hRwCER","joAuGBEjN5C"],["dECOjinH-_3","joAuGBEjN5C"],["ptHMBTN7FMz","hhepNkpRFwh"]]`

If no links have been created yet, an empty array is returned.

## `addDependency (prereq: Task, dep: Task) : Promise`

This asynchronous function:
1. Adds the dependant tag to the dependant task and the prerequisite tag to the prerequisite task
2. Prepends a link to the prerequisite tasks in the dependant task's note in the form `[ DEPENDANT: omnifocus:///task/<id> ] Task name`, and prepends a similar link to the dependant task's note.
3. Saves a "link" in the SyncedPref object (see `getLinks` for details on how these are stored)
4. If the dependant task has children, then the function is called again for either all children (in the case of a parallel action group) or the first child (in the case of a sequential action group).
5. Removes the marker tag from the prerequisite

## `removeDependency (prereqID: string, depID: string) : Promise`

This asynchronous function takes the ID of two tasks as input, and:
1. Removes the "link" from the SyncedPref object (see `getLinks` for details on how these are stored)
2. If the prerequisite task still exists:
   * Removes the link to the dependant task from its note
   * If there are no remaining dependancies, removes the prerequisite tag from the prerequisite task
3. If the dependant task still exists:
    * Removes the link to the prerequisite task from its note
    * If there are no remaining prerequisites, removes the dependant tag from the dependant task
    * Runs `removeDependant` on all children (in the case of a parallel action group) or the first child (in the case of a sequential action group).


## `getPrefTag(prefTag: string) : Promise<Tag>`

This asynchronous function takes the name of a preference tag (`markerTag`, `prerequisiteTag` or `dependantTag`) as input and, if the tag ID is set in preferences, returns the tag. If no preference has been set, the `Preferences` action is run and then the function is called again.

## `getDependants (task: Task) : Array<Task>`

This function takes a task object as input, and returns an array of its (direct) dependent tasks. If it has no dependent tasks, it returns an empty array.

## `getPrereqs (task: Task) : Array<Task>`

This function takes a task object as input, and returns an array of its (direct) prerequisite tasks. If it has no prerequisite tasks, it returns an empty array.

## `updateDependencies ()`

This function goes through the links stored in the SyncedPref object, and for any link where one or both of the values has been completed, dropped, or no longer exists, runs the `removeDependency` function.