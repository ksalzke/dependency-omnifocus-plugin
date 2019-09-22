/*{
	"type": "action",
	"targets": ["omnifocus"],
	"author": "Kaitlin Salzke",
	"identifier": "com.KaitlinSalzke.completeForPrerequisite",
	"version": "1.1,
	"description": "Finds dependant tasks in the currently selected task's note; removes the prerequisite details from the dependant task's note; removes the 'Waiting' tag from the dependant task if no remaining prerequisites; and marks the current task as completed.",
	"label": "Complete For Prerequisite",
	"shortLabel": "Complete For Prerequisite"
}*/
var _ = (function() {
	var action = new PlugIn.Action(function(selection, sender) {
		// if called externally (from script) generate selection object
		if (typeof selection == "undefined") {
			selection = document.windows[0].selection;
		}

		task = selection.tasks[0] || selection.projects[0].task;

		// mark the task as complete
		task.markComplete();

		// check dependants
		this.dependencyLibrary.checkDependantsForTaskAndAncestors(task);
	});

	action.validate = function(selection, sender) {
		return selection.tasks.length === 1 || selection.projects.length === 1;
	};

	return action;
})();
_;
