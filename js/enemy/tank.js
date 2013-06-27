Tank.prototype = new Enemy()

Tank.prototype.constructor = Tank

function Tank(world, x, y, id, impulse_game_state) {
  this.type = "tank"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  this.death_radius = 5



  this.detonate_timer = 200
  this.detonate_duration = 200
  this.death_delay = 200
  this.bomb_factor = 6

  if(player_data.difficulty_mode == "easy") {
    this.bomb_factor = 5
  }

  this.activated = false

  this.cause_of_death = null
  this.do_yield = false

  this.default_heading = false

  this.spin_rate = 4000

  this.require_open = true;
  this.open_period = 500;
  this.additional_statuses = ["hot"]

  this.has_bulk_draw = true
}

Tank.prototype.additional_processing = function(dt) {

  this.special_mode = this.status_duration[1] <= 0
  this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
  /*if(this.durations["open"] > 0) {
    this.color = "red";
  } else {
    this.color = impulse_enemy_stats[this.type].color;
  }*/
}

Tank.prototype.additional_death_prep = function(death) {
  this.color = "red"
}

Tank.prototype.activated_processing = function(dt) {
  if(this.activated)
  {
    this.color = "red"
    if(this.detonate_timer <= 0 && !this.dying)
    {
      this.start_death(this.cause_of_death)
      this.explode()
    }
    if(this.detonate_timer > 0)
    {
      this.detonate_timer -= dt
    }
  }

}

Tank.prototype.check_death = function()
{

  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      if(this.status_duration[1] <= 0 && this.durations["open"] > 0) {
        this.activated = true
        this.cause_of_death = "kill"
      }
      else {
        this.start_death("kill")
      }
      return
    }
  }
}

Tank.prototype.collide_with = function(other, this_body, other_body) {
  if(other instanceof Tank && this.durations["open"] > 0 && !this.dying && !this.activated)
  {

    if(this.status_duration[1] <= 0) {
      this.activated = true
      this.cause_of_death = "kill"
    }

  }


  if(other instanceof BossOne && this.durations["open"] > 0 && !this.dying && !this.activated)
  {

    if(this.status_duration[1] <= 0) {
      console.log(this.level.boss)
      console.log(other_body)
      console.log(this.level.boss.body)
      if(this.level.boss && other_body == this.level.boss.body) {
        this.activated = true
        this.cause_of_death = "kill"
        var angle = _atan(this.body.GetPosition(), other.body.GetPosition())
        other_body.ApplyImpulse(new b2Vec2(this.tank_force * 80 * Math.cos(angle), this.tank_force * 80 * Math.sin(angle)), other.body.GetPosition())
      }
    }
    else {
      this.start_death("kill")
    }
  }

  if(this.dying || this.activated)//ensures the collision effect only activates once
    return

  if(other === this.player) {

    if(this.status_duration[1] <= 0) {
      this.activated = true
      this.cause_of_death = "hit_player"
      this.impulse_game_state.reset_combo()
    }
    else {
      this.start_death("hit_player")
    }
  }
}

Tank.prototype.explode = function() {
  if(p_dist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.effective_radius * this.bomb_factor)
  {
    var tank_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
    this.player.body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
  }

  for(var i = 0; i < this.level.enemies.length; i++)
  {

    if(this.level.enemies[i] !== this && p_dist(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) <= this.effective_radius * this.bomb_factor)
    {
      var _angle = _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition())
      this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.tank_force * Math.cos(_angle), this.tank_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
      if(!(this.level.enemies[i] instanceof Tank))
        this.level.enemies[i].open(1500)

    }
  }
}

Tank.prototype.additional_drawing = function(context, draw_factor, latest_color) {

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0;
  context.save();
  context.globalAlpha *= 1 - prog
  var this_angle = this.body.GetAngle() + Math.PI/4;

  var lighten_multiplier = 1;
  if(this.status_duration[3] > 0) {
    lighten_multiplier /= this.lighten_factor
  }

  if(this.activated && this.detonate_timer > 0)
  {
    context.beginPath()
    context.strokeStyle = "red";
    context.lineWidth = 5
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.bomb_factor * (1 - this.detonate_timer/this.detonate_duration)) * draw_factor, 0, 2*Math.PI*0.999)
    context.stroke()
  } else if(this.status_duration[1] <=0 && this.durations["open"] > 0) {
    context.beginPath()
    context.strokeStyle = "red"
    context.lineWidth = 2
    context.globalAlpha *= .5
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * this.bomb_factor * draw_factor, 0, 2*Math.PI * 0.999)
    context.stroke()

  }
  context.restore();

}

Tank.prototype.bulk_draw_start = function(context, draw_factor) {
  context.save()
  context.beginPath()
  context.lineWidth = 2
  context.globalAlpha *= .5
  context.strokeStyle = impulse_enemy_stats[this.type].color
}

Tank.prototype.bulk_draw = function(context, draw_factor) {
  if(this.durations["open"] <= 0) {
    context.moveTo(this.body.GetPosition().x*draw_factor +  this.effective_radius * this.bomb_factor * draw_factor, this.body.GetPosition().y*draw_factor)
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * this.bomb_factor * draw_factor, 0, 2*Math.PI*0.999)
  }
}

Tank.prototype.bulk_draw_end = function(context, draw_factor) {
  context.stroke()
  context.restore()
}

Tank.prototype.get_additional_color_for_status = function(status) {
  if(status == "hot") {
    return "red"
  }
}

Tank.prototype.get_color_for_status = function(status) {
  if(status == "normal") {
    return this.color
  } else if(status == "stunned") {
    return 'gray';
  } else if(status == "silenced") {
    return 'gray'
  } else if(status == "gooed") {
    return "#e6c43c"
  } else if(status == "impulsed") {
    return "red"
  }

  return this.get_additional_color_for_status(status)
}

Tank.prototype.get_current_color_with_status = function(orig_color) {
  /*if (this.durations["open"] > 0) {
        context.fillStyle = impulse_colors["impulse_blue"]
      } else */
    if(!this.dying) {
      if(this.color_silenced) {
        return 'gray'
      }
      if(this.durations["impulsed"] > 0) {
        return "red"
      }
      if(this.status_duration[0] > 0) {
        return 'gray';
      } else if(this.status_duration[2] > 0) {
        return "#e6c43c"
      }
    }
    if(orig_color)
      return orig_color
    return this.color;
}

Tank.prototype.get_additional_current_status = function() {
  if(this.dying) {
    return "hot"
  }

  if(!this.dying) {
      if(this.durations["open"] > 0) {
        return "hot";
      }
  }
  return "normal"
}

Tank.prototype.draw_enemy_image_additional = function(context, color) {
  context.strokeStyle = color
  context.lineWidth = 4;
  var this_angle = Math.PI/4
  var tp = {x: impulse_enemy_stats[this.type].effective_radius *draw_factor , y: impulse_enemy_stats[this.type].effective_radius*draw_factor}

  context.beginPath()

  context.moveTo(tp.x + Math.cos(this_angle)*this.effective_radius/Math.sqrt(2)*draw_factor,
  tp.y + Math.sin(this_angle)*this.effective_radius/Math.sqrt(2)*draw_factor)

  context.lineTo(tp.x + Math.cos(this_angle+Math.PI)*this.effective_radius/Math.sqrt(2)*draw_factor,
  tp.y + Math.sin(this_angle+Math.PI)*this.effective_radius/Math.sqrt(2)*draw_factor)
  context.stroke()

  context.beginPath()
  context.moveTo(tp.x + Math.cos(this_angle+Math.PI*3/2)*this.effective_radius/Math.sqrt(2)*draw_factor,
   tp.y + Math.sin(this_angle+Math.PI*3/2)*this.effective_radius/Math.sqrt(2)*draw_factor)
  context.lineTo(tp.x + Math.cos(this_angle+Math.PI/2)*this.effective_radius/Math.sqrt(2)*draw_factor,
   tp.y + Math.sin(this_angle+Math.PI/2)*this.effective_radius/Math.sqrt(2)*draw_factor)
  context.stroke()
}