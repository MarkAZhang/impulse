var saveData = require('../load/save_data.js');

var Enemy = require('../enemy/enemy.js');

Stunner.prototype = new Enemy()

Stunner.prototype.constructor = Stunner

function Stunner(world, x, y, id, impulse_game_state) {
  this.type = 'stunner';
  this.silence_outside_arena = false

  this.init(world, x, y, id, impulse_game_state)

  if(!impulse_game_state) return

  this.do_yield = false

  if (saveData.difficultyMode == "normal") {
  	this.force *= 1.3;
  }
}

module.exports = Stunner;
