var HiveNumbers = function(world_num) {

  this.lives = calculate_lives()
  this.sparks = 0
  this.ultimates = calculate_ult()
  this.continues = 0
  this.spark_val = calculate_spark_val()

  this.last_lives = this.lives
  this.last_sparks = 0
  this.last_ultimates = this.ultimates

  this.current_level = null

  this.game_numbers = {}
  this.world = world_num
  this.hive_name = "HIVE "+imp_params.tessellation_names[world_num]
  this.boss_name = imp_params.tessellation_names[world_num]

  this.original_rating = calculate_current_rating()
}

HiveNumbers.prototype.continue = function() {
  this.lives = calculate_lives()
  this.sparks = 0
  this.ultimates = calculate_ult()
  this.spark_val = calculate_spark_val()
  this.last_lives = this.lives
  this.last_sparks = 0
  this.last_ultimates = this.ultimates
  this.continues += 1
}

