var HiveNumbers = function(world_num) {

  this.lives = 0
  this.sparks = 0
  this.continues = 0

  this.last_lives = 3
  this.last_sparks = 0

  this.current_level = null

  this.game_numbers = {}
  this.world = world_num
  this.hive_name = "HIVE "+imp_params.tessellation_names[world_num]
  this.boss_name = imp_params.tessellation_names[world_num]

  this.original_rating = calculate_current_rating()
}

HiveNumbers.prototype.continue = function() {
  this.lives = 0
  this.sparks = 0
  this.last_lives = 0
  this.last_sparks = 0
  this.continues += 1
}