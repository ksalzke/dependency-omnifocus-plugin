(() => {
  var action = new PlugIn.Action(function (selection, sender) {
    // config
    config = this.dependencyConfig;
    dependantTag = config.dependantTag();
    prerequisiteTag = config.prerequisiteTag();

    dependencyLibrary = this.dependencyLibrary;

    // get all remaining tasks that are waiting on prerequisites
    remainingTasks = [];
    dependantTag.tasks.forEach(function (task) {
      if (task.taskStatus === Task.Status.Blocked) {
        remainingTasks.push(task);
      }
    });

    // for each task that is waiting:
    remainingTasks.forEach(function (dependentTask) {
      // use regex to find [PREREQUISITE: taskid] matches in the notes and capture task IDs
      regex = /\[ ?PREREQUISITE: omnifocus:\/\/\/task\/(.*?) ?\]/g;
      var regexArray = [];
      prerequisiteTasksArray = [];
      while ((regexArray = regex.exec(dependentTask.note)) !== null) {
        // for each captured task ID
        prerequisiteTaskId = regexArray[1];
        // get the task with that ID and push to array
        prerequisiteTag.tasks.forEach(function (task) {
          if (task.id.primaryKey == prerequisiteTaskId) {
            prerequisiteTasksArray.push(task);
            return ApplyResult.Stop;
          }
        });
      }

      // for each prerequsite task that has been captured
      prerequisiteTasksArray.forEach((prerequisiteTask) => {
        dependencyLibrary.checkDependants(prerequisiteTask);
      });
    });
  });

  action.validate = function (selection, sender) {
    // only valid if nothing is selected - so does not show in share menu
    return selection.tasks.length == 0 && selection.projects.length == 0;
  };

  return action;
})();
