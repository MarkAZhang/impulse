Troll.prototype = new Enemy()

Troll.prototype.constructor = Troll

function Troll(world, x, y, id, impulse_game_state) {

  this.type = "troll"

  this.init(world, x, y, id, impulse_game_state)

  this.do_yield = false

  this.trolling = false

  this.troll_switch_interval = 400

  this.troll_switch_timer = this.troll_switch_interval

  this.trolling_time_factor = 4

  this.cautious = false

  this.default_heading = false

  this.spin_rate = 1000

  this.confused_targets = []
  this.confused_duration = 250

  this.entered_arena = false
  this.entered_arena_delay = 1000
  this.entered_arena_timer = 1000
  this.last_stun = this.entered_arena_delay

}

Troll.prototype.additional_processing = function(dt) {

  var time = (new Date()).getTime()
  if(this.status_duration[1] <= 0)
    this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)

  if(time % (this.trolling_time_factor * this.troll_switch_interval) < this.troll_switch_interval) {
    this.silence(this.troll_switch_interval - time % (this.trolling_time_factor * this.troll_switch_interval), true)
  }

  for(var index = this.confused_targets.length-1; index >= 0; index--) {
    this.confused_targets[index].timer -= dt
    if(this.confused_targets[index].timer <= 0) {
      this.confused_targets.splice(index, 1)
    }
  }

   if(!this.entered_arena && check_bounds(0, this.body.GetPosition(), draw_factor)) {
    this.silence(this.entered_arena_delay, true)
    this.last_stun = Math.max(this.entered_arena_delay, this.last_stun)
    this.entered_arena = true
  }

  if(this.entered_arena_timer > 0) {
    this.entered_arena_timer -= dt
  }

  if(!check_bounds(0, this.body.GetPosition(), draw_factor)) {
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
    var time = (new Date()).getTime()
  if(time % (this.trolling_time_factor * this.troll_switch_interval) > this.troll_switch_interval) {
    var troll_prop = (time % (this.trolling_time_factor * this.troll_switch_interval) - this.troll_switch_interval)/ ((this.trolling_time_factor-1)*this.troll_switch_interval)
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor,
     (this.effective_radius*draw_factor) * 1.5, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * troll_prop * 0.999, true)
    context.lineWidth = 2
    context.strokeStyle = this.color
    context.stroke()
  }

  context.restore()
}

Troll.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  if(this.status_duration[1] <= 0 && this.entered_arena) {
    //if(isVisible(this.player.body.GetPosition(), this.body.GetPosition(), this.level.obstacle_edges)) {
      this.body.ApplyImpulse(new b2Vec2(.25 * impulse_force*Math.cos(hit_angle), .25 * impulse_force*Math.sin(hit_angle)),
      this.body.GetWorldCenter())
      this.player.confuse(1000)
      this.confused_targets.push({object: this.player, timer: this.confused_duration})
    //}
  }
  else {
    this.body.ApplyImpulse(new b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
  }
  this.open(this.open_period)

}

Troll.prototype.player_hit_proc = function() {
  if(this.status_duration[1] <= 0){}
    this.player.confuse(5000)
}