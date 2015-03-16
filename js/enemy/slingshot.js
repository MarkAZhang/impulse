Slingshot.prototype = new Enemy()

Slingshot.prototype.constructor = Slingshot

function Slingshot(world, x, y, id, impulse_game_state) {
  this.type = "slingshot"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  if (saveData.difficultyMode == "easy") {
    this.force *= 0.8
  }

  this.slingshot_force = 50 //force that the spear impulses the player

  this.first_time_in_arena = false

  this.death_radius = 5

  this.slow_factor = 0.5

  this.do_yield = false

  this.real_color = this.color

  this.slingshot_mode = false
  this.slingshot_point = null
  this.slingshot_duration = 0
  this.slingshot_interval = 100
  this.slingshot_multiplier = 1
  this.empowered_duration = 0
  this.empowered_interval = 750

  this.empowered_force = 100

  this.cautious = false

  this.additional_statuses = ["empowered"]

  this.orig_lin_damp = enemyData[this.type].lin_damp
  this.slingshot_lin_damp = 6

}

Slingshot.prototype.enemy_move = Enemy.prototype.move

Slingshot.prototype.move = function() {
  if(this.slingshot_mode) {
    if(!this.is_locked()) {
      var dir = new b2Vec2(this.slingshot_point.x - this.body.GetPosition().x, this.slingshot_point.y - this.body.GetPosition().y)
      dir.Multiply(this.slingshot_multiplier)
      if(this.is_gooed())
        dir.Multiply(this.slow_factor)
      this.body.ApplyImpulse(dir, this.body.GetWorldCenter())

      var heading = utils.atan(this.body.GetPosition(), this.slingshot_point)
      this.body.SetAngle(heading)
    }
  }
  else {
    this.enemy_move()
  }
}

Slingshot.prototype.modify_movement_vector = function(dir) {
  if(this.is_gooed()) {
    dir.Multiply(this.slow_factor)
  }
  if (!this.first_time_in_arena) {
    dir.Multiply(this.slow_factor)
  }
  dir.Multiply(this.force)
}

Slingshot.prototype.additional_processing = function(dt) {

  if(this.slingshot_mode && (this.slingshot_duration <= 0 && utils.pDist(this.slingshot_point, this.body.GetPosition()) < 1) || this.is_silenced()) {
    this.slingshot_mode = false
    this.lin_damp = this.orig_lin_damp
  }

  // Slow the slingshot until it enters the arena, with a small buffer.
  if (!this.first_time_in_arena && utils.checkBounds(1, this.body.GetPosition(), imp_params.draw_factor)) {
    this.first_time_in_arena = true
  }

  this.special_mode = this.empowered_duration > 0

  this.color = this.empowered_duration > 0 ? "red" : this.real_color
  this.empowered = this.empowered_duration > 0 && !this.is_silenced()

  if(this.slingshot_duration > 0)
  {
    this.slingshot_duration -= dt
  }

  if(this.empowered_duration > 0)
  {
    this.empowered_duration -= dt
  }
}



Slingshot.prototype.player_hit_proc = function() {

  var spear_angle = utils.atan(this.body.GetPosition(), this.player.body.GetPosition())
  var a = new b2Vec2(Math.cos(spear_angle), Math.sin(spear_angle))
  if(this.empowered_duration > 0)
  {
    a.Multiply(this.empowered_force)
  }
  else
  {
    a.Multiply(this.slingshot_force)
  }
  this.player.body.ApplyImpulse(a, this.player.body.GetWorldCenter())

}

Slingshot.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {

  if(!this.is_silenced()) {
    this.slingshot_point = this.body.GetPosition().Copy()
    this.slingshot_mode = true
    this.slingshot_duration = this.slingshot_interval
    this.empowered_duration = this.empowered_interval
    this.lin_damp = this.slingshot_lin_damp
    imp_params.impulse_music.play_sound("sshot")
  }
}

Slingshot.prototype.get_current_status = function() {

  if(!this.dying) {
      if(this.is_locked()) {
        return 'stunned';
      } else if(this.color_silenced) {
        return 'silenced'
      } else if(this.is_gooed()) {
        return "gooed"
      } else if (this.is_disabled()) {
        return 'silenced';
      }
    }

    return this.get_additional_current_status()
}


Slingshot.prototype.get_additional_color_for_status = function(status) {
  if(status == "empowered") {
    return "red"
  }
}

Slingshot.prototype.get_additional_current_status = function() {

  if(!this.dying) {
      if(this.empowered_duration > 0) {
        return "empowered";
      }
  }
  return "normal"
}


Slingshot.prototype.get_slingshot_hooks = function(hook) {

  var angle = this.body.GetAngle() + Math.PI * 2/3 * hook;
  return {x: this.body.GetPosition().x + Math.cos(angle) * this.effective_radius * 3/4,  y: this.body.GetPosition().y + Math.sin(angle) * this.effective_radius * 3/4}
}

Slingshot.prototype.additional_drawing = function(context, draw_factor) {
  if(this.slingshot_mode && !this.dying) {
    context.beginPath()
    context.strokeStyle = this.color
    context.lineWidth = 2
    context.moveTo(this.slingshot_point.x * draw_factor, this.slingshot_point.y * draw_factor)
    var point_one = this.get_slingshot_hooks(1)
    context.lineTo(point_one.x * draw_factor, point_one.y * draw_factor)
    var point_two = this.get_slingshot_hooks(2)
    context.moveTo(this.slingshot_point.x * draw_factor, this.slingshot_point.y * draw_factor)
    context.lineTo(point_two.x * draw_factor, point_two.y * draw_factor)
    context.stroke()
  }
}

