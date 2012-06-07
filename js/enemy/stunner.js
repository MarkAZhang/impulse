Stunner.prototype = new Enemy()

Stunner.prototype.constructor = Stunner

function Stunner(world, x, y, id) {

  this.type = "stunner"
  this.shape = new b2CircleShape(impulse_enemy_stats[this.type]['effective_radius'])
  
  this.init(world, x, y, id)

}
