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

  this.activated = false

  this.cause_of_death = null
  this.do_yield = false

  this.default_heading = false

  this.spin_rate = 4000

  this.require_open = false;
  this.open_period = 500;

}

Tank.prototype.additional_processing = function(dt) {

  this.special_mode = this.status_duration[1] <= 0
  this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
  if(this.durations["open"] > 0) {
    this.color = "red";
  } else {
    this.color = impulse_enemy_stats[this.type].color;
  }
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
      if(this.status_duration[1] <= 0) {
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

Tank.prototype.collide_with = function(other) {
  if(other instanceof Tank && this.durations["open"] > 0 && !this.dying && !this.activated)
  {

    if(this.status_duration[1] <= 0) {
      this.activated = true
      this.cause_of_death = "kill"
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
  context.strokeStyle = latest_color;
  context.lineWidth = 4;
  context.beginPath()
  context.moveTo((this.body.GetPosition().x + (1 + this.death_radius * prog)*Math.cos(this_angle)*this.effective_radius/Math.sqrt(2))*draw_factor,
  (this.body.GetPosition().y + (1 + this.death_radius * prog)*Math.sin(this_angle)*this.effective_radius/Math.sqrt(2))*draw_factor)
  context.lineTo((this.body.GetPosition().x + (1 + this.death_radius * prog)*Math.cos(this_angle+Math.PI)*this.effective_radius/Math.sqrt(2))*draw_factor,
  (this.body.GetPosition().y + (1 + this.death_radius * prog)*Math.sin(this_angle+Math.PI)*this.effective_radius/Math.sqrt(2))*draw_factor)
  context.stroke()

  context.beginPath()
  context.moveTo((this.body.GetPosition().x + (1 + this.death_radius * prog)*Math.cos(this_angle+Math.PI*3/2)*this.effective_radius/Math.sqrt(2))*draw_factor,
   (this.body.GetPosition().y + (1 + this.death_radius * prog)*Math.sin(this_angle+Math.PI*3/2)*this.effective_radius/Math.sqrt(2))*draw_factor)
  context.lineTo((this.body.GetPosition().x + (1 + this.death_radius * prog)*Math.cos(this_angle+Math.PI/2)*this.effective_radius/Math.sqrt(2))*draw_factor,
   (this.body.GetPosition().y + (1 + this.death_radius * prog)*Math.sin(this_angle+Math.PI/2)*this.effective_radius/Math.sqrt(2))*draw_factor)
  context.stroke()

  if(this.activated && this.detonate_timer > 0)
  {
    context.beginPath()
    context.strokeStyle = this.color;
    context.lineWidth = 5
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.bomb_factor * (1 - this.detonate_timer/this.detonate_duration)) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
  }



  if(this.status_duration[1] <=0) {
    context.beginPath()
    context.strokeStyle = this.color
    context.lineWidth = 2
    context.globalAlpha = .5
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * this.bomb_factor * draw_factor, 0, 2*Math.PI, true)
    context.stroke()

  }
  context.restore();

}
