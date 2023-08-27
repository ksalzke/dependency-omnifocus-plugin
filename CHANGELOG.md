# [4.3.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v4.2.1...v4.3.0) (2023-08-27)


### Bug Fixes

* :bug: fix bug where multiple dependencies can not be added simultaneously ([de0da7e](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/de0da7ef4b5675a92e2b0977b7560e60dfc4a346)), closes [#30](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/30)


### Features

* :sparkles: add 'search and add' actions ([69aedac](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/69aedac859d1ae3cd1b5b8190da625bd92afbaf6))



## [4.2.1](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v4.2.0...v4.2.1) (2022-03-05)


### Bug Fixes

* :bug: fix bug where dates were removed when checking for duplicates, causing dependents of prerequisites with repetitions to never become available ([fed2213](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/fed2213ded553b8c4ca73cec5910efbc8505c3c5))



# [4.2.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v4.1.1...v4.2.0) (2022-02-19)


### Features

* :lipstick: rename 'Preferences' to 'Preferences: Dependency' ([5ca7dd3](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/5ca7dd3be8a05418b9429e1357333640fa313c9c))
* :sparkles: update validation so actions always available ([162806f](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/162806f221425fe9054467d363eb0f2185141219))



## [4.1.1](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v4.1.0...v4.1.1) (2022-01-26)


### Bug Fixes

* :bug: fix case where a tag no longer exists ([bec78c9](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/bec78c9a7406d361c8d0e3e74ec117213351e80f))



# [4.1.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v4.0.0...v4.1.0) (2022-01-25)


### Features

* :sparkles: add 'prompt for additional tasks to be added' as an optional setting ([cf89a7a](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/cf89a7a1925e55ef6db83fbaec2307003d4fd5c9)), closes [#23](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/23)



# [4.0.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v3.6.0...v4.0.0) (2021-12-02)


### Bug Fixes

* 'remove' now removes doubled-up links ([db2945f](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/db2945f59a1c76b1ecae59b467ed505134f4969e)), closes [#13](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/13)
* enable repeating tasks to be used as prerequisites ([bd8d3f5](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/bd8d3f5561d07ba2bfa7ff3251c602bccdd50d26)), closes [#12](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/12)


### Code Refactoring

* make spelling of 'dependent' consistent (except notes) ([105fa32](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/105fa32c0fd28057140efce29cdfd72cfb83962d)), closes [#20](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/20)


### Features

* add addNote function ([198b9ae](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/198b9ae1be1e918f73c47bdf4b4f6d63044cb371))
* always show 'Check Prerequisites', 'Preferences', 'Update Defer Dates' and 'Update Due Dates' actions on macOS ([c2d6de9](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/c2d6de9218b04304fc2afc9053a32a2c381a7196))
* create/remove notes when 'add notes' preference changed ([376fb00](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/376fb00904ac0af086e47a4013f18f1b7cbadb0a))
* prevent same note being added twice ([a0b2db8](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/a0b2db81832ed71b212e1af167696ad0e4762fe0))
* remove dependant and prerequisite tags when no longer applicable ([4765503](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/4765503d48d3fc459d06693fb7319d6640866b21)), closes [#17](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/17)
* remove duplicates as part of updateDependencies() ([9874ced](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/9874ced76eece504fb17a89a3aae3a9c42b86f62))
* reword link in notes to be clearer ([c047639](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/c0476395da0b01575cda1979537e98994ee0b468)), closes [#19](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/19)


### BREAKING CHANGES

* The spelling of 'dependant' has been changed to 'dependent' for several functions and actions.
* updateDependancies, updateDueDates and updateDeferDates functions now asynchronous

fix direction of check for deleting items with tag



# [3.6.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v3.5.0...v3.6.0) (2021-11-22)


### Features

* restructure for easier installation ([d600397](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/d6003971eaff7e1da094b23f64d7040897be71b4))



# [3.5.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v3.4.0...v3.5.0) (2021-11-08)


### Features

* add 'Update Defer Dates' action ([f550abf](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/f550abf163da2a76b24f3f7772691f6d3e816cf5))



# [3.4.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v3.3.0...v3.4.0) (2021-11-08)


### Features

* add 'updateToV3' helper script ([8054463](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/8054463172cb1e4bf5db720e79c24000ef458eba))



# [3.3.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v3.2.0...v3.3.0) (2021-11-07)


### Features

* add pref to make links in notes optional ([454254b](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/454254bba1628b508284c4eff98acd837c12ad97)), closes [#9](https://github.com/ksalzke/dependency-omnifocus-plugin/issues/9)



# [3.2.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v3.1.0...v3.2.0) (2021-11-07)


### Bug Fixes

* get updateDueDates working ([d4897b0](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/d4897b06bf8b4a607020780edc9d2d3d4ea45f8e))


### Features

* add getAllPrereqs function ([f6a974e](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/f6a974eddd4602672714599f3ef38394b5e49b85))
* add preference to update due dates ([7fcfb88](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/7fcfb88cf86a66271826c218542fecc720f0fcc8))



# [3.1.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v3.0.0...v3.1.0) (2021-11-07)


### Features

* add 'Go To Dependant' action ([42e0e11](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/42e0e11b45ebc778f196e38ce03c5d25b954dada))
* add 'Go To Prerequisite' action ([58ee71d](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/58ee71d864b8ac3454e520968bf7003cea448cdf))
* add 'Remove Dependant(s)' action ([fdcc05b](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/fdcc05bc8739fd0df6e67d8e2f4ce8fe1af94596))
* Add 'Remove Prerequisite(s) action ([d8ae17b](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/d8ae17b0f6180c0da3e4f8b89189a30574d690a1))



# [3.0.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v2.3.0...v3.0.0) (2021-11-06)


### Features

* use syncedPrefs ([c8d8c19](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/c8d8c19cd64f68019f634f6e12d2980a5cdd65a1))


### BREAKING CHANGES

* 'Make Prerequisite' renamed to 'Add Prerequisite Marker' for clarity
* remove unused functions 'checkDependants', 'checkDependantsForTaskAndAncestors'



# [2.3.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v2.2.0...v2.3.0) (2021-11-01)


### Features

* add ability to tag projects with marker tag ([2239b21](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/2239b21357a31ffca53b609fdc6bc2a15383659c))



# [2.2.0](https://github.com/ksalzke/dependency-omnifocus-plugin/compare/v2.0.0...v2.2.0) (2021-11-01)


### Features

* add SF symbols ([1faa527](https://github.com/ksalzke/dependency-omnifocus-plugin/commit/1faa5279fc7e04845f5784fcd166b6941970db89))



# 2.0.0 (2019-09-22)



