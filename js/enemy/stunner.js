Stunner.prototype = new Enemy()

Stunner.prototype.constructor = Stunner

function Stunner(world, x, y, id, impulse_game_state) {

  this.type = "stunner"

  this.silence_outside_arena = false

  this.init(world, x, y, id, impulse_game_state)

  if(!impulse_game_state) return

  this.do_yield = false

  if (saveData.difficultyMode == "normal") {
  	this.force *= 1.3;
  }

  /*if(this.impulse_game_state.level.level_name == "HIVE 1-1" ||
     this.impulse_game_state.level.level_name == "HIVE 1-2") {
    var factor = Math.min((this.impulse_game_state.game_numbers.seconds / 120), 1)
    this.force *= 1 + .3 * factor
  }*/
}
