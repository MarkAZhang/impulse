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
  
  this.density = 1
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  this.init(world, x, y, id)
  this.color = "rgb(245, 222, 179)"
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

  this.score_value = 1000

  this.visibility_timer = 0

}

Wisp.prototype.additional_processing = function(dt) {
  this.visibility_timer +=dt
  var leftover = this.visibility_timer % 2000
  if(leftover > 1000) leftover = 2000 - leftover
  this.visibility = leftover / 1000
  
}

Wisp.prototype.collide_with = function(other) {
  if(other !== player) {
    return
  }
//function for colliding with the player
  if(p_dist(player.body.GetPosition(), this.body.GetPosition()) > player.shape.GetRadius() + this.effective_radius)
  {
    return
  }
  if(!this.dying)//this ensures it only collides once
  {
    this.start_death("hit_player")
    reset_combo()
    level.obstacles_visible = false
    setTimeout("level.obstacles_visible = true", 5000)
  }
  

}


