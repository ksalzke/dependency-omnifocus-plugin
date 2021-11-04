# About

This is an Omni Automation plug-in bundle for OmniFocus that allows for the creation of task dependencies. (Further details provided below.)

_Please note that all scripts on my GitHub account (or shared elsewhere) are works in progress. If you encounter any issues or have any suggestions please let me know--and do please make sure you backup your database before running scripts from an amateur on the internet!)_

## Known issues 

Refer to the 'issues' in this repo for known issues and planned changes/enhancements.

# Installation & Set-Up

**Important note: for this plug-in bundle to work correctly, my [Function Library for OmniFocus](https://github.com/ksalzke/function-library-for-omnifocus) is also required and needs to be added to the plug-in folder separately.**

**Important note: for this plug-in bundle to work correctly, my [Synced Preferences for OmniFocus plugin](https://github.com/ksalzke/synced-preferences-for-omnifocus) is also required and needs to be added to the plug-in folder separately.**

1. Click on the green `Clone or download` button above to download a `.zip` file of all the files in this GitHub repository.
2. Unzip the downloaded file.
3. Rename the entire folder to anything you like, with the extension `.omnifocusjs`
4. Move the resulting file to your OmniFocus plug-in library folder.
5. Manually create the three tags below in OmniFocus.
6. Configure your preferences using the `Preferences` action. (Note that to run this action, no tasks can be selected.)

The plugin makes use of three tags:

| Tag          | Example             | Description                                                                                                             |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Marker       | `Make Prerequisite` | A temporary tag used to denote which actions should become prerequisites when the `Add Prerequisite` action is run.     |
| Prerequisite | `🔑`                 | Denotes a task that is required to be completed before another (dependant) task becomes available.                      |
| Dependant    | `🔒`                 | Denotes a task that is currently unavailable because it is waiting for another task to be completed. (Set to `On Hold`) |

These tags can be set by using the 'Preferences' action, or the user will be prompted to select these when one of these is first required.

# Actions

This plug-in contains the following actions:

## Make Prerequisite

This action can be run when one or more tasks are selected. It is simply a helper function that adds the temporary marker tag to the prerequisite task in preparation for the `Add Prerequisite` step.

## Add Prerequisite

This action can be run when one or more tasks have the marker tag and one or more tasks or projects are selected. It:

1. For the selected (dependant) tasks/projects:
    * Adds the dependant tag
    * Prepends link(s) to the prerequisite tasks in its note in the form `[ PREREQUISITE: omnifocus:///task/<id> ]`
    * If the selection is a project, changes its status to `On Hold`
2. For the prerequisite task (previously tagged with the marker tag):
    * Adds the prerequisite tag
    * Prepends link(s) to the dependant tasks in its note in the form `[ DEPENDANT: omnifocus:///task/<id> ]`
    * Removes the temporary marker tag

## Complete For Prerequisite

This action can be run when a single task or project is selected.

It marks the task as complete and runs the `checkDependantsForTaskAndAncestors` function (see below) to make any tasks that were waiting on the selected task (or its completed parent tasks) available.

## Check Prerequisites

This action can be run when no tasks or projects are selected.

It gets all remaining dependant tasks. For each one, it checks all of the task's prerequisites using the `checkDependants` function (see below); if all prerequisites have been completed this function makes the dependant task available.

## Update Due Dates

This action can be run when no tasks or projects are selected.

For each task tagged as a prerequisite, it finds the earliest effective due date of its dependent tasks (including tasks that are indirectly dependent, i.e. a task that is dependent on the original task's dependant, and so on)

It then updates the due dates on the prerequisite task, and any sequential actions that preceed it, to match the earliest due date.

## Preferences

This action allows the user to set the preferences for the plug-in. These sync between devices using the Synced Preferences plugin linked above. Currently, there are three preferences—one to set each of the tags outlined above.

# Functions

This plugin contains the following functions within the `dependencyLibrary` library:

## getDependants

This function takes a task object as input, and returns an array of its (direct) dependent tasks. If it has no dependent tasks, it returns an empty array.

## getPrereqs

This function takes a task object as input, and returns an array of its (direct) prerequisite tasks. If it has no prerequisite tasks, it returns an empty array.

## checkDependants

This function takes a prerequisite task object as input. If the task object has been completed, it gets a list of the task's dependant tasks and removes the prerequisite tag and note from those tasks.

It then checks the dependant tasks and, if there are no remaining prerequisites for these tasks, it removes the dependant tag (and, if it is a project, sets it to active).

## checkDependantsForTaskAndAncestors

This function takes a task object as input. It checks all ancestors of that task using the `checkDependants` function.