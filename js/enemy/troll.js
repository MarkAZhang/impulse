Troll.prototype = new Enemy()

Troll.prototype.constructor = Troll

function Troll(world, x, y, id, impulse_game_state) {

  this.type = "troll"
  this.silence_outside_arena = true
  this.entered_arena_delay = 1000

  this.init(world, x, y, id, impulse_game_state)

  this.do_yield = false

  this.trolling = false

  this.troll_switch_interval = 400
  this.trolling_time_factor = 4

  if (imp_vars.player_data.difficulty_mode == "easy") {
    this.troll_switch_interval = 600
    this.trolling_time_factor = 3    
  }
  this.troll_switch_timer = this.troll_switch_interval


  this.cautious = false

  this.default_heading = false

  this.spin_rate = 1000

  this.confused_targets = []
  this.confused_duration = 250

  this.has_bulk_draw = true
  this.bulk_draw_nums = 2

  this.short_troll_period = 1000
  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.short_troll_period = 750
  }

  this.extra_adjust = true

  this.long_troll_period = 5000
  if(imp_vars.player_data.difficulty_mode == "easy") {
    this.long_troll_period = 2500
  }
}

Troll.prototype.additional_processing = function(dt) {

  var time = (new Date()).getTime()
  if(this.status_duration[1] <= 0) {
    this.set_heading(this.actual_heading + 2*Math.PI * dt/this.spin_rate)
  }

  if(time % (this.trolling_time_factor * this.troll_switch_interval) < this.troll_switch_interval) {
    this.silence(this.troll_switch_interval - time % (this.trolling_time_factor * this.troll_switch_interval), true)
  }

  for(var index = this.confused_targets.length-1; index >= 0; index--) {
    this.confused_targets[index].timer -= dt
    if(this.confused_targets[index].timer <= 0) {
      this.confused_targets.splice(index, 1)
    }
  }

   if(!this.entered_arena && check_bounds(0, this.body.GetPosition(), imp_vars.draw_factor)) {
    this.silence(this.entered_arena_delay, true)
    this.entered_arena = true
  }

  if(this.entered_arena_timer > 0) {
    this.entered_arena_timer -= dt
  }

  if(!check_bounds(0, this.body.GetPosition(), imp_vars.draw_factor)) {
    this.entered_arena = false
  }

  /*if (this.status_duration[1] > 0) {
    this.trolling = false
  }*/
}

Troll.prototype.additional_drawing = function(context, draw_factor, latest_color) {

  if(this.dying || this.status_duration[1] > 0)return
  context.save()
  for(var index in this.confused_targets) {
    context.beginPath()
    var prop = this.confused_targets[index].timer/this.confused_duration
    context.globalAlpha *= Math.max(0, (1 - 2*Math.abs(prop-0.5))/.5)
    context.moveTo(this.confused_targets[index].object.body.GetPosition().x * draw_factor, this.confused_targets[index].object.body.GetPosition().y* draw_factor)
    context.lineTo(this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor)
    context.lineWidth = 3
    context.strokeStyle = this.color
    context.stroke()
    context.globalAlpha /= Math.max(0, (1 - 2*Math.abs(prop-0.5))/.5)
  }
  context.restore()
}

Troll.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle, ultimate) {
  if(this.status_duration[1] <= 0 && this.entered_arena) {
    this.body.ApplyImpulse(new b2Vec2(.3 * impulse_force*Math.cos(hit_angle), .3 * impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
    this.player.confuse(this.short_troll_period)
    imp_vars.impulse_music.play_sound("pwheel")
    this.confused_targets.push({object: this.player, timer: this.confused_duration})
    this.impulse_game_state.reset_combo();
  }
  else {
    this.body.ApplyImpulse(new b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
  }
  if(!ultimate) 
    this.open(this.open_period)
  this.durations["impulsed"] += this.impulsed_duration
}

Troll.prototype.player_hit_proc = function() {
  if(this.status_duration[1] <= 0) {
    this.player.confuse(this.long_troll_period)
    imp_vars.impulse_music.play_sound("pwheel")
  }
}

Troll.prototype.bulk_draw_start = function(context, draw_factor, num) {

  context.save()
  context.beginPath()
  context.strokeStyle = this.color
  if(num == 1) {
    context.lineWidth = 2
    context.strokeStyle = "gray";
  }
  if(num == 2) {
    context.lineWidth = 2
    context.strokeStyle = this.color
  }
}

Troll.prototype.bulk_draw = function(context, draw_factor, num) {
  // Do not draw if dying. We cannot change the opacity for a given enemy for bulk-draw, so we just don't draw at all.
  if (this.dying) {
    return
  }
  if(num == 1) {
    if(this.recovery_timer > 0 && !this.dying && !(this.status_duration[0] > 0)) {
      bulk_draw_prog_circle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, 1 - this.recovery_timer/this.recovery_interval)
    }
  }
  if(num == 2) {
    var time = (new Date()).getTime()
    if(this.status_duration[1] <= 0 && time % (this.trolling_time_factor * this.troll_switch_interval) > this.troll_switch_interval) {
      var troll_prop = (time % (this.trolling_time_factor * this.troll_switch_interval) - this.troll_switch_interval)/ ((this.trolling_time_factor-1)*this.troll_switch_interval)
      bulk_draw_prog_circle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, troll_prop)
    }
  }
}

Troll.prototype.bulk_draw_end = function(context, draw_factor, num) {
  context.stroke()
  context.restore()
}