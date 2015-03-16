Goo.prototype = new Enemy()

Goo.prototype.constructor = Goo

Goo.prototype.goo_color = [238, 232, 170]//[255, 255, 120]

Goo.prototype.goo_color_rgb = "rgb(238, 232, 170)"

function Goo(world, x, y, id, impulse_game_state) {
  if(world === undefined) return  //allows others to use Goo as super-class
  this.type = "goo"
  this.silence_outside_arena = false
  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2

  this.life_time = 7500 //goo automatically dies after this

  this.do_yield = false

  this.goo_radius_small = 3;

  this.goo_radius_big = 11;

  if(saveData.difficultyMode == "easy") {
    this.goo_radius_big = 10;
  }

  this.goo_radius = this.goo_radius_small

  this.goo_change_transition = 500

  this.goo_expand_period = 2500

  if(saveData.difficultyMode == "easy")
    this.goo_expand_period = 3500

  this.goo_state = "small"

  this.goo_state_timer = 0

  this.slow_factor = 0.2

  this.default_heading = false

  this.spin_rate = 6000
}

Goo.prototype.additional_processing = function(dt) {

  this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
  if(this.goo_state_timer > 0) {
    this.goo_state_timer -= dt;
  }

  if(this.goo_state == "expanding") {

    if(this.goo_state_timer <= 0) {
      this.goo_state = "big"
      this.goo_radius = this.goo_radius_big;
      this.goo_state_timer = this.goo_expand_period;
    } else {
      var t = (this.goo_change_transition - this.goo_state_timer)/this.goo_change_transition;

      var bezier_p = utils.bezierInterpolate(0.15, 0.85, t);

      this.goo_radius = this.goo_radius_small * (1-bezier_p) +  (bezier_p) * this.goo_radius_big

    }

  } else if(this.goo_state == "big" && this.goo_state_timer <= 0) {
    this.goo_state = "shrinking";
    music_player.play_sound("goo")
    this.goo_state_timer = this.goo_change_transition;

  } else if (this.goo_state == "shrinking") {
    if(this.goo_state_timer <= 0) {
      this.goo_state = "small"
      this.goo_radius = this.goo_radius_small;
      this.goo_state_timer = this.goo_expand_period;
    } else {
      var t = (this.goo_change_transition - this.goo_state_timer)/this.goo_change_transition;
      var bezier_p = utils.bezierInterpolate(0.15, 0.85, t)
      this.goo_radius = this.goo_radius_small * (bezier_p) +  (1-bezier_p) * this.goo_radius_big
    }
  }

  if(!this.is_silenced()) {
    this.body.SetLinearDamping(enemyData[this.type].lin_damp)
    this.force = enemyData[this.type].force
  } else {
    this.body.SetLinearDamping(enemyData[this.type].lin_damp * 0.3)
    this.force = enemyData[this.type].force * 0.3
  }

  this.check_area_of_effect()
}

Goo.prototype.check_area_of_effect = function() {
  if(!this.is_silenced() && utils.pDist(this.body.GetPosition(), this.player.body.GetPosition()) < this.goo_radius) {
    this.area_effect(this.player)
  }

  for(var j = 0; j < this.level.enemies.length; j++) {
    if(!this.is_silenced() && utils.pDist(this.body.GetPosition(), this.level.enemies[j].body.GetPosition()) < this.goo_radius)
    {
      if(this.level.enemies[j].className != this.className)
        this.area_effect(this.level.enemies[j])
    }
  }
}

Goo.prototype.player_hit_proc = function() {

}

Goo.prototype.area_effect = function(obj) {
  obj.goo(100)
}

Goo.prototype.final_draw = function(context, draw_factor) {
  if(this.is_silenced()) {
    return
  }

  if(!this.dying) {

    context.beginPath()
    context.strokeStyle = this.color
    context.fillStyle = this.color
    context.lineWidth = 2
    context.save();
    context.globalAlpha *= .3
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.goo_radius * draw_factor, 0, 2*Math.PI * 0.999)
    context.stroke()
    context.fill()
    context.restore();
  }
  if(this.goo_state == "big") {
    uiRenderUtils.drawProgCircle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, 1 - this.goo_state_timer / this.goo_expand_period)
  }
}

Goo.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {

  if(!this.is_silenced()) {
      if(this.goo_state == "shrinking") {
        this.goo_state_timer = this.goo_change_transition - this.goo_state_timer;
        this.goo_state = "expanding"
      } else if(this.goo_state == "big") {
        this.goo_state_timer = this.goo_expand_period
      } else if(this.goo_state == "small") {
        this.goo_state_timer = this.goo_change_transition
        this.goo_state = "expanding"
        music_player.play_sound("goo")
      }

    }
}

Goo.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy

  if(this.goo_state != "small" && !this.is_silenced())
  {
    dir.Multiply(this.slow_factor)
  }

  dir.Multiply(this.force)


}
