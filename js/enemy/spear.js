Spear.prototype = new Enemy()

Spear.prototype.constructor = Spear

function Spear(world, x, y, id, impulse_game_state) {
  this.type = "spear"
  this.silence_outside_arena = true
  this.entered_arena_delay = 500
  this.init(world, x, y, id, impulse_game_state)

  this.fast_factor = 5

  this.spear_force = 30 //force that the spear impulses the player

  if(saveData.difficultyMode == "easy") // since the player is heavier in easy mode
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

  if(this.is_locked()) return //locked

  if (utils.isVisible(this.body.GetPosition(), this.player.body.GetPosition(), this.level.obstacle_edges)) {
    this.path = [this.player.body.GetPosition()]
    this.move_to(this.player.body.GetPosition())
  } else {
    this.enemy_move()
  }

}

Spear.prototype.modify_movement_vector = function(dir) {
  if(this.special_mode)
  {
    dir.Multiply(this.fast_factor)
  }
  if(this.is_gooed()) {
    dir.Multiply(this.slow_factor)
  }
  dir.Multiply(this.force)
}

Spear.prototype.additional_processing = function(dt) {
  this.special_mode = !this.dying && this.path && this.path.length == 1 && !this.is_silenced() && this.entered_arena
}

Spear.prototype.player_hit_proc = function() {
  if(!this.is_silenced()) {
    var spear_angle = utils.atan(this.body.GetPosition(), this.player.body.GetPosition())
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

Spear.prototype.additional_drawing = function(context, draw_factor) {

}

Spear.prototype.bulk_draw_start = function(context, draw_factor, num) {

  context.save()
  context.beginPath()
  context.strokeStyle = this.color
  if(num == 1) {
    context.lineWidth = 2
    context.strokeStyle = "gray";
  }
}

Spear.prototype.bulk_draw = function(context, draw_factor, num) {
  // Do not draw if dying. We cannot change the opacity for a given enemy for bulk-draw, so we just don't draw at all.
  if (this.dying) {
    return
  }
  if(num == 1) {
    if(this.recovery_timer > 0 && !this.dying && !this.is_locked()) {
      uiRenderUtils.bulkDrawProgCircle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, 1 - this.recovery_timer/this.recovery_interval)
    }
  }
}

Spear.prototype.bulk_draw_end = function(context, draw_factor, num) {
  context.stroke()
  context.restore()
}
