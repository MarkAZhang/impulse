var WorldSaveData = function () {
  this.data = {};
};

WorldSaveData.prototype.loadDataFromVersion0 = function (load_obj) {
  for (var difficulty in load_obj['world_rankings']) {
    for (var world in load_obj['world_rankings'][difficulty]) {
      this.saveWorld(world, 10000, difficulty);
    }
  }
};

WorldSaveData.prototype.saveWorld = function (world_name, best_time, difficulty_mode) {
  var keyName = difficulty_mode + ' ' + world_name;
  if (!this.data[keyName]) {
    this.data[keyName] = {};
  }
  this.data[keyName]['best_time'] = best_time;
}

WorldSaveData.prototype.loadData = function (load_obj) {
  this.data = load_obj['world_data'];
};

WorldSaveData.prototype.hasBeatenWorld = function (world_name, difficulty_mode) {
  var keyName = difficulty_mode + ' ' + world_name;
  return this.data[keyName] !== undefined;
}

WorldSaveData.prototype.getWorldData = function (world_name, difficulty_mode) {
  var keyName = difficulty_mode + ' ' + world_name;
  return this.data[keyName];
};

WorldSaveData.prototype.addWorldDataToSaveObj = function (save_obj) {
  save_obj['world_data'] = this.data;
};

WorldSaveData.prototype.getBestTimeForWorld = function(world_name, difficulty_mode) {
  if (!this.hasBeatenLevel(world_name, difficulty_mode)) {
    return false;
  }
  return this.getWorldData(world_name, difficulty_mode).best_time;
};

WorldSaveData.prototype.setBestTimeForWorld = function(world_name, best_time, difficulty_mode) {
  this.saveWorld(world_name, best_time, difficulty_mode);
};

module.exports = WorldSaveData;
