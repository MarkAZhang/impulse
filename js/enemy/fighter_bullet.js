FighterBullet.prototype = new Enemy()

FighterBullet.prototype.constructor = FighterBullet

function FighterBullet(world, x, y, id, vx, vy, parent_id) {
  
  vertices = []
  var s_radius = .3  //temp var
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 0), s_radius*Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 1/4), s_radius*Math.sin(Math.PI * 1/4)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 3/4), s_radius*Math.sin(Math.PI * 3/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 5/4), s_radius*Math.sin(Math.PI * 5/4)))  
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 7/4), s_radius*Math.sin(Math.PI * 7/4)))  
//  this.shape = new b2CircleShape(.5)

  this.effective_radius =  s_radius//an approximation of the radius of this shape

  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.collision_polygon = getBoundaryPolygon(vertices, (player.r + 0.1))
  this.color = "rgb(30, 144, 255)"
  this.density = 5
  //the dampening factor that determines how much "air resistance" unit has
  this.lin_damp = 2.99

  this.init(world, x, y, id)

  //this.fast_lin_damp = 1.5

  //how fast enemies move
  this.force = 1

  //how often enemy path_finds
  this.pathfinding_delay = 100

  //how often enemy checks to see if it can move if yielding
  this.yield_delay = 10

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  this.death_radius = 5

  this.score_value = 0

  this.v = new b2Vec2(vx, vy)
  this.v.Normalize()
  this.v.Multiply(this.force)

  this.do_yield = false
  this.bullet_force = 40

  this.parent_id = parent_id

  this.reflected = false
}

FighterBullet.prototype.start_death = function(death) {
  this.dying = death
  this.dying_duration = this.dying_length
  
}

FighterBullet.prototype.collide_with = function(other) {
  if(this.dying)//ensures the collision effect only activates once
    return
  if(other === player && this.check_player_intersection(player)) {
   
    var bullet_angle = _atan(this.body.GetPosition(), player.body.GetPosition())
    player.body.ApplyImpulse(new b2Vec2(this.bullet_force * Math.cos(bullet_angle), this.bullet_force * Math.sin(bullet_angle)), player.body.GetWorldCenter())
    this.start_death("hit_player")
    
    reset_combo()
  }
  else if(other.is_enemy && (other.id != this.parent_id || this.reflected))
  {
    
    var bullet_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
    other.body.ApplyImpulse(new b2Vec2(this.bullet_force * Math.cos(bullet_angle), this.bullet_force * Math.sin(bullet_angle)), other.body.GetWorldCenter())
    this.start_death("hit_enemy")
  }
}

FighterBullet.prototype.process = function(enemy_index, dt) {
  if(this.dying && this.dying_duration < 0)
  {
    dead_enemies.push(enemy_index)
    return
  }

  if(this.dying )
  {
    this.dying_duration -= dt
    return
  }

  this.check_death()

  this.body.ApplyImpulse(this.v, this.body.GetWorldCenter())
}

FighterBullet.prototype.process_impulse = function(attack_loc, impulse_force) {
  var temp_dir = new b2Vec2(this.body.GetPosition().x - attack_loc.x, this.body.GetPosition().y - attack_loc.y)
  temp_dir.Normalize()
  temp_dir.Multiply(impulse_force)
  this.v.Add(temp_dir)
  this.reflected = true

}

FighterBullet.prototype.player_hit_proc = function() {
}


