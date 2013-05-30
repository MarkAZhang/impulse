var HiveNumbers = function(world_num) {

  this.lives = 3
  this.bits = 0

  this.game_numbers = {}
  this.world = world_num
  if(world_num == 1) {
    this.hive_name = "HIVE IMMUNITAS"
    this.boss_name = "IMMUNITAS"
  } else if(world_num == 2){
    this.hive_name = "HIVE CONSUMENDI"
    this.boss_name = "CONSUMENDI"
  }
}

