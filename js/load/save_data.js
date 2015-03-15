
var SaveData = function() {
  this.difficultyMode = "easy";
  this.firstTime = true;
  this.hardModeUnlocked = false;
  this.levelSaveData = new LevelSaveData();
  this.enemiesSeen = {};
  this.enemiesKilled = {};
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
    // IF PLAYER HAS BEATEN WORLD 4, UNLOCK HARD MODE.
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

  this.loadLevelData("easy", loadObj)
  this.loadLevelData("normal", loadObj)

  for(i in imp_params.impulse_enemy_stats) {
    //load if enemies are seen
    imp_params.impulse_enemy_stats[i].seen = loadObj['enemies_seen'][i] ? loadObj['enemies_seen'][i] : 0
    imp_params.impulse_enemy_stats[i].kills = loadObj['enemies_killed'][i] ? loadObj['enemies_killed'][i] : 0
  }
};

SaveData.prototype.loadLevelData = function (difficulty_level, load_obj) {
  for(i in imp_params.impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(typeof(imp_params.impulse_level_data[i].save_state) === "undefined") {
        imp_params.impulse_level_data[i].save_state = {}
      }
      imp_params.impulse_level_data[i].save_state[difficulty_level] = {}
      if(load_obj['levels'].hasOwnProperty(i) && load_obj['levels'][i]["save_state"] && load_obj['levels'][i]["save_state"][difficulty_level] ) {
        imp_params.impulse_level_data[i].save_state[difficulty_level].high_score = load_obj['levels'][i]["save_state"][difficulty_level]["high_score"]
        imp_params.impulse_level_data[i].save_state[difficulty_level].seen = load_obj['levels'][i]["save_state"][difficulty_level]["seen"]
        imp_params.impulse_level_data[i].save_state[difficulty_level].best_time = load_obj['levels'][i]["save_state"][difficulty_level]["best_time"]
      }
      else {
        imp_params.impulse_level_data[i].save_state[difficulty_level].high_score = 0
        imp_params.impulse_level_data[i].save_state[difficulty_level].seen = false
        imp_params.impulse_level_data[i].save_state[difficulty_level].best_time = 1000
      }
    }
  }
};

SaveData.prototype.saveGame = function() {
  var saveObj = {}
  saveObj['levels'] = {}
  this.saveLevelData('easy', saveObj)
  this.saveLevelData('normal', saveObj)
  saveObj['enemies_seen'] = {}
  saveObj['enemies_killed'] = {}

  for(i in imp_params.impulse_enemy_stats) {
    saveObj['enemies_seen'][i] = imp_params.impulse_enemy_stats[i].seen
    saveObj['enemies_killed'][i] = imp_params.impulse_enemy_stats[i].kills
  }

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

SaveData.prototype.saveLevelData = function(difficulty_level, save_obj) {
  for(i in imp_params.impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(!(save_obj['levels'].hasOwnProperty(i))) {
        save_obj['levels'][i] = {}
        save_obj['levels'][i]["save_state"] = {}
      }

      save_obj['levels'][i]["save_state"][difficulty_level] = {}
      save_obj['levels'][i]["save_state"][difficulty_level]["high_score"] = imp_params.impulse_level_data[i].save_state[difficulty_level].high_score
      save_obj['levels'][i]["save_state"][difficulty_level]["best_time"] = imp_params.impulse_level_data[i].save_state[difficulty_level].best_time
      save_obj['levels'][i]["save_state"][difficulty_level]["seen"] = imp_params.impulse_level_data[i].save_state[difficulty_level].seen
    }
  }
};

SaveData.prototype.savePlayerGame = function(hive_number) {
  this.savedGame = hive_number;
  this.saveGame();
};

SaveData.prototype.clearSavedPlayerGame = function() {
  this.savedGame = null;
  this.saveGame();
};

var saveData = new SaveData();
