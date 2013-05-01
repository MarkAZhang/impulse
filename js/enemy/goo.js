Goo.prototype = new Enemy()

Goo.prototype.constructor = Goo

Goo.prototype.goo_color = [238, 232, 170]//[255, 255, 120]

Goo.prototype.goo_color_rgb = "rgb(238, 232, 170)"

function Goo(world, x, y, id, impulse_game_state) {
  if(world == null) return  //allows others to use Goo as super-class
  this.type = "goo"
  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2

  this.life_time = 7500 //goo automatically dies after this

  this.do_yield = false

  this.goo_radius_small = 3;
  this.goo_radius_big = 10;

  this.goo_radius = this.goo_radius_small

  this.goo_change_transition = 500

  this.goo_expand_period = 1500

  this.goo_state = "small"

  this.goo_state_timer = 0

  this.slow_factor = 0.4

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

      var bezier_p = (Math.pow(1-t,3) * 0 + 3*Math.pow(1-t,2)*t*0.15+ 3*(1-t)*Math.pow(t,2)*0.85+ Math.pow(t,3)*1);

      this.goo_radius = this.goo_radius_small * (1-bezier_p) +  (bezier_p) * this.goo_radius_big

    }

  } else if(this.goo_state == "big" && this.goo_state_timer <= 0) {
    this.goo_state = "shrinking";
    this.goo_state_timer = this.goo_change_transition;

  } else if (this.goo_state == "shrinking") {
    if(this.goo_state_timer <= 0) {
      this.goo_state = "small"
      this.goo_radius = this.goo_radius_small;
      this.goo_state_timer = this.goo_expand_period;
    } else {
      var t = (this.goo_change_transition - this.goo_state_timer)/this.goo_change_transition;
      var bezier_p = (Math.pow(1-t,3) * 0 + 3*Math.pow(1-t,2)*t*0.15+ 3*(1-t)*Math.pow(t,2)*0.85+ Math.pow(t,3)*1);
      this.goo_radius = this.goo_radius_small * (bezier_p) +  (1-bezier_p) * this.goo_radius_big
    }
  }

  if(this.status_duration[1] <= 0 && p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.goo_radius) {
    this.area_effect(this.player)
  }

  for(var j = 0; j < this.level.enemies.length; j++) {
    if(this.status_duration[1] <= 0 && p_dist(this.body.GetPosition(), this.level.enemies[j].body.GetPosition()) < this.goo_radius)
    {
      if(this.level.enemies[j].className != this.className)
        this.area_effect(this.level.enemies[j])
    }
  }
}


Goo.prototype.collide_with = function(other) {
//function for colliding with the player

  if(this.dying)//ensures the collision effect only activates once
    return

  if(other === this.player) {

    this.start_death("hit_player")
    if(this.status_duration[1] <= 0) {//do not proc if silenced
      this.player_hit_proc()
      //this.impulse_game_state.reset_combo()
    }
  }
}

Goo.prototype.player_hit_proc = function() {
}

Goo.prototype.area_effect = function(obj) {
  obj.goo(100)
}

Goo.prototype.additional_drawing = function(context, draw_factor) {

  if(!this.dying) {

    context.beginPath()
    context.strokeStyle = this.color
    context.fillStyle = this.color
    context.lineWidth = 2
    context.globalAlpha = .3
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.goo_radius * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
    context.fill()
    context.globalAlpha = 1
  }
  if(this.goo_state == "big") {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.goo_state_timer / this.goo_expand_period), true)
    context.lineWidth = 2
    context.strokeStyle = this.color
    context.stroke()
  }
}

Goo.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {

  if(this.status_duration[1] <= 0) {
      if(this.goo_state == "shrinking") {
        this.goo_state_timer = this.goo_change_transition - this.goo_state_timer;
      this.goo_state = "expanding"
      } else if(this.goo_state == "big") {
        this.goo_state_timer = this.goo_expand_period
      } else if(this.goo_state == "small") {
        this.goo_state_timer = this.goo_change_transition
      this.goo_state = "expanding"
      }

    }
}

Goo.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy

  if(this.goo_state != "small")
  {
    dir.Multiply(this.slow_factor)
  }

  dir.Multiply(this.force)


}
