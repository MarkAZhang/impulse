var HiveNumbers = function(world_num, main_game) {

  if(world_num === undefined)return

  this.hit = false;
  this.main_game = main_game
  if (world_num > 0) {
    this.speed_run_countdown = imp_params.quest_data["blitz_hive" + world_num].time_cutoff * 1000// in ms
  }

  this.total_time = {};

  this.current_level = null

  this.game_numbers = {}
  this.world = world_num
  if (this.world == 0) {
    this.hive_name = "TUTORIAL"
  } else {
    this.hive_name = imp_params.hive_names[world_num]
  }

  this.boss_name = imp_params.tessellation_names[world_num]
}
