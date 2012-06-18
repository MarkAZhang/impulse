BossOne.prototype = new Enemy()

BossOne.prototype.constructor = BossOne

BossOne.prototype.is_boss = true

function BossOne(world, x, y, id, impulse_game_state) {
  this.type = "first boss"

  this.world = world

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.bullet_alternater = 0

  this.safe = true

  this.shoot_interval = 5000

  this.shoot_duration = 4999

  this.shooter_types = [Math.floor(Math.random() * 2.99), Math.floor(Math.random() * 2.99)]//0 = stunner, 1 = spear, 2 = tank

  this.shooter_enemies = ["stunner", "spear", "tank"]

  this.shooter_change_interval = 3

  this.shooter_change_counter = this.shooter_change_interval

  this.shooter_force = [50, 20, 150]

  this.shooter_color_change_prog = 0//if 1, need to push to 0

  this.shooter_color_change_interval = 500

  this.shooter_old_types = null

  this.spawn_interval = 5000
  this.spawn_duration = this.spawn_interval

  this.spawned = false

  this.body.SetAngle(Math.PI/2)


}

BossOne.prototype.additional_processing = function(dt) {

  if(this.spawn_duration > 0) {
    this.spawn_duration = Math.max(this.spawn_duration - dt, 0)
    this.visibility = 1 - this.spawn_duration / this.spawn_interval
    return
  }
  else if(this.spawned == false){
    this.spawned = true
    this.visibility = 1
  }

  if(this.shooter_color_change_prog > 0) {
    this.shooter_color_change_prog = Math.max(this.shooter_color_change_prog - dt/this.shooter_color_change_interval, 0)
  }

  if(this.shoot_duration < 0) {
    this.shoot_duration = this.shoot_interval

    var shooter_locs = this.get_two_shooter_locs()

    for(var j = 0; j < 2; j++) {
      var new_enemy = new this.level.enemy_map[this.shooter_enemies[this.shooter_types[j]]](this.world, shooter_locs[j].x, shooter_locs[j].y, this.level.enemy_counter, this.impulse_game_state)
      this.level.spawned_enemies.push(new_enemy)
      var dir = new b2Vec2(this.player.body.GetPosition().x - shooter_locs[j].x, this.player.body.GetPosition().y - shooter_locs[j].y)
      dir.Normalize()
      dir.Multiply(this.shooter_force[this.shooter_types[j]])
      new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())
      new_enemy.pathfinding_counter = 2 * new_enemy.pathfinding_delay //immediately look for path
      this.level.enemy_counter += 1
    }
    
    this.shooter_change_counter -= 1

    if(this.shooter_change_counter <=0) {
      this.shooter_old_types = this.shooter_types
      if(this.impulse_game_state.game_numbers.score > impulse_level_data[this.level.level_name].cutoff_scores[2] * .75) {
        this.shooter_types = [2, 2]
      }
      else {
        this.shooter_types = [Math.floor(Math.random() * 2.99), Math.floor(Math.random() * 2.99)]
      }
      
      this.shooter_color_change_prog = 1
      this.shooter_change_counter = this.shooter_change_interval
    }

  }
  this.shoot_duration -= dt
}

BossOne.prototype.additional_drawing = function(context, draw_factor) {

  
  var shooter_locs = this.get_two_shooter_locs()

  for(var j = 0; j < 2; j++) {

      var tp = shooter_locs[j]
      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
      
      context.beginPath()
      
      context.moveTo((tp.x+this.points[0].x * .5)*draw_factor, (tp.y+this.points[0].y * .5)*draw_factor)
      for(var i = 1; i < this.points.length; i++)
      {
        context.lineTo((tp.x+this.points[i].x * .5)*draw_factor, (tp.y+this.points[i].y * .5)*draw_factor)
      }
      context.closePath()
      context.lineWidth = 2
      
      if(this.shooter_color_change_prog > 0) {
        context.strokeStyle = impulse_enemy_stats[this.shooter_enemies[this.shooter_types[j]]].color
        context.globalAlpha = 1 - this.shooter_color_change_prog
        context.stroke()
        context.globalAlpha /= 2
        context.fillStyle = context.strokeStyle
        context.fill() 
        context.globalAlpha = this.shooter_color_change_prog
        context.strokeStyle = impulse_enemy_stats[this.shooter_enemies[this.shooter_old_types[j]]].color
        context.stroke()
        context.globalAlpha /= 2
        context.fillStyle = context.strokeStyle
        context.fill() 
      }
      else {
        if(this.spawned == false) {
          context.globalAlpha = 1 - this.spawn_duration / this.spawn_interval
        }

        context.strokeStyle = impulse_enemy_stats[this.shooter_enemies[this.shooter_types[j]]].color
        context.stroke()
        context.globalAlpha /=2
        context.fillStyle = context.strokeStyle
        context.fill() 
        context.globalAlpha = 1
      }
      if(this.spawned == false) {
        context.globalAlpha = 1 - this.spawn_duration / this.spawn_interval
      }
      context.beginPath()
      context.arc(tp.x*draw_factor, tp.y*draw_factor, (this.effective_radius*draw_factor) * .75, -.5* Math.PI, -.5 * Math.PI + 2*Math.PI * (this.shoot_duration / this.shoot_interval), true)
      context.lineWidth = 2
      context.strokeStyle = "gray"
      context.stroke()
      
      context.restore()
      context.globalAlpha = 1
  }
}

BossOne.prototype.get_two_shooter_locs = function() {
  var locs = []
  locs.push({x: this.body.GetPosition().x + Math.cos(this.body.GetAngle() - Math.PI/4) * this.effective_radius * 1.5, y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() - Math.PI/4) * this.effective_radius * 1.5})
  locs.push({x: this.body.GetPosition().x +Math.cos(this.body.GetAngle() + Math.PI/4) * this.effective_radius * 1.5, y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() + Math.PI/4) * this.effective_radius * 1.5})
  return locs

}

BossOne.prototype.move = function() {
  this.set_heading(this.player.body.GetPosition())
}

BossOne.prototype.collide_with = function() {

}
BossOne.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.points.length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.points[i])
    ans.push(temp)
  }
  return ans
}
