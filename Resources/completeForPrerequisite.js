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
		// if called externally (from script) generate selection object
		if (typeof selection == "undefined") {
			selection = document.windows[0].selection;
		}

		task = selection.tasks[0] || selection.projects[0].task;

		// get list of all "parent" tasks (up to project level)
		listOfTasks = [task];
		parent = getParent(task);
		while (parent !== null) {
			listOfTasks.push(parent);
			parent = getParent(parent);
		}

		// mark the task as complete
		task.markComplete();

		// check this task, and any parent tasks, for dependants
		listOfTasks.forEach(task => {
			this.dependencyLibrary.checkDependants(task);
		});
	});

	action.validate = function(selection, sender) {
		return selection.tasks.length === 1 || selection.projects.length === 1;
	};

	return action;
})();
_;

function getParent(task) {
  parent = null;
  if (task.containingProject == null) {
    project = inbox;
  } else {
    project = task.containingProject.task;
  }
	project.apply(item => {
		if (item.children.includes(task)) {
			parent = item;
			return ApplyResult.Stop;
		}
	});
	return parent;
}
