BossThree.prototype = new Enemy()

BossThree.prototype.constructor = BossThree

BossThree.prototype.is_boss = true

function BossThree(world, x, y, id, impulse_game_state) {
  this.type = "third boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 1500

  this.shoot_duration = 5

  this.do_yield = false

  this.safe = true

  this.spawn_interval = 7600
  this.spawn_duration = this.spawn_interval

  this.guns_core_angle = Math.PI/2
  this.guns_distance_factor = 6
  this.num_guns = 6

  this.spawned = false

  this.body.SetAngle(Math.PI/2)

  this.dying_length = 2000

  this.visibility = 0

  this.gun_polygon = [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]

  this.gun_radius = 1.5

  this.guns_inside = []
  for (var i = 0; i < this.num_guns; i++) {
    this.guns_inside.push(true)
  }

  this.guns_check_inside_interval = 5

  this.guns_check_inside_timer = this.guns_check_inside_interval

  this.silence_interval = 13400

  this.silence_timer = this.silence_interval - 1

  this.silence_duration = 7000

  this.silenced = false

  this.red_visibility = 0

}

BossThree.prototype.additional_processing = function(dt) {

  if(this.spawn_duration > 0) {
    this.spawn_duration = Math.max(this.spawn_duration - dt, 0)
    this.visibility = 1 - this.spawn_duration / this.spawn_interval
    return
  }
  else if(this.spawned == false){
    this.spawned = true
    this.visibility = 1
  }
  if(this.shoot_duration < 0) {
    this.shoot_duration = this.silence_timer < 0 ? this.shoot_interval/3 : this.shoot_interval

    var gun_locs = this.get_gun_locs()

    for(var j = 0; j < gun_locs.length; j++) {

      if(this.guns_check_inside_timer <= 0) {
        this.guns_inside[j] = isVisible(this.player.body.GetPosition(), gun_locs[j], this.level.obstacle_edges)
      }

      if(!this.guns_inside[j]) continue
      if (this.silence_timer < 0)
        var new_enemy = new PiercingFighterBullet(this.world, gun_locs[j].x, gun_locs[j].y, this.level.enemy_counter, this.impulse_game_state, (this.player.body.GetPosition().x - gun_locs[j].x), (this.player.body.GetPosition().y - gun_locs[j].y), this.id)
      else
        var new_enemy = new FighterBullet(this.world, gun_locs[j].x, gun_locs[j].y, this.level.enemy_counter, this.impulse_game_state, (this.player.body.GetPosition().x - gun_locs[j].x), (this.player.body.GetPosition().y - gun_locs[j].y), this.id)
      new_enemy.bullet_force = 100
      if(this.silence_timer < 0) new_enemy.v.Multiply(2)
      this.level.spawned_enemies.push(new_enemy)
      this.level.enemy_counter += 1
    }
    if(this.guns_check_inside_timer <= 0) {
      this.guns_check_inside_timer = this.guns_check_inside_interval
    }
    this.guns_check_inside_timer -= 1

  }
  if(this.silence_timer < 0 && !this.silenced) {
    this.silenced = true
    this.global_silence()
  }

  if(this.silence_timer < -this.silence_duration) {
    this.silenced = false
    this.silence_timer = this.silence_interval
  }
  this.silence_timer -= dt

  this.shoot_duration -= dt
  
  if(this.silence_timer > .9 * this.silence_interval) {
    this.red_visibility = (this.silence_timer - .9 * this.silence_interval)/(.1 * this.silence_interval)
  }
  else if(this.silence_timer < .175 * this.silence_interval && this.silence_timer >= 0) {
    var temp = this.silence_timer
    while(temp > .05 * this.silence_interval) {temp -= .05 * this.silence_interval}

    this.red_visibility = temp > 0.025 * this.silence_interval ? (temp - 0.025 * this.silence_interval)/(0.025 * this.silence_interval) : (0.025*this.silence_interval - temp)/(0.025 * this.silence_interval)
  }
  else if(this.silence_timer < 0) {
    this.red_visibility = 1
  }

}

BossThree.prototype.pre_draw = function(context, draw_factor) {
  if(this.silence_timer < 0 && this.silence_timer >= -this.silence_duration) {
    var gray = Math.min(5 - Math.abs((-this.silence_timer - this.silence_duration/2)/(this.silence_duration/10)), 1)
    context.globalAlpha = gray/2
    context.fillStyle = "red"
    context.fillRect(0, 0, canvasWidth, canvasHeight)
  }

}

BossThree.prototype.additional_drawing = function(context, draw_factor) {

  if(this.red_visibility > 0) {
      var tp = this.body.GetPosition()
      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
      
      context.beginPath()
      context.globalAlpha = this.red_visibility
      
      context.moveTo((tp.x+this.shape_points[0][0].x)*draw_factor, (tp.y+this.shape_points[0][0].y)*draw_factor)
      for(var i = 1; i < this.shape_points[0].length; i++)
      {
        context.lineTo((tp.x+this.shape_points[0][i].x)*draw_factor, (tp.y+this.shape_points[0][i].y)*draw_factor)
      }
      context.closePath()
      context.fillStyle = "red"
      context.fill()
      context.globalAlpha = 1
      context.restore()
  }

  var gun_locs = this.get_gun_locs()
  if(this.spawned == false) {
    context.globalAlpha = 1 - this.spawn_duration / this.spawn_interval
  }
  for(var j = 0; j < gun_locs.length; j++) {
    context.beginPath()
    var tp = gun_locs[j]
    context.save();
    var angle = _atan(tp, this.player.body.GetPosition())
    context.translate(tp.x * draw_factor, tp.y * draw_factor);
    context.rotate(angle)
    context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
      
    context.moveTo((tp.x+this.gun_polygon[0][0] * this.gun_radius)*draw_factor, (tp.y+this.gun_polygon[0][1] * this.gun_radius)*draw_factor)
    for(var i = 1; i < this.gun_polygon.length; i++)
    {
      context.lineTo((tp.x+this.gun_polygon[i][0] * this.gun_radius)*draw_factor, (tp.y+this.gun_polygon[i][1] * this.gun_radius)*draw_factor)
    }
    context.closePath()

    context.strokeStyle = this.guns_inside[j] ? (this.silence_timer < 0 ? "red" : this.color): "gray"
    context.lineWidth = 2
    context.stroke()
    context.globalAlpha /= 2
    context.fillStyle = this.guns_inside[j] ?  (this.silence_timer < 0 ? "red" : this.color): "gray"
    context.fill()
    context.restore()

  }
  context.globalAlpha = 1
  
  if(this.silence_timer >= 0) {
    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (Math.max(this.silence_timer, 0) / this.silence_interval), true)
    context.lineWidth = 2
    context.strokeStyle = "red"
    context.stroke()
  }
  

}

BossThree.prototype.get_gun_locs = function() {
  var locs = []
  for(var i = 0; i < this.num_guns; i++) {
    locs.push({x: this.body.GetPosition().x + Math.cos(0 + Math.PI * 2 * i / this.num_guns) * this.effective_radius * this.guns_distance_factor, y: this.body.GetPosition().y + Math.sin(0 + Math.PI * 2 * i/ this.num_guns) * this.effective_radius * this.guns_distance_factor})
  }

  return locs
}

BossThree.prototype.move = function() {
  this.set_heading(this.player.body.GetPosition())
}

BossThree.prototype.collide_with = function() {

}

BossThree.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.shape_points[0][i])
    ans.push(temp)
  }
  return ans
}

BossThree.prototype.global_silence = function() {
  this.player.silence(Math.round(this.silence_duration))
  for(var i = 0; i < this.level.enemies.length; i++) {
    if(this.level.enemies[i].id != this.id && !(this.level.enemies[i] instanceof FighterBullet))
      this.level.enemies[i].silence(Math.round(this.silence_duration))
  }
}
