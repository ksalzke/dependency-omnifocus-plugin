var _ = (function() {
	var dependencyConfig = new PlugIn.Library(new Version("1.0"));

	dependencyConfig.markerTag = function() {
		// edit the below line to configure the tag used to mark a task
		// before running "Add Prerequisite" to turn it into a dependent task
		return tagNamed("Dependency").tagNamed("Make Prerequisite");
	};

	dependencyConfig.prerequisiteTag = function() {
		// edit the below line to configure the tag used to mark a task
		// as the prerequisite of another task
		return tagNamed("Dependency").tagNamed("🔑");
	};

	dependencyConfig.dependantTag = function() {
		// edit the below line to configure the tag used to mark a
		// task as being dependent on another task
		return tagNamed("Dependency").tagNamed("🔒 Dependant");
	};

	return dependencyConfig;
})();
_;
