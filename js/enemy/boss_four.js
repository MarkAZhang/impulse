BossFour.prototype = new Enemy()

BossFour.prototype.constructor = BossFour

BossFour.prototype.is_boss = true

function BossFour(world, x, y, id, impulse_game_state) {
  this.type = "fourth boss"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.do_yield = false

  this.safe = true

  this.arm_full_rotation = 15000

  this.body.SetAngle(Math.PI/2)

  this.visibility = 0

  this.red_visibility = 0

  this.spawn_laser_angle = Math.PI/2

  this.spawn_laser_revolution = 15000

  this.spawn_laser_radius = .2

  this.spawned_spawners = false

  this.spawner_types = ["stunner", "wisp", "spear", "disabler", "tank", "fighter", "mote", "slingshot", "goo", "crippler", "harpoon", "deathray"]

  this.spawner_initial_radius = 10

  this.last_object_hit = null

  this.laser_check_timer = 2
  this.laser_check_counter = this.laser_check_timer
  this.laser_check_diff = Math.PI/4

}

BossFour.prototype.additional_processing = function(dt) {

  if(!this.spawned_spawners) {
    for(var i = 0; i < this.spawner_types.length; i++) {
      var loc = [this.body.GetPosition().x + this.spawner_initial_radius * Math.cos(i/6 * Math.PI), this.body.GetPosition().y + this.spawner_initial_radius * Math.sin(i/6 * Math.PI)]
      this.level.spawned_enemies.push(new BossFourSpawner(this.world, loc[0], loc[1], this.level.enemy_counter, this.impulse_game_state, this.spawner_types[i], this))
      this.level.enemy_counter +=1
      this.spawned_spawners = true
    }
  }
  this.spawn_laser_angle += dt / this.spawn_laser_revolution * Math.PI * 2

  this.get_object_hit()
  
}

BossFour.prototype.get_object_hit = function() {
  var dist = null
  var object = null
  var ray_end = {x: this.body.GetPosition().x + 100 * Math.cos(this.spawn_laser_angle), 
    y: this.body.GetPosition().y + 100 * Math.sin(this.spawn_laser_angle)}
  if(this.laser_check_counter <= 0) {
    this.laser_check_counter = this.laser_check_timer
    for(var i = 0; i < this.level.enemies.length; i++)
    {
      if(!is_angle_between(this.spawn_laser_angle - this.laser_check_diff, this.spawn_laser_angle + this.laser_check_diff, 
        _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()))) continue
      if(this.level.enemies[i].id == this.id) continue
      var temp_dist = this.level.enemies[i].get_segment_intersection(this.body.GetPosition(), ray_end).dist
      if(dist == null || (temp_dist != null && temp_dist < dist))
      {
        dist = temp_dist      
        object = this.level.enemies[i]
      }
    }
  }
  else {
    dist = this.cur_dist
    object = this.cur_object

  }
  this.laser_check_counter -=1 

  var temp_dist = this.player.get_segment_intersection(this.body.GetPosition(), ray_end).dist
    if(dist == null || (temp_dist != null && temp_dist < dist))
    {
      dist = temp_dist      
      object = this.player
    }

  if(object instanceof BossFourSpawner && object.id != this.cur_object.id) {

    object.spawn_enemy()
  }

  this.cur_object = object
  this.cur_dist = dist
  
}

BossFour.prototype.pre_draw = function(context, draw_factor) {
  
  
    context.beginPath()
    var laser_dist = this.cur_dist != null ? this.cur_dist : 100
    context.moveTo((this.body.GetPosition().x + this.spawn_laser_radius * Math.cos(this.spawn_laser_angle + Math.PI/2)) * draw_factor, (this.body.GetPosition().y + this.spawn_laser_radius * Math.sin(this.spawn_laser_angle + Math.PI/2)) * draw_factor)
    context.lineTo((this.body.GetPosition().x + this.spawn_laser_radius * Math.cos(this.spawn_laser_angle - Math.PI/2)) * draw_factor, (this.body.GetPosition().y + this.spawn_laser_radius * Math.sin(this.spawn_laser_angle - Math.PI/2)) * draw_factor)
    context.lineTo((this.body.GetPosition().x + laser_dist * Math.cos(this.spawn_laser_angle) +this.spawn_laser_radius * Math.cos(this.spawn_laser_angle - Math.PI/2)) * draw_factor, (this.body.GetPosition().y + laser_dist * Math.sin(this.spawn_laser_angle) +this.spawn_laser_radius * Math.sin(this.spawn_laser_angle - Math.PI/2)) * draw_factor)
    context.lineTo((this.body.GetPosition().x + laser_dist * Math.cos(this.spawn_laser_angle) +this.spawn_laser_radius * Math.cos(this.spawn_laser_angle + Math.PI/2)) * draw_factor, (this.body.GetPosition().y + laser_dist * Math.sin(this.spawn_laser_angle) +this.spawn_laser_radius * Math.sin(this.spawn_laser_angle + Math.PI/2)) * draw_factor)
    context.closePath()
    context.globalAlpha = .5
    context.fillStyle = this.color
    context.fill()
    context.globalAlpha = 1

}

BossFour.prototype.get_arm_polygons = function() {
  

}

BossFour.prototype.move = function() {
  this.set_heading(this.player.body.GetPosition())
}

BossFour.prototype.collide_with = function() {

}

BossFour.prototype.get_impulse_sensitive_pts = function() {
  var ans = []
  for(var i = 0; i < this.points.length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.points[i])
    ans.push(temp)
  }
  return ans
}

BossFour.prototype.explode = function() {
  
}
