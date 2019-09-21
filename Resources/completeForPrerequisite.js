/*{
	"type": "action",
	"targets": ["omnifocus"],
	"author": "Kaitlin Salzke",
	"identifier": "com.KaitlinSalzke.completeForPrerequisite",
	"version": "1.0.1",
	"description": "Finds dependant tasks in the currently selected task's note; removes the prerequisite details from the dependant task's note; removes the 'Waiting' tag from the dependant task if no remaining prerequisites; and marks the current task as completed.",
	"label": "Complete For Prerequisite",
	"shortLabel": "Complete For Prerequisite"
}*/
var _ = (function() {
  var action = new PlugIn.Action(function(selection, sender) {
    dependantTag = tagNamed("Activity Type")
      .tagNamed("⏳ Waiting")
      .tagNamed("🔒 Other task");

    // if called externally (from script) generate selection object
    if (typeof selection == "undefined") {
      selection = document.windows[0].selection;
    }

    task = selection.tasks[0];

    task.markComplete();

    //get task ID of selected task
    var prerequisiteTaskId = task.id.primaryKey;
    var prerequisiteTask = task;

    // check if created by another task
    var createdByRegex = /\[CREATEDBY: omnifocus:\/\/\/task\/(.+)\]/g;
    var createdByRegexResult = createdByRegex.exec(task.note);

    if (createdByRegexResult != null) {
      // for each captured task ID
      prerequisiteTaskId = createdByRegexResult[1];
      // get the task with that ID
      tagNamed("🔑").tasks.forEach(function(task) {
        if (task.id.primaryKey == prerequisiteTaskId) {
          prerequisiteTask = task;
          return ApplyResult.Stop;
        }
      });
    }

    if (prerequisiteTask.completed) {
      // use regex to find [DEPENDANT: taskid] matches in the notes and capture task IDs
      regex = /\[DEPENDANT: omnifocus:\/\/\/task\/(.+)\]/g;
      var regexArray = [];
      while ((regexArray = regex.exec(prerequisiteTask.note)) !== null) {
        // for each captured task ID
        dependantTaskId = regexArray[1];
        // get the task with that ID
        var dependantTask = null;
        dependantTag.tasks.forEach(function(task) {
          if (task.id.primaryKey == dependantTaskId) {
            dependantTask = task;
            return ApplyResult.Stop;
          }
        });
        // remove the prerequisite tag from the dependant task
        regexString =
          "[PREREQUISITE: omnifocus:///task/" + prerequisiteTaskId + "].+";
        RegExp.quote = function(str) {
          return str.replace(/([?*^$[\]\\(){}|-])/g, "\\$1");
        };
        regexForNoteSearch = new RegExp(RegExp.quote(regexString));
        dependantTask.note = dependantTask.note.replace(regexForNoteSearch, "");
        // check whether any remaining prerequisite tasks listed in the note (i.e. whether all prerequisites completed) - and if so
        if (!/\[PREREQUISITE:/.test(dependantTask.note)) {
          // if no remaining prerequisites, remove 'Waiting' tag from dependant task
          dependantTask.removeTag(dependantTag);
        }
      }
    }
  });

  action.validate = function(selection, sender) {
    return (
      selection.tasks.length === 1 &&
      selection.tasks[0].tags.includes(tagNamed("🔑"))
    );
  };

  return action;
})();
_;
