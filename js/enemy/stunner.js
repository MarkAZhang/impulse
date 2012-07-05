Stunner.prototype = new Enemy()

Stunner.prototype.constructor = Stunner

function Stunner(world, x, y, id, impulse_game_state) {

  this.type = "stunner"
  
  this.init(world, x, y, id, impulse_game_state)

  this.do_yield = false
}
