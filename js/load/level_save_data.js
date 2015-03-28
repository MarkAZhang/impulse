var levelData = require('../data/level_data.js');

var LevelSaveData = function () {
  this.data = {};
};

LevelSaveData.prototype.loadDataFromVersion0 = function (load_obj) {
  for (var level in load_obj['levels']) {
    for (var difficulty in load_obj['levels'][level]['save_state']) {
      if (load_obj['levels'][level]['save_state'][difficulty]['seen'] &&
          levelData.levels[level] &&
          !levelData.levels[level].no_save) {
        this.saveLevel(
          level,
          load_obj['levels'][level]['save_state'][difficulty]['best_time'],
          difficulty);
      }
    }
  }
};

LevelSaveData.prototype.saveLevel = function (level_name, best_time, difficulty_mode) {
  var keyName = difficulty_mode + ' ' + level_name;
  if (!this.data[keyName]) {
    this.data[keyName] = {};
  }
  this.data[keyName]['best_time'] = best_time;
}

LevelSaveData.prototype.loadData = function (load_obj) {
  this.data = load_obj['level_data'];
};

LevelSaveData.prototype.addLevelDataToSaveObj = function (save_obj) {
  save_obj['level_data'] = this.data;
};

LevelSaveData.prototype.getLevelData = function (level_name, difficulty_mode) {
  var keyName = difficulty_mode + ' ' + level_name;
  return this.data[keyName];
};

LevelSaveData.prototype.hasBeatenLevel = function (level_name, difficulty_mode) {
  var keyName = difficulty_mode + ' ' + level_name;
  return this.data[keyName] !== undefined;
};

LevelSaveData.prototype.getBestTimeForLevel = function(level_name, difficulty_mode) {
  if (!this.hasBeatenLevel(level_name, difficulty_mode)) {
    return false;
  }
  return this.getLevelData(level_name, difficulty_mode).best_time;
};

LevelSaveData.prototype.setBestTimeForLevel = function(level_name, best_time, difficulty_mode) {
  this.saveLevel(level_name, best_time, difficulty_mode);
};

module.exports = LevelSaveData;
