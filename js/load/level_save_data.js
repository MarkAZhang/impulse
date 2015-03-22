var levelData = require('../data/level_data.js');

var LevelSaveData = function () {
  this.data = {
    "easy": {},
    "normal": {}
  };
  this.setUpDataForDifficulty('easy');
  this.setUpDataForDifficulty('normal');
};

LevelSaveData.prototype.setUpDataForDifficulty = function (difficulty_level) {
  for(i in levelData) {
    this.data[difficulty_level][i] = {};
    this.data[difficulty_level][i].high_score = 0;
    this.data[difficulty_level][i].seen = false;
    this.data[difficulty_level][i].best_time = 1000;
  }
};

LevelSaveData.prototype.loadData = function (load_obj) {
  this.loadDataForDifficulty(load_obj, "easy");
  this.loadDataForDifficulty(load_obj, "normal");
};

LevelSaveData.prototype.loadDataForDifficulty = function (load_obj, difficulty_level) {
  for (i in levelData) {
    if (load_obj.hasOwnProperty(i) &&
        load_obj[i]["save_state"] &&
        load_obj[i]["save_state"][difficulty_level]) {
      this.data[difficulty_level][i].high_score = load_obj[i]["save_state"][difficulty_level]["high_score"];
      this.data[difficulty_level][i].seen = load_obj[i]["save_state"][difficulty_level]["seen"];
      this.data[difficulty_level][i].best_time = load_obj[i]["save_state"][difficulty_level]["best_time"];
    }
  }
};

LevelSaveData.prototype.addLevelDataToSaveObj = function (save_obj) {
  this.addLevelDataForDifficulty(save_obj, 'easy');
  this.addLevelDataForDifficulty(save_obj, 'normal');
};

LevelSaveData.prototype.addLevelDataForDifficulty = function (save_obj, difficulty_level) {
  for(i in levelData) {
    if(!(save_obj.hasOwnProperty(i))) {
      save_obj[i] = {}
      save_obj[i]["save_state"] = {}
    }

    save_obj[i]["save_state"][difficulty_level] = {}
    save_obj[i]["save_state"][difficulty_level]["high_score"] = this.data[difficulty_level][i].high_score
    save_obj[i]["save_state"][difficulty_level]["best_time"] = this.data[difficulty_level][i].best_time
    save_obj[i]["save_state"][difficulty_level]["seen"] = this.data[difficulty_level][i].seen
  }
};

module.exports = LevelSaveData;
