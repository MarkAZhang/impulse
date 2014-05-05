Spear.prototype = new Enemy()

Spear.prototype.constructor = Spear

function Spear(world, x, y, id, impulse_game_state) {
  this.type = "spear"
  this.silence_outside_arena = true
  this.entered_arena_delay = 500
  this.init(world, x, y, id, impulse_game_state)

  this.fast_factor = 5

  this.spear_force = 30 //force that the spear impulses the player

  if(imp_vars.player_data.difficulty_mode == "easy") // since the player is heavier in easy mode
    this.spear_force = 40

  this.death_radius = 5

  this.stun_length = 3000 //after being hit by player, becomes stunned
  this.has_bulk_draw = true
  this.bulk_draw_nums = 1

  this.do_yield = false

  this.require_open = true

  this.hit_proc_on_silenced = true
}

Spear.prototype.enemy_move = Enemy.prototype.move

Spear.prototype.move = function() {

  if(this.player.dying) return //stop moving once player dies

  if(this.status_duration[0] > 0) return //locked
    
  if (isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)) {
    this.path = [this.player.body.GetPosition()]
    this.move_to(this.player.body.GetPosition())
  } else {
    this.enemy_move()
  }

}

Spear.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy
  /*var in_poly = false
  for(var i = 0; i < this.level.obstacle_polygons.length; i++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }
  if(in_poly)
  {
    dir.Multiply(this.slow_force)
  }
  else {*/
    if(this.special_mode)
    {
      dir.Multiply(this.fast_factor)
    }
    if(this.status_duration[2] > 0) {
      dir.Multiply(this.slow_factor)
    }
    dir.Multiply(this.force)
  //}
}

Spear.prototype.additional_processing = function(dt) {
  this.special_mode = !this.dying && this.path && this.path.length == 1 && (this.status_duration[1] <= 0) && this.entered_arena
}

Spear.prototype.player_hit_proc = function() {

  if(this.status_duration[1] <= 0) {
    var spear_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    var a = new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle))
    this.player.body.ApplyImpulse(new b2Vec2(this.spear_force * Math.cos(spear_angle), this.spear_force * Math.sin(spear_angle)), this.player.body.GetWorldCenter())
  }
}

Spear.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.silence(this.stun_length)
  if (this.stun_length > this.recovery_timer) {
    this.recovery_interval = this.stun_length
    this.recovery_timer = this.stun_length
  }
}


Spear.prototype.stun = function(dur) {
  this.status_duration[0] = Math.max(dur, this.status_duration[0]) //so that a short stun does not shorten a long stun
  this.silence(dur)
}

Spear.prototype.silence = function(dur, color_silence) {
  if(color_silence)
    this.color_silenced = color_silence
  this.status_duration[1] = Math.max(dur, this.status_duration[1])
}


Spear.prototype.additional_drawing = function(context, draw_factor) {
  
}

Spear.prototype.bulk_draw_start = function(context, draw_factor, num) {

  context.save()
  var prog = this.dying ? Math.max((this.dying_duration) / this.dying_length, 0) : 1
  if(this.dying) {
    context.globalAlpha *= prog;
  }
  context.beginPath()
  context.strokeStyle = this.color
  if(num == 1) {
    context.lineWidth = 2
    context.strokeStyle = "gray";
  }
}

Spear.prototype.bulk_draw = function(context, draw_factor, num) {
  if(num == 1) {
    if(this.recovery_timer > 0 && !this.dying && !(this.status_duration[0] > 0)) {
      bulk_draw_prog_circle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, 1 - this.recovery_timer/this.recovery_interval)
    }
  }
}

Spear.prototype.bulk_draw_end = function(context, draw_factor, num) {
  context.stroke()
  context.restore()
}