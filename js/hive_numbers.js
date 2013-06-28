var HiveNumbers = function(world_num) {

  this.lives = 3
  this.sparks = 0
  this.continues = 0

  this.last_lives = 3
  this.last_sparks = 0

  this.current_level = null

  this.game_numbers = {}
  this.world = world_num
  if(world_num == 1) {
    this.hive_name = "HIVE IMMUNITAS"
    this.boss_name = "IMMUNITAS"
  } else if(world_num == 2){
    this.hive_name = "HIVE CONSUMENDI"
    this.boss_name = "CONSUMENDI"
  } else if(world_num == 3){
    this.hive_name = "HIVE NEGLIGENTIA"
    this.boss_name = "NEGLIGENTIA"
  }
}

HiveNumbers.prototype.continue = function() {
  this.lives = 3
  this.sparks = 0
  this.last_lives = 3
  this.last_sparks = 0
  this.continues += 1
}