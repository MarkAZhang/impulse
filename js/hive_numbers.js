var HiveNumbers = function(world_num) {

  this.lives = 3
  this.bits = 0
  this.continues = 0

  this.last_lives = null
  this.last_bits = null

  this.current_level = null

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

HiveNumbers.prototype.continue = function() {
  this.lives = 3
  this.bits = 0
  this.continues += 1
}