Wisp.prototype = new Enemy()

Wisp.prototype.constructor = Wisp

function Wisp(world, x, y, id) {
  
  vertices = []
  var s_radius = .5  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/2), s_radius*Math.sin(Math.PI * 1/2)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1), s_radius*Math.sin(Math.PI * 1)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/2), s_radius*Math.sin(Math.PI * 3/2)))  
//  this.shape = new b2CircleShape(.5)

  this.effective_radius =  s_radius//an approximation of the radius of this shape

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)

  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  
  this.density = 1
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  this.init(world, x, y, id)
  this.color = "rgb(152, 251, 152)"
  this.interior_color = "white"
  //this.fast_lin_damp = 1.5

  //how fast enemies move
  this.force = .2

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  this.death_radius = 5

  this.score_value = 400

  this.visibility_timer = 0

}

Wisp.prototype.additional_processing = function(dt) {
  this.visibility_timer +=dt
  var leftover = this.visibility_timer % 2000
  if(leftover > 1000) leftover = 2000 - leftover
  this.visibility = this.status_duration[1] <= 0 ? leftover / 1000 : 1
  
}

Wisp.prototype.player_hit_proc = function() {
  level.obstacles_visible = false
  setTimeout("level.obstacles_visible = true", 5000)
}

