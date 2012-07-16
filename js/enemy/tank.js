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

  this.hot_color = "orange"
  this.hot_interval = 1000
  this.hot_timer = 0

}

Tank.prototype.additional_processing = function(dt) {
  this.special_mode = this.status_duration[1] <= 0
  if(this.hot_timer > 0) {
    this.hot_timer -= dt
  }

  this.color = this.hot_timer > 0 ? this.hot_color : impulse_enemy_stats['tank'].color
}

Tank.prototype.activated_processing = function(dt) {
  if(this.activated)
  {
    console.log(this.detonate_timer + " " + this.id)
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

Tank.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  this.body.ApplyImpulse(new b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)), 
    this.body.GetWorldCenter())
  this.hot_timer = this.hot_interval
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
  if(other instanceof Tank && this.hot_timer > 0 && !this.dying && !this.activated)
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

  if(other === this.player && this.check_player_intersection(this.player)) {
   
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
  console.log("EXPLODE! " + this.id)
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
      console.log("EXPLODE ON ENEMY "+i+" "+_angle)

    }
  }
}

Tank.prototype.additional_drawing = function(context, draw_factor) {

  if(this.activated && this.detonate_timer > 0)
  {
    context.beginPath()
    context.strokeStyle = this.color;
    context.lineWidth = 2
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.bomb_factor * (1 - this.detonate_timer/this.detonate_duration)) * draw_factor, 0, 2*Math.PI, true)
    context.stroke()
  }
  
  context.beginPath()
  context.strokeStyle = this.color
  context.lineWidth = 2
  context.globalAlpha = .2
  context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * this.bomb_factor * draw_factor, 0, 2*Math.PI, true)
  context.stroke()
  context.globalAlpha = 1
  
}
