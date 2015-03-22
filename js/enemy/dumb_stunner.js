var Enemy = require('../enemy/enemy.js');

DumbStunner.prototype = new Enemy()

DumbStunner.prototype.constructor = DumbStunner

function DumbStunner(world, x, y, id, impulse_game_state) {

  this.type = "dumb_stunner"

  this.silence_outside_arena = false

  this.init(world, x, y, id, impulse_game_state)

  if(!impulse_game_state) return
}

module.exports = DumbStunner;
