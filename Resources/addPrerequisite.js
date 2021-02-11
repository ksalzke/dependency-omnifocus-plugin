(() => {
  var action = new PlugIn.Action(function (selection, sender) {
    config = this.dependencyConfig;

    // configure tags
    markerTag = config.markerTag();
    prerequisiteTag = config.prerequisiteTag();
    dependantTag = config.dependantTag();

    dependantTask = selection.tasks[0] || selection.projects[0].task;

    function makeDependant(dep, prereq) {
      pId = prereq.id.primaryKey;
      dep.addTag(dependantTag); // add waiting tag to selected note
      dep.note =
        "[ PREREQUISITE: omnifocus:///task/" +
        pId +
        " ] " +
        prereq.name +
        "\n\n" +
        dep.note; // prepend prerequisite details to selected note

      if (dep.project !== null) {
        dep.project.status = Project.Status.OnHold;
      }

      // if dependant task has children:
      if (dep.hasChildren) {
        if (dep.sequential) {
          makeDependant(dep.children[0], prereq);
        } else {
          dep.children.forEach((child) => {
            makeDependant(child, prereq);
          });
        }
      }
    }

    // GET PREREQUISITE
    // get all tasks tagged with 'prerequisite'
    prereqTasks = markerTag.tasks;

    prereqTasks.forEach((prereqTask) => {
      // DEAL WITH SELECTED (DEPENDENT) NOTE
      makeDependant(dependantTask, prereqTask);

      // DEAL WITH PREREQUISITE TASK
      prereqTask.addTag(prerequisiteTag); // add tag to prerequisite
      prereqTask.note =
        "[ DEPENDANT: omnifocus:///task/" +
        dependantTask.id.primaryKey +
        " ] " +
        dependantTask.name +
        "\n\n" +
        prereqTask.note; // prepend dependant details to prerequisite note
      prereqTask.removeTag(markerTag); // remove marker tag used for processing;
    });
  });

  action.validate = function (selection, sender) {
    return (
      (selection.tasks.length === 1 || selection.projects.length == 1) &&
      this.dependencyConfig.markerTag().tasks.length >= 1
    );
  };

  return action;
})();
