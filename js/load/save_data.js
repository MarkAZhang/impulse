
var SaveData = function() {
  this.difficultyMode = "easy";
  this.firstTime = true;
  this.hardModeUnlocked = false;
  this.levels = new LevelSaveData();
  this.numEnemiesSeen = {};
  this.numEnemiesKilled = {};
  this.worldRankings = {
    'easy': {},
    'normal': {}
  };
  this.totalKills = 0;
  this.tutorialsShown = [];
  this.optionsData = new OptionsData();
  this.quests = [];
  this.savedGame = null;
};

SaveData.prototype.loadGame = function() {
  var loadObj = localStorage[imp_params.save_name];

  if (!loadObj) {
    send_logging_to_server('STARTED GAME', {});
    return;
  } else {
    loadObj = JSON.parse(loadObj);
  }

  this.firstTime = loadObj['first_time'];


  if (loadObj['save_data']) {
    this.savedGame = HiveNumbers.loadFromSaveObj(loadObj['save_data']);
  }

  if (loadObj['difficulty_mode']) {
    this.difficultyMode = loadObj['difficulty_mode'];
  }

  if (loadObj['hard_mode_unlocked'] !== undefined) {
    this.hardModeUnlocked = loadObj['hard_mode_unlocked'];
    if (!this.hardModeUnlocked) {
      this.difficultyMode = "easy";
    }
    // TODO: IF PLAYER HAS BEATEN WORLD 4, UNLOCK HARD MODE.
  }

  if (loadObj['total_kills']) {
    this.totalKills = loadObj['total_kills'];
  }

  if (loadObj['tutorial_shown']) {
    this.tutorialsShown = loadObj['tutorial_shown'];
  }

  this.optionsData.loadOptionsFromObj(loadObj['options']);

  if (loadObj['quests']) {
    this.quests = loadObj['quests'];
  }

  if (loadObj['world_rankings']) {
    this.worldRankings = loadObj['world_rankings'];
  }

  this.levels.loadData(loadObj['levels']);

  if (loadObj['enemies_seen']) {
    this.numEnemiesSeen = loadObj['enemies_seen'];
  }
  if (loadObj['enemies_killed']) {
    this.numEnemiesKilled = loadObj['enemies_killed'];
  }
};

SaveData.prototype.saveGame = function() {
  var saveObj = {}
  saveObj['levels'] = {}
  this.levels.addLevelDataToSaveObj(saveObj['levels']);
  saveObj['enemies_seen'] = this.numEnemiesSeen;
  saveObj['enemies_killed'] = this.numEnemiesKilled;

  saveObj['total_kills'] = this.totalKills;
  saveObj['difficulty_mode'] = this.difficultyMode;
  saveObj['world_rankings'] = this.worldRankings;
  if (this.savedGame) {
    saveObj['save_data'] = this.savedGame.createSaveObj();
  }
  saveObj['options'] = this.optionsData.createSaveObj();

  saveObj['first_time'] = this.firstTime;
  saveObj['hard_mode_unlocked'] = this.hardModeUnlocked;
  saveObj['tutorial_shown'] = this.tutorialsShown;
  saveObj['quests'] = this.quests;
  localStorage[imp_params.save_name] = JSON.stringify(saveObj)
};

SaveData.prototype.savePlayerGame = function(hive_number) {
  this.savedGame = hive_number;
  this.saveGame();
};

// Convenience function.
SaveData.prototype.getLevelData = function (level_name) {
  return this.levels.data[this.difficultyMode][level_name];
}

SaveData.prototype.clearSavedPlayerGame = function() {
  this.savedGame = null;
  this.saveGame();
};

var saveData = new SaveData();
