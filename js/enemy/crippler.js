Crippler.prototype = new Goo()



Crippler.prototype.constructor = Crippler

function Crippler(world, x, y, id) {
  this.effective_radius = 2
  var s_radius = this.effective_radius  //temp var
  var vertices = []
  vertices.push(new b2Vec2(s_radius * .25 * Math.cos(Math.PI * 0), s_radius * .5 * Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius* .25 * Math.cos(Math.PI * 1), s_radius* .25 * Math.sin(Math.PI * 1)))
  vertices.push(new b2Vec2(s_radius * Math.cos(Math.PI * 3/2), s_radius* Math.sin(Math.PI * 3/2)))  
  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.color = "rgb(255, 20, 147)"
  this.density = 1
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99
  this.init(world, x, y, id)

  //how fast enemies move
  this.force = .7
  //how fast enemies move when cautious
  this.slow_force = .1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10
  this.death_radius = 2
  this.score_value = 2000
  this.goo_polygons = []
  this.goo_interval = 250
  this.goo_timer = this.goo_interval
  this.goo_radius = 2 //radius of goo trail
  this.goo_duration = 5000 //amount of time a given goo polygon lasts
  this.goo_death_duration = 500
  this.goo_color = [255, 105, 180]
  this.last_left = null
  this.last_right = null
  this.do_yield = false
  this.effective_heading = this.body.GetAngle()//the heading used to calculate the goo, does not turn instantaneously
  
}



Crippler.prototype.collide_with = function(other) {
//function for colliding with the player

  if(other !== player) {
    return
  }
  if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > player.shape.GetRadius() + this.effective_radius)
  {
    return
  }
  if(!this.dying)//this ensures it only collides once
  {
    this.start_death("hit_player")
  }
  reset_combo()
  player.stun(2000)
}

Goo.prototype.trail_effect = function() {
  player.stun(100)
}
