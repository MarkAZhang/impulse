FighterBullet.prototype = new Enemy()

FighterBullet.prototype.constructor = FighterBullet

function FighterBullet(world, x, y, id, impulse_game_state, vx, vy, parent_id) {
  this.type = "fighter_bullet"
  
  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.v = new b2Vec2(vx, vy)
  this.v.Normalize()
  this.v.Multiply(this.force)

  this.do_yield = false
  this.bullet_force = 40
  this.bullet_enemy_factor = 2

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
  if(other === this.player && this.check_player_intersection(this.player)) {
   
    var bullet_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    this.player.body.ApplyImpulse(new b2Vec2(this.bullet_force * Math.cos(bullet_angle), this.bullet_force * Math.sin(bullet_angle)), this.player.body.GetWorldCenter())
    this.start_death("hit_player")
    
    this.impulse_game_state.reset_combo()
  }
  else if(other.is_enemy && (other.id != this.parent_id || this.reflected))
  {
    
    var bullet_angle = _atan(this.body.GetPosition(), other.body.GetPosition())
    other.body.ApplyImpulse(new b2Vec2(this.bullet_force * this.bullet_enemy_factor * Math.cos(bullet_angle), this.bullet_force * this.bullet_enemy_factor * Math.sin(bullet_angle)), other.body.GetWorldCenter())
    this.start_death("hit_enemy")
  }
}

FighterBullet.prototype.process = function(enemy_index, dt) {
  if(this.dying && this.dying_duration < 0)
  {
    this.level.dead_enemies.push(enemy_index)
    return
  }

  if(this.dying )
  {
    this.dying_duration -= dt
    return
  }

  this.check_death()

  this.body.ApplyImpulse(this.v, this.body.GetWorldCenter())

  this.body.SetAngle(_atan({x: 0, y: 0}, this.v))
}

FighterBullet.prototype.process_impulse = function(attack_loc, impulse_force) {
  var temp_dir = new b2Vec2(this.body.GetPosition().x - attack_loc.x, this.body.GetPosition().y - attack_loc.y)
  temp_dir.Normalize()
  temp_dir.Multiply(impulse_force)
  this.v.Add(temp_dir)
  this.reflected = true

}

FighterBullet.prototype.check_death = function()
{
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")
      
      return
    }
  }
  if(this.body.GetPosition().x <= -5 || this.body.GetPosition().x >= canvasWidth/draw_factor + 5 || this.body.GetPosition().y <= -5 || this.body.GetPosition().y >= canvasWidth/draw_factor + 5)
  {
    this.start_death("kill")
  }
}
FighterBullet.prototype.player_hit_proc = function() {
}


