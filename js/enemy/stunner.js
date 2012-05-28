Stunner.prototype = new Enemy()

Stunner.prototype.constructor = Stunner

function Stunner(world, x, y, id) {
  this.shape = new b2CircleShape(.5)
  this.color = "red"
  this.density = 1
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  //how fast enemies move
  this.force = .5

  //how fast enemies move when cautious
  this.slow_force = .1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10
  this.death_radius = 2

  this.init(world, x, y, id)
 
}




