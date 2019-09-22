/*{
	"type": "action",
	"targets": ["omnifocus"],
	"author": "Kaitlin Salzke",
	"identifier": "com.KaitlinSalzke.checkPrerequisites",
	"version": "1.0",
	"description": "Check prerequisites",
	"label": "Check Prerequisites",
	"shortLabel": "Check Prerequisites"
}*/
var _ = (function() {
	var action = new PlugIn.Action(function(selection, sender) {
		// config
		dependantTag = tagNamed("Activity Type")
			.tagNamed("⏳ Waiting")
			.tagNamed("🔒 Other task");
		prerequisiteTag = tagNamed("🔑");

		// get all remaining tasks that are waiting on prerequisites
		remainingTasks = [];
		dependantTag.tasks.forEach(function(task) {
			if (task.taskStatus === Task.Status.Blocked) {
				remainingTasks.push(task);
			}
		});

		// for each task that is waiting:
		remainingTasks.forEach(function(dependentTask) {
			// use regex to find [PREREQUISITE: taskid] matches in the notes and capture task IDs
			regex = /\[PREREQUISITE: omnifocus:\/\/\/task\/(.+)\]/g;
			var regexArray = [];
			prerequisiteTasksArray = [];
			while ((regexArray = regex.exec(dependentTask.note)) !== null) {
				// for each captured task ID
				prerequisiteTaskId = regexArray[1];
				// get the task with that ID and push to array
				prerequisiteTag.tasks.forEach(function(task) {
					if (task.id.primaryKey == prerequisiteTaskId) {
						prerequisiteTasksArray.push(task);
						return ApplyResult.Stop;
					}
				});
			}

			// for each prerequsite task that has been captured
			prerequisiteTasksArray.forEach(function(prerequisiteTask) {
				// if completed:
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
						// if result is not null, remove the prerequisite tag from the dependant task
						if (dependantTask !== null) {
							regexString =
								"[PREREQUISITE: omnifocus:///task/" +
								prerequisiteTaskId +
								"].+";
							RegExp.quote = function(str) {
								return str.replace(/([?*^$[\]\\(){}|-])/g, "\\$1");
							};
							regexForNoteSearch = new RegExp(RegExp.quote(regexString));
							dependantTask.note = dependantTask.note.replace(
								regexForNoteSearch,
								""
							);
							// check whether any remaining prerequisite tasks listed in the note (i.e. whether all prerequisites completed) - and if so
							if (!/\[PREREQUISITE:/.test(dependantTask.note)) {
								// if no remaining prerequisites, remove 'Waiting' tag from dependant task
								dependantTask.removeTag(dependantTag);
							}
						}
					}
				}
			});
		});
	});

	action.validate = function(selection, sender) {
		// validation code
		// selection options: tasks, projects, folders, tags
		return true;
	};

	return action;
})();
_;
