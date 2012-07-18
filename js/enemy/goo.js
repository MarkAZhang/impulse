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
  this.trailing_enemy_init()
}

Goo.prototype.trailing_enemy_init = function() {
  this.goo_polygons = []
  this.goo_interval = 500
  this.goo_timer = this.goo_interval
  this.goo_radius = this.effective_radius //radius of goo trail
  this.goo_duration = 5000 //amount of time a given goo polygon lasts
  this.goo_death_duration = 500
  this.goo_long_duration = 5000
  this.last_left = null
  this.last_right = null
  this.do_yield = false
  this.effective_heading = this.body.GetAngle()//the heading used to calculate the goo, does not turn instantaneously
  this.life_duration = this.life_time
  
  this.goo_check_intersections_interval = 4
  this.goo_check_intersections_timer = this.goo_check_intersections_interval
}

Goo.prototype.get_cur_goo_vertices = function() {
  var cur_angle = this.body.GetAngle()

    var left_goo_v = new b2Vec2(this.body.GetPosition().x + Math.cos(cur_angle + Math.PI/2) * this.goo_radius, this.body.GetPosition().y + Math.sin(cur_angle + Math.PI/2) * this.goo_radius)
    var right_goo_v = new b2Vec2(this.body.GetPosition().x + Math.cos(cur_angle - Math.PI/2) * this.goo_radius, this.body.GetPosition().y + Math.sin(cur_angle - Math.PI/2) * this.goo_radius)

    return {left: left_goo_v, right: right_goo_v}
}

Goo.prototype.additional_processing = function(dt) {
  this.special_mode = this.status_duration[1] <= 0

  /*if(this.life_duration < 0) {
    this.start_death("kill")
    return
  }
  this.life_duration -= dt*/

  if(this.goo_timer < 0) {
    this.goo_timer = this.goo_interval

    var goo_vertices = this.get_cur_goo_vertices()
    
    if(this.last_left !=null && this.status_duration[1] <= 0 && !this.dying)
    {
      this.goo_polygons.push({duration: this.goo_duration, points: [this.last_left, this.last_right, goo_vertices.right, goo_vertices.left]})
    }
    this.last_left = goo_vertices.left
    this.last_right = goo_vertices.right
  }
  else {
    this.goo_timer -= dt
  }


  for(var i = 0; i < this.goo_polygons.length; i++)
  {

    if(pointInPolygon(this.goo_polygons[i]['points'], this.player.body.GetPosition())) {
      this.trail_effect(this.player)
    }

    if(this.goo_check_intersections_timer <= 0) {
      for(var j = 0; j < this.level.enemies.length; j++) {
        if(pointInPolygon(this.goo_polygons[i]['points'], this.level.enemies[j].body.GetPosition()))
        {
          if(this.level.enemies[j].className != this.className)
            this.trail_effect(this.level.enemies[j])
        }
      }
    }
    this.goo_polygons[i]['duration'] -= dt
  }

  if(this.status_duration[1] <= 0 && p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.effective_radius) {
    this.trail_effect(this.player)
  }

  if(this.goo_check_intersections_timer <= 0) {
    for(var j = 0; j < this.level.enemies.length; j++) {
      if(this.status_duration[1] <= 0 && p_dist(this.body.GetPosition(), this.level.enemies[j].body.GetPosition()) < this.effective_radius)
      {
        if(this.level.enemies[j].className != this.className)
          this.trail_effect(this.level.enemies[j])
      }
    }
  }

  if(this.goo_check_intersections_timer <= 0) {
    this.goo_check_intersections_timer = this.goo_check_intersections_interval
  }
  this.goo_check_intersections_timer -= 1

  while(this.goo_polygons[0] && this.goo_polygons[0]['duration'] < -this.goo_death_duration)
  {
    this.goo_polygons = this.goo_polygons.slice(1)
  }
}

Goo.prototype.process_death = function(enemy_index, dt) {
  if(this.died && this.dying_duration < this.dying_length - 50) {//the moment the enemy starts to die, remove the body from play
    this.died = false
    this.set_heading(this.player.body.GetPosition())
    this.level.dead_enemies.push(enemy_index)
    var goo_vertices = this.get_cur_goo_vertices()
    
    if(this.last_left !=null && this.status_duration[1] <= 0)
    {
      this.goo_polygons.push({duration: this.goo_duration, points: [this.last_left, this.last_right, goo_vertices.right, goo_vertices.left]})
    }

    for(var i = 0; i < this.goo_polygons.length; i++) {
      if(this.goo_polygons[i].duration >= 0) {//only ones that aren't already fading
        this.goo_polygons[i].duration = this.goo_long_duration
      }
    }
  }

  if(this.dying && this.dying_duration < 0 && this.goo_polygons.length == 0)
  {//if expired, dispose of it
    this.level.expired_enemies.push(enemy_index)
    this.additional_processing(dt)
    return true
  }

  if(this.dying )
  {//if dying, expire
    this.dying_duration -= dt
    this.additional_processing(dt)
    return true
  }
  return false
}


Goo.prototype.pre_draw = function(context, draw_factor) {
  
  for(var i = 0; i < this.goo_polygons.length; i++)
  {
    context.beginPath()
    if(false)//i == this.goo_polygons.length - 1 && this.status_duration[1] <=0 && !this.dying)
    {//progressively draw the first polygon

      context.moveTo(this.goo_polygons[i]['points'][0].x*draw_factor, this.goo_polygons[i]['points'][0].y * draw_factor)
      context.lineTo(this.goo_polygons[i]['points'][1].x*draw_factor, this.goo_polygons[i]['points'][1].y * draw_factor)
      var prog = (1 - Math.max(this.goo_timer/this.goo_interval,0))
      context.lineTo(((1-prog) * (this.goo_polygons[i]['points'][1].x) + prog*(this.goo_polygons[i]['points'][2].x))*draw_factor, ((1-prog) * (this.goo_polygons[i]['points'][1].y) + prog*(this.goo_polygons[i]['points'][2].y))*draw_factor)
      context.lineTo(((1-prog) * (this.goo_polygons[i]['points'][0].x) + prog*(this.goo_polygons[i]['points'][3].x))*draw_factor, ((1-prog) * (this.goo_polygons[i]['points'][0].y) + prog*(this.goo_polygons[i]['points'][3].y))*draw_factor)
    }
    else
    {
      context.moveTo(this.goo_polygons[i]['points'][0].x*draw_factor, this.goo_polygons[i]['points'][0].y * draw_factor)
      for(var j = 1; j <= 3; j++)
      {
        context.lineTo(this.goo_polygons[i]['points'][j].x*draw_factor, this.goo_polygons[i]['points'][j].y * draw_factor)
      }
    }
    context.closePath()
    //var vertices = 
    
    if(this.goo_polygons[i]['duration'] > 0)
    {
      context.fillStyle = "rgb(" + this.goo_color[0] + ", " + this.goo_color[1] + ", " + this.goo_color[2] + ")" 
    }
    else
    {
      var prog =  1 - Math.min((this.goo_polygons[i]['duration']/-this.goo_death_duration), 1)
      context.fillStyle = "rgb(" + Math.round((1 - prog) * 255 + prog * this.goo_color[0]) + ", " + Math.round((1 - prog) * 255 + prog * this.goo_color[1]) + ", " + Math.round((1 - prog) * 255 + prog * this.goo_color[2]) + ")" 
    }
  
    context.fill()
    context.lineWidth = 2
  }
  if(this.goo_polygons.length > 0 && !(this.dying && !this.died)) {
    context.beginPath()
    context.moveTo(this.goo_polygons[this.goo_polygons.length-1]['points'][3].x*draw_factor, this.goo_polygons[this.goo_polygons.length-1]['points'][3].y * draw_factor)
    context.lineTo(this.goo_polygons[this.goo_polygons.length-1]['points'][2].x*draw_factor, this.goo_polygons[this.goo_polygons.length-1]['points'][2].y * draw_factor)
    var goo_polygons = this.get_cur_goo_vertices()
    context.lineTo(goo_polygons.right.x*draw_factor, goo_polygons.right.y * draw_factor)
    context.lineTo(goo_polygons.left.x*draw_factor, goo_polygons.left.y * draw_factor)
    context.closePath()
    context.fillStyle = "rgb(" + this.goo_color[0] + ", " + this.goo_color[1] + ", " + this.goo_color[2] + ")" 
    context.fill()

    context.beginPath()
    context.arc((this.body.GetPosition().x)*draw_factor, (this.body.GetPosition().y)*draw_factor, this.effective_radius*draw_factor, 0, 2*Math.PI, true)
    context.fill()
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
  this.player.goo(2000)
}

Goo.prototype.trail_effect = function(obj) {
  obj.goo(500)
}
