Stunner.prototype = new Enemy()

Stunner.prototype.constructor = Stunner

function Stunner(world, x, y, id) {
  this.shape = new b2CircleShape(.5)
  this.effective_radius = .5
  this.color = "red"
  this.density = 1
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 3

  //how fast enemies move
  this.force = .5

  this.init(world, x, y, id)

  this.score_value = 100

}
