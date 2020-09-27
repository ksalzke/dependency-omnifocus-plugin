(() => {
  var dependencyLibrary = new PlugIn.Library(new Version("1.0"));

  dependencyLibrary.dependantTag = function () {
    return PlugIn.find("com.KaitlinSalzke.DependencyForOmniFocus")
      .library("dependencyConfig")
      .dependantTag();
  };

  dependencyLibrary.checkDependants = (task) => {
    dependantTag = dependencyLibrary.dependantTag();

    var prerequisiteTask = task;

    if (prerequisiteTask.completed) {
      // use regex to find [DEPENDANT: taskid] matches in the notes and capture task IDs
      regex = /\[ ?DEPENDANT: omnifocus:\/\/\/task\/(.*?) ?\]/g;
      var regexArray = [];
      while ((regexArray = regex.exec(prerequisiteTask.note)) !== null) {
        // for each captured task ID
        dependantTaskId = regexArray[1];
        // get the task with that ID
        var dependantTask = null;
        dependantTag.tasks.forEach(function (task) {
          if (task.id.primaryKey == dependantTaskId) {
            dependantTask = task;
            return ApplyResult.Stop;
          }
        });

        function removeDependant(dependant, prerequisiteTask) {
          //get task ID of selected task
          prerequisiteTaskId = prerequisiteTask.id.primaryKey;
          // remove the prerequisite tag from the dependant task
          regexString =
            "[ ?PREREQUISITE: omnifocus:///task/" +
            prerequisiteTaskId +
            " ?].+";
          RegExp.quote = function (str) {
            return str.replace(/([*^$[\]\\(){}|-])/g, "\\$1");
          };
          regexForNoteSearch = new RegExp(RegExp.quote(regexString));
          dependant.note = dependant.note.replace(regexForNoteSearch, "");
          // check whether any remaining prerequisite tasks listed in the note
          // (i.e. whether all prerequisites completed) - and if so
          if (!/\[ ?PREREQUISITE:/.test(dependant.note)) {
            // if no remaining prerequisites, remove 'Waiting' tag from dependant task
            // (and if project set to Active)
            dependant.removeTag(dependantTag);
            if (dependant.project !== null) {
              dependant.project.status = Project.Status.Active;
            }
          }

          // if dependant task has children:
          if (dependant.hasChildren) {
            if (dependant.sequential) {
              removeDependant(dependant.children[0], prerequisiteTask);
            } else {
              dependant.children.forEach((child) => {
                removeDependant(child, prerequisiteTask);
              });
            }
          }
        }

        removeDependant(dependantTask, prerequisiteTask);
      }
    }
  };

  dependencyLibrary.checkDependantsForTaskAndAncestors = (task) => {
    functionLib = PlugIn.find("com.KaitlinSalzke.functionLibrary").library(
      "functionLibrary"
    );

    // get list of all "parent" tasks (up to project level)
    listOfTasks = [task];
    parent = functionLib.getParent(task);
    while (parent !== null) {
      listOfTasks.push(parent);
      parent = functionLib.getParent(parent);
    }

    // check this task, and any parent tasks, for dependants
    listOfTasks.forEach((task) => {
      dependencyLibrary.checkDependants(task);
    });
  };

  return dependencyLibrary;
})();
