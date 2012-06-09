Goo.prototype = new Enemy()

Goo.prototype.constructor = Goo

function Goo(world, x, y, id, impulse_game_state) {
  if(world == null) return  //allows others to use Goo as super-class
  this.type = "goo"
  var s_radius = impulse_enemy_stats[this.type]['effective_radius']  //temp var
  var vertices = []
  vertices.push(new b2Vec2(s_radius * .25 * Math.cos(Math.PI * 0), s_radius * .5 * Math.sin(Math.PI*0)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 2/3), s_radius*Math.sin(Math.PI * 2/3)))
  vertices.push(new b2Vec2(s_radius*Math.cos(Math.PI * 4/3), s_radius*Math.sin(Math.PI * 4/3)))
  this.shape = new b2PolygonShape
  this.shape.SetAsArray(vertices, vertices.length)
  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2
  
  this.goo_color = [255, 255, 120]
  this.life_time = 7500 //goo automatically dies after this
  this.trailing_enemy_init()
}

Goo.prototype.trailing_enemy_init = function() {
  this.goo_polygons = []
  this.goo_interval = 300
  this.goo_timer = this.goo_interval
  this.goo_radius = 2 //radius of goo trail
  this.goo_duration = 3000 //amount of time a given goo polygon lasts
  this.goo_death_duration = 500
  this.last_left = null
  this.last_right = null
  this.do_yield = false
  this.effective_heading = this.body.GetAngle()//the heading used to calculate the goo, does not turn instantaneously
  this.life_duration = this.life_time
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
    var cur_angle = this.body.GetAngle()

    var left_goo_v = new b2Vec2(this.body.GetPosition().x + Math.cos(cur_angle + Math.PI/2) * this.goo_radius, this.body.GetPosition().y + Math.sin(cur_angle + Math.PI/2) * this.goo_radius)
    var right_goo_v = new b2Vec2(this.body.GetPosition().x + Math.cos(cur_angle - Math.PI/2) * this.goo_radius, this.body.GetPosition().y + Math.sin(cur_angle - Math.PI/2) * this.goo_radius)
    if(this.last_left !=null && this.status_duration[1] <= 0)
    {
      this.goo_polygons.push({duration: this.goo_duration, points: [this.last_left, this.last_right, right_goo_v, left_goo_v]})
    }
    this.last_left = left_goo_v
    this.last_right = right_goo_v
  }
  else {
    this.goo_timer -= dt
  }
  for(var i = 0; i < this.goo_polygons.length; i++)
  {

    if(pointInPolygon(this.goo_polygons[i]['points'], this.player.body.GetPosition())) {
      this.trail_effect(this.player)
    }
    for(var j = 0; j < this.level.enemies.length; j++) {
      if(pointInPolygon(this.goo_polygons[i]['points'], this.level.enemies[j].body.GetPosition()))
      {
        if(this.level.enemies[j]!==this)
        this.trail_effect(this.level.enemies[j])
      }
    }
    this.goo_polygons[i]['duration'] -= dt
  }
  while(this.goo_polygons[0] && this.goo_polygons[0]['duration'] < -this.goo_death_duration)
  {
    this.goo_polygons = this.goo_polygons.slice(1)
  }
}

Goo.prototype.pre_draw = function(context, draw_factor) {
  if(this.dying)
  {
    var prog = Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1)
    context.globalAlpha = (1 - prog)
  }
  for(var i = 0; i < this.goo_polygons.length; i++)
  {
    context.beginPath()
    if(i == this.goo_polygons.length - 1 && this.status_duration[1] <=0)
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
  context.globalAlpha = 1
}



Goo.prototype.player_hit_proc = function() {
  this.player.slow(2000)
}

Goo.prototype.trail_effect = function(obj) {
  obj.slow(100)
}
