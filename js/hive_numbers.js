var HiveNumbers = function(world_num, main_game) {

  if(world_num === undefined)return

  this.lives = calculate_lives()
  this.sparks = 0
  this.ultimates = calculate_ult()
  this.continues = 0
  this.spark_val = calculate_spark_val()
  this.main_game = main_game
  if(!this.main_game) {
    this.lives = 0
    if(this.ultimates > 1) this.ultimates = 1
    
  }

  this.last_lives = this.lives
  this.last_sparks = 0
  this.last_ultimates = this.ultimates

  this.life_max = calculate_lives()
  this.ult_max = calculate_ult()

  this.current_level = null

  this.game_numbers = {}
  this.world = world_num
  this.hive_name = "HIVE "+imp_params.tessellation_names[world_num]
  this.boss_name = imp_params.tessellation_names[world_num]

  this.original_rating = calculate_current_rating()
}

HiveNumbers.prototype.clone = function(object) {
  var new_hive_numbers = new HiveNumbers()

  for(var i in object) {
    new_hive_numbers[i] = object[i]
  }
  return new_hive_numbers
}

HiveNumbers.prototype.adjust_values = function() {
  this.lives += (calculate_lives() - this.life_max)
  this.ultimates += (calculate_ult() - this.ult_max)
  this.spark_val = calculate_spark_val()
  this.life_max = calculate_lives()
  this.ult_max = calculate_ult()
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

