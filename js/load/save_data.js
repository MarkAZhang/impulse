var logging = require('../core/logging.js');
var _ = require('lodash');

var HiveNumbers = require('../load/hive_numbers.js');
var LevelSaveData = require('../load/level_save_data.js');
var WorldSaveData = require('../load/world_save_data.js');
var OptionsData = require('../load/options_data.js');

var LOCAL_STORAGE_BUCKET_NAME = "impulse_save_data"

var SaveData = function() {
  this.resetData();
};

SaveData.prototype.version = "1.0.0";

SaveData.prototype.resetData = function () {
  this.difficultyMode = "easy";
  this.firstTime = true; // Used to change the player's experience the first time.
  this.levelData = new LevelSaveData();
  this.worldData = new WorldSaveData();
  this.enemiesSeen = [];
  this.tutorialsShown = [];
  this.optionsData = new OptionsData();
  this.quests = [];
  this.savedGame = null;
};

SaveData.prototype.versionIsLessThan = function (versionOne, versionTwo) {
  if (!versionOne) {
    return true;
  }

  var getVersionParts = function (versionString) {
    return _.map(versionString.split("."), function (token) {
      return parseInt(token);
    });
  };

  var verOne = getVersionParts(versionOne);
  var verTwo = getVersionParts(versionTwo);
  return (verOne[0] < verTwo[0]) ||
    (verOne[0] == verTwo[0] && verOne[1] < verTwo[1]) ||
    (verOne[0] == verTwo[0] && verOne[1] == verTwo[1] && verOne[2] < verTwo[2]);
};

SaveData.prototype.loadObjIsOldVersion = function (loadObj) {
  if (!loadObj['saveVersion']) {
    return true;
  }
  var loadObjVersion = loadObj['saveVersion'];
  return this.versionIsLessThan(loadObjVersion, this.version);
};

// Want to preserve player's progress
SaveData.prototype.loadFromOldVersion = function (loadObj) {
  var loadObjVersion = loadObj['saveVersion'];
  if (this.versionIsLessThan(loadObjVersion, '1.0.0')) {
    // Enemies seen used to be an object with times we've seen the enemy. Now it's an array.
    for (var enemy in loadObj['enemies_seen']) {
      this.enemiesSeen.push(enemy);
    }
    this.worldData.loadDataFromVersion0(loadObj);
    this.levelData.loadDataFromVersion0(loadObj);
  }
}

SaveData.prototype.loadGame = function() {
  var loadObj = localStorage[LOCAL_STORAGE_BUCKET_NAME];

  if (!loadObj) {
    logging.send_logging_to_server('STARTED GAME', {});
    return;
  } else {
    loadObj = JSON.parse(loadObj);
  }

  this.firstTime = loadObj['first_time'];

  // Take care of legacy formats.
  if (this.loadObjIsOldVersion(loadObj)) {
    this.loadFromOldVersion(loadObj);
    return;
  }

  if (loadObj['save_data']) {
    this.savedGame = HiveNumbers.loadFromSaveObj(loadObj['save_data']);
  }

  if (loadObj['difficulty_mode']) {
    this.difficultyMode = loadObj['difficulty_mode'];
  }

  if (loadObj['tutorial_shown']) {
    this.tutorialsShown = loadObj['tutorial_shown'];
  }

  this.optionsData.loadOptionsFromObj(loadObj['options']);

  if (loadObj['quests']) {
    this.quests = loadObj['quests'];
  }

  this.levelData.loadData(loadObj);
  this.worldData.loadData(loadObj);

  if (loadObj['enemies_seen']) {
    this.enemiesSeen = loadObj['enemies_seen'];
  }
};

SaveData.prototype.saveGame = function() {
  var saveObj = {}
  saveObj['saveVersion'] = this.version;
  this.levelData.addLevelDataToSaveObj(saveObj);
  this.worldData.addWorldDataToSaveObj(saveObj);
  saveObj['enemies_seen'] = this.enemiesSeen;

  saveObj['difficulty_mode'] = this.difficultyMode;
  if (this.savedGame) {
    saveObj['save_data'] = this.savedGame.createSaveObj();
  }
  saveObj['options'] = this.optionsData.createSaveObj();

  saveObj['first_time'] = this.firstTime;
  saveObj['tutorial_shown'] = this.tutorialsShown;
  saveObj['quests'] = this.quests;
  localStorage[LOCAL_STORAGE_BUCKET_NAME] = JSON.stringify(saveObj)
};

SaveData.prototype.clearData = function () {
  localStorage.removeItem(LOCAL_STORAGE_BUCKET_NAME);
  var oldPlayerOptions = this.optionsData;
  var oldTutorialShown = this.tutorialsShown;
  this.resetData();
  this.loadGame();
  this.optionsData = oldPlayerOptions
  this.tutorialsShown = oldTutorialShown;
  this.firstTime = false
  this.saveGame();
};

SaveData.prototype.savePlayerGame = function(hive_number) {
  this.savedGame = hive_number;
  this.saveGame();
};

SaveData.prototype.hasBeatenLevel = function(level_name) {
  return this.levelData.hasBeatenLevel(level_name, this.difficultyMode);
}

SaveData.prototype.getBestTimeForLevel = function(level_name) {
  return this.levelData.getBestTimeForLevel(level_name, this.difficultyMode);
}

SaveData.prototype.setBestTimeForLevel = function(level_name, best_time) {
  this.levelData.setBestTimeForLevel(level_name, best_time, this.difficultyMode);
}

SaveData.prototype.hasBeatenWorld = function(i) {
  return this.worldData.hasBeatenWorld('world ' + i, this.difficultyMode);
}

SaveData.prototype.hasBeatenWorldForDifficulty = function(i, difficulty) {
  return this.worldData.hasBeatenWorld('world ' + i, difficulty);
}

SaveData.prototype.latestWorld = function() {
  var i = 1;
  while(i < 4 && this.hasBeatenWorld(i)) {
    i += 1
  }
  return i;
}

SaveData.prototype.getBestTimeForWorld = function(i) {
  return this.worldData.getBestTimeForWorld('world ' + i, this.difficultyMode);
}

SaveData.prototype.setBestTimeForWorld = function(i, best_time) {
  this.worldData.setBestTimeForWorld('world ' + i, best_time, this.difficultyMode);
}

SaveData.prototype.isHardModeUnlocked = function () {
  return this.hasBeatenWorldForDifficulty(4, 'easy');
}

SaveData.prototype.clearSavedPlayerGame = function() {
  this.savedGame = null;
  this.saveGame();
};

SaveData.prototype.isQuestCompleted = function (name) {
  return this.quests.indexOf(name) != -1
}

SaveData.prototype.setQuestCompleted = function(name) {
  if (!this.isQuestCompleted(name)) {
    this.quests.push(name);
    this.saveGame();
  }
}

SaveData.prototype.shouldShowLevelZero = function (world_num) {
  // Easy difficulty, and we've never played this world before.
  return this.difficultyMode == "easy" && this.hasBeatenLevel("HIVE " + world_num + "-1");
};

module.exports = new SaveData();
