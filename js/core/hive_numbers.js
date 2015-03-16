var HiveNumbers = function (world_num, main_game) {
  if(world_num === undefined)return

  this.hit = false;
  this.main_game = main_game
  if (world_num > 0) {
    this.speed_run_countdown = questData["blitz_hive" + world_num].time_cutoff * 1000// in ms
  }

  this.total_time = {};

  this.current_level = null

  this.game_numbers = {}
  this.world = world_num
  if (this.world == 0) {
    this.hive_name = "TUTORIAL"
  } else {
    this.hive_name = levelData.hiveNames[world_num]
  }

  this.boss_name = levelData.bossNames[world_num];
}

HiveNumbers.loadFromSaveObj = function (saveObj) {
  var hiveNumbers = new HiveNumbers();
  if (!saveObj) {
    return;
  }

  // Previously, saved games for easy and normal were saved separately.
  if (saveObj['easy'] && saveObj['easy']['current_level']) {
    saveObj = saveObj['easy'];
  } else if (saveObj['normal'] && saveObj['normal']['current_level']) {
    saveObj = saveObj['normal'];
  }
  hiveNumbers.hit = saveObj['hit'];
  hiveNumbers.main_game = saveObj['main_game'];
  hiveNumbers.speed_run_countdown = saveObj['speed_run_countdown'];
  hiveNumbers.total_time = saveObj['total_time'];
  hiveNumbers.current_level = saveObj['current_level'];
  hiveNumbers.game_numbers = saveObj['game_numbers'];
  hiveNumbers.world = saveObj['world'] || 1;
  hiveNumbers.hive_name = saveObj['hive_name'];
  hiveNumbers.boss_name = saveObj['boss_name'];

  return hiveNumbers;
};

HiveNumbers.prototype.createSaveObj = function () {
  return {
    'hit': this.hit,
    'main_game': this.main_game,
    'speed_run_countdown': this.speed_run_countdown,
    'total_time': this.total_time,
    'current_level': this.current_level,
    'game_numbers': this.game_numbers,
    'hive_name': this.hive_name,
    'boss_name': this.boss_name,
    'world': this.world
  };
};
