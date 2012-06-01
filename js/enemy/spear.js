Spear.prototype = new Enemy()

Spear.prototype.constructor = Spear

function Spear(world, x, y, id) {
  
  vertices = []
  var s_radius = .7  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*5/6), s_radius*Math.sin(Math.PI*5/6)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*7/6), s_radius*Math.sin(Math.PI*7/6)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI*0/6), s_radius*Math.sin(Math.PI*0/6)))  
//  this.shape = new b2CircleShape(.5)

  this.effective_radius =  s_radius//an approximation of the radius of this shape

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  this.color = "green"
  this.density = 0.5
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  this.init(world, x, y, id)
  //this.fast_lin_damp = 1.5
  this.spear_range = 30

  //how fast enemies move
  this.force = .2

  this.fast_force = 1

  //how fast enemies move when cautious
  this.slow_force = .1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.spear_force = 30 //force that the spear impulses the player

  this.death_radius = 5

  this.stun_length = 5000 //after being hit by player, becomes stunned
  this.stun_duration = 0

  this.score_value = 300

  this.do_yield = true
}

Spear.prototype.move_to = function(endPt) {

  //apply impulse to move enemy
  var in_poly = false
  for(var i = 0; i < level.obstacle_polygons.length; i++)
  {
    if(pointInPolygon(level.obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }

  var dir = new b2Vec2(endPt.x - this.body.GetPosition().x, endPt.y - this.body.GetPosition().y)
  dir.Normalize()
  if(in_poly)
  {
    dir.Multiply(this.slow_force)
  }
  else if(this.special_mode)
  {
    dir.Multiply(this.fast_force)
  }
  else
  {
    dir.Multiply(this.force)
  }
  this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

  var heading = _atan(this.body.GetPosition(), endPt)

  this.body.SetAngle(heading)
   
}

Spear.prototype.additional_processing = function(dt) {
  this.special_mode = this.path && this.path.length == 1 && p_dist(this.body.GetPosition(), player.body.GetPosition()) < this.spear_range && !(this.stun_duration > 0) && (this.status_duration[1] <= 0)
  
  this.color = this.stun_duration > 0 ? "red" : "green"

  if(this.stun_duration > 0)
  {
    this.stun_duration -= dt
  }
}

Spear.prototype.collide_with = function(other) {
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
    if(this.status_duration[1] <=0) {
      }
    reset_combo()
  }
  

}

Spear.prototype.player_hit_proc = function() {
  var spear_angle = _atan(this.body.GetPosition(), player.body.GetPosition())
  var a = new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle))
  player.body.ApplyImpulse(new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle)), player.body.GetWorldCenter())
    
}

Spear.prototype.process_impulse = function(attack_loc, impulse_force) {
  this.stun_duration = this.stun_length
}

