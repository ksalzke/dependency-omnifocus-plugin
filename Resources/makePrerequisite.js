(() => {
  var action = new PlugIn.Action(function (selection, sender) {
    config = this.dependencyConfig;

    // configure tags
    markerTag = config.markerTag();

    tasks = selection.tasks;

    tasks.forEach(function (task) {
      task.addTag(markerTag);
    });
  });

  action.validate = function (selection, sender) {
    return selection.tasks.length > 0;
  };

  return action;
})();
