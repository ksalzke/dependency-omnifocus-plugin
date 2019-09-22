var _ = (function() {
	var dependencyLibrary = new PlugIn.Library(new Version("1.0"));

	dependencyLibrary.dependantTag = function() {
		return PlugIn.find("com.KaitlinSalzke.DependencyForOmniFocus")
			.library("dependencyConfig")
			.dependantTag();
	};

	dependencyLibrary.checkDependants = task => {
		dependantTag = dependencyLibrary.dependantTag();

		//get task ID of selected task
		var prerequisiteTaskId = task.id.primaryKey;
		var prerequisiteTask = task;

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
				// check whether any remaining prerequisite tasks listed in the note
				// (i.e. whether all prerequisites completed) - and if so
				if (!/\[PREREQUISITE:/.test(dependantTask.note)) {
					// if no remaining prerequisites, remove 'Waiting' tag from dependant task
					// (and if project set to Active)
					dependantTask.removeTag(dependantTag);
					if (dependantTask.project !== null) {
						dependantTask.project.status = Project.Status.Active;
					}
				}
			}
		}
	};

	dependencyLibrary.getParent = task => {
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
	};

	dependencyLibrary.checkDependantsForTaskAndAncestors = task => {
		// get list of all "parent" tasks (up to project level)
		listOfTasks = [task];
		parent = dependencyLibrary.getParent(task);
		while (parent !== null) {
			listOfTasks.push(parent);
			parent = dependencyLibrary.getParent(parent);
		}

		// check this task, and any parent tasks, for dependants
		listOfTasks.forEach(task => {
			dependencyLibrary.checkDependants(task);
		});
	};

	return dependencyLibrary;
})();
_;
