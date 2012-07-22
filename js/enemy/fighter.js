Fighter.prototype = new Enemy()

Fighter.prototype.constructor = Fighter

function Fighter(world, x, y, id, impulse_game_state) {

  if(!world) return

  this.type = "fighter"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.safe_radius = 10

  this.safe_radius_buffer = 2

  this.bullet_alternater = 0

  this.safe = true

  this.shoot_loc_forward_length = this.effective_radius * 2

  this.shoot_loc_side_length = this.effective_radius

  this.piercing_bullets = 0

  this.piercing_bullet_reload_interval = 2000

  this.piercing_bullet_reload_timer = this.piercing_bullet_reload_interval

  this.piercing_bullet_max = 5

  this.check_special_mode_interval = 5

  this.check_special_mode_timer = this.check_special_mode_interval

}

Fighter.prototype.additional_processing = function(dt) {

  if(this.shoot_duration < 0 && this.status_duration[1] <= 0) {
    this.shoot_duration = this.shoot_interval
    if(this.special_mode && check_bounds(0, this.body.GetPosition(), draw_factor)) {
      var other_angle = this.body.GetAngle() + Math.PI/2 * ((this.bullet_alternater % 2) * 2 - 1)
      var bullet_start_loc_x = this.body.GetPosition().x + this.shoot_loc_side_length *  Math.cos(other_angle) + this.shoot_loc_forward_length * Math.cos(this.body.GetAngle())
      var bullet_start_loc_y = this.body.GetPosition().y + this.shoot_loc_side_length *  Math.sin(other_angle) + this.shoot_loc_forward_length * Math.sin(this.body.GetAngle())
      var spawned_bullet = true
      if(!isVisible({x:bullet_start_loc_x, y: bullet_start_loc_y}, this.player.body.GetPosition(), this.level.obstacle_edges)) {
        other_angle = this.body.GetAngle() + Math.PI/2 * (((this.bullet_alternater + 1) % 2) * 2 - 1)
        bullet_start_loc_x = this.body.GetPosition().x + this.shoot_loc_side_length *  Math.cos(other_angle) + this.shoot_loc_forward_length * Math.cos(this.body.GetAngle())
        bullet_start_loc_y = this.body.GetPosition().y + this.shoot_loc_side_length *  Math.sin(other_angle) + this.shoot_loc_forward_length * Math.sin(this.body.GetAngle())
        if(!isVisible({x:bullet_start_loc_x, y: bullet_start_loc_y}, this.player.body.GetPosition(), this.level.obstacle_edges)) {
          spawned_bullet = false
        } 
      }
      if (spawned_bullet) {
        if(this.piercing_bullets > 0) {
          this.piercing_bullets -= 1
          this.level.spawned_enemies.push(new PiercingFighterBullet(this.world, bullet_start_loc_x, bullet_start_loc_y, this.level.enemy_counter, this.impulse_game_state, (this.player.body.GetPosition().x - bullet_start_loc_x), (this.player.body.GetPosition().y - bullet_start_loc_y), this.id ))
        }
        else {
          this.level.spawned_enemies.push(new FighterBullet(this.world, bullet_start_loc_x, bullet_start_loc_y, this.level.enemy_counter, this.impulse_game_state, (this.player.body.GetPosition().x - bullet_start_loc_x), (this.player.body.GetPosition().y - bullet_start_loc_y), this.id ))  
        }
        this.level.enemy_counter += 1
        
      }
      this.bullet_alternater += 1
    }
  }
  this.shoot_duration -= dt

  if(this.check_special_mode_timer <= 0) {
    this.special_mode = isVisible(this.player.body.GetPosition(), this.body.GetPosition(), this.level.obstacle_edges) && this.status_duration[1] <= 0  
    this.check_special_mode_timer = this.check_special_mode_interval
  }
  this.check_special_mode_timer -= 1  

  if (!this.special_mode && this.status_duration[1] <= 0 && this.piercing_bullets < this.piercing_bullet_max && check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.piercing_bullet_reload_timer -= dt
    if (this.piercing_bullet_reload_timer < 0) {
      this.piercing_bullet_reload_timer = this.piercing_bullet_reload_interval
      this.piercing_bullets += 1
    }
  }
  else {
    this.piercing_bullet_reload_timer = this.piercing_bullet_reload_interval
  }
}

Fighter.prototype.player_hit_proc = function() {
}

Fighter.prototype.additional_drawing = function(context) {
  if(this.piercing_bullets > 0) {
    context.beginPath()
    for(var i = 0; i < this.piercing_bullets; i++) {
      context.arc((this.body.GetPosition().x + this.effective_radius * 2 * Math.cos(Math.PI * 2 * i / this.piercing_bullet_max)) * draw_factor, (this.body.GetPosition().y + this.effective_radius * 2 * Math.sin(Math.PI * 2 * i / this.piercing_bullet_max))*draw_factor,
     4, 0, 2 * Math.PI, true)
    }
    context.fillStyle = "red"
    context.fill()
  }

  if(!this.special_mode && this.status_duration[1] <= 0 && this.piercing_bullets < this.piercing_bullet_max) {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor,
     (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (1 - this.piercing_bullet_reload_timer/this.piercing_bullet_reload_interval), true)
    context.lineWidth = 2
    context.strokeStyle = "gray"
    context.stroke()
  }
}

/*Fighter.prototype.get_target_point = function() {
  if(!this.safe) {
    return get_safe_point(this, this.player)
  }
  else
    return this.player.body.GetPosition()
}

/*Fighter.prototype.enemy_move = Enemy.prototype.move

Fighter.prototype.move = function() {
  if(p_dist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius && p_dist(this.player.body.GetPosition(), this.body.GetPosition()) < this.safe_radius + this.safe_radius_buffer) {
    this.path = null
    this.set_heading()
  }
  else {
    if(this.path == null) {
      this.pathfinding_counter = 2 * this.pathfinding_delay
    }
    this.enemy_move()
  }
  
}

Fighter.prototype.set_heading = function(endPt) {
  var heading = _atan(this.body.GetPosition(), this.player.body.GetPosition())
  this.body.SetAngle(heading)
}*/

Fighter.prototype.collide_with = function(other) {
//function for colliding with the player

}