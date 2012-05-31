Disarmer.prototype = new Goo()



Disarmer.prototype.constructor = Disarmer

function Disarmer(world, x, y, id) {
  var s_radius = 2  //temp var
  this.effective_radius = .5 //just the short side
  var vertices = []
  vertices.push(new b2Vec2(s_radius * .25 * Math.cos(Math.PI * 0), s_radius * .5 * Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius* .25 * Math.cos(Math.PI * 1), s_radius* .25 * Math.sin(Math.PI * 1)))
  vertices.push(new b2Vec2(s_radius * Math.cos(Math.PI * 3/2), s_radius* Math.sin(Math.PI * 3/2)))  
  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  this.color = "rgb(205, 201, 201)"
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
  this.score_value = 1000
  this.goo_polygons = []
  this.goo_interval = 250
  this.goo_timer = this.goo_interval
  this.goo_radius = 2 //radius of goo trail
  this.goo_duration = 5000 //amount of time a given goo polygon lasts
  this.goo_death_duration = 500
  this.goo_color = [238, 233, 233]
  this.last_left = null
  this.last_right = null
  this.do_yield = false
  this.effective_heading = this.body.GetAngle()//the heading used to calculate the goo, does not turn instantaneously
  
}

Disarmer.prototype.player_hit_proc = function() {
  player.silence(2000)
}

Disarmer.prototype.trail_effect = function(obj) {
  obj.silence(100)
}
