(() => {
  var action = new PlugIn.Action(function (selection, sender) {
    // config
    config = this.dependencyConfig;
    prereqTag = config.prerequisiteTag();

    dependencyLibrary = this.dependencyLibrary;

    prereqTag.remainingTasks.forEach((task) => {
      // for each remaining task tagged as a prerequisite...

      // get dependant tasks
      dependentTasks = dependencyLibrary.getDependants(task);

      // find earliest due date
      earliestDue = null;
      dependentTasks.forEach((dep) => {
        console.log(dep);
        console.log(dep.effectiveDueDate + " ");
        if (dep.effectiveDueDate < earliestDue || earliestDue == null) {
          earliestDue = dep.effectiveDueDate;
        }
      });

      // if earlier than task's current effective due date, use earlier date
      if (
        (earliestDue < task.effectiveDueDate && earliestDue !== null) ||
        task.effectiveDueDate == null
      ) {
        task.dueDate = earliestDue;
      }
    });
  });

  action.validate = function (selection, sender) {
    // only valid if nothing is selected - so does not show in share menu
    return selection.tasks.length == 0 && selection.projects.length == 0;
  };

  return action;
})();
