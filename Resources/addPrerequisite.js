var _ = (function() {
	var action = new PlugIn.Action(function(selection, sender) {
		config = this.dependencyConfig;

		// configure tags
		markerTag = config.markerTag();
		prerequisiteTag = config.prerequisiteTag();
		dependantTag = config.dependantTag();

		task = selection.tasks[0] || selection.projects[0].task;

		// GET PREREQUISITE
		// get all tasks tagged with 'prerequisite'
		prereqTask = markerTag.tasks[0];
		prereqTaskId = prereqTask.id.primaryKey;

		// DEAL WITH SELECTED (DEPENDENT) NOTE
		task.addTag(dependantTag); // add waiting tag to selected note
		task.note =
			"[PREREQUISITE: omnifocus:///task/" +
			prereqTaskId +
			"] " +
			prereqTask.name +
			"\n\n" +
			task.note; // prepend prerequisite details to selected note

		if (task.project !== null) {
			task.project.status = Project.Status.OnHold;
		}

		// DEAL WITH PREREQUISITE TASK
		prereqTask.addTag(prerequisiteTag); // add tag to prerequisite
		prereqTask.note =
			"[DEPENDANT: omnifocus:///task/" +
			task.id.primaryKey +
			"] " +
			task.name +
			"\n\n" +
			prereqTask.note; // prepend dependant details to prerequisite note
		prereqTask.removeTag(markerTag); // remove marker tag used for processing;
	});

	action.validate = function(selection, sender) {
		return (
			(selection.tasks.length === 1 || selection.projects.length == 1) &&
			this.dependencyConfig.markerTag().tasks.length == 1
		);
	};

	return action;
})();
_;
