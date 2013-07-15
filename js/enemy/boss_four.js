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

  this.body.SetAngle(Math.PI/2)

  this.visibility = 0

  this.dying_length = 2000

  this.red_visibility = 0

  this.spawn_interval = 2000
  this.spawn_duration = this.spawn_interval

  this.spawned = false

  this.spawn_laser_angle = Math.PI/2

  this.spawn_laser_revolution = 20000

  this.spawn_laser_radius = .2

  this.spawner_spawn_count = {
  "stunner" : 8,
   "spear" : 5,
   "tank" : 4,
   "mote" : 4,
   "goo" : 2,
   "harpoon" : 3,
   "orbiter" : 5,
   "disabler" : 1,
   "fighter" : 3,
   "slingshot" : 4,
   "troll" : 4,
   "deathray" : 2
 }

 this.spawner_spawn_force = {
  "stunner" : 10,
   "spear" : 10,
   "tank" : 75,
   "mote" : 10,
   "goo" : 20,
   "harpoon" : 20,
   "orbiter" : 8,
   "disabler" : 20,
   "fighter" : 30,
   "slingshot" : 10,
   "troll" : 10,
   "deathray" : 50
 }


 this.possible_spawn_sets = [

  ["fighter", "spear"],
  ["goo", "troll"],
  ["tank", "disabler"],
  ["stunner", "deathray"],
  ["mote", "slingshot"],
  ["orbiter", "spear"],
  ["harpoon", "goo"]
 ]

  this.spawner_push_force = 500
  this.spawner_interval = 22000//19000
  this.spawner_timer = 0

  this.last_object_hit = null

  this.laser_check_timer = 2
  this.laser_check_counter = this.laser_check_timer
  this.laser_check_diff = Math.PI/4

  this.shoot_interval = 5000

  this.shoot_durations = [this.shoot_interval,this.shoot_interval/2]

  this.aim_proportion = .25

  this.fire_interval = 200

  this.fire_durations = [this.fire_interval, this.fire_interval]

  this.ray_angles = [null, null] //the angle of the ray
  this.fire_angles = [null, null] //the boss angle when the ray fired

  this.ray_radius = 2
  this.ray_buffer_radius = 0
  this.ray_polygons = [[], []]

  this.ray_locs = [null, null]

  this.ray_aimer_polygons = [[], []]

  this.ray_force = 500

  this.aimed = [false, false]
  this.fired = [false, false]

  this.spawn_count = 1

  this.laser_colors = ["rgb(0, 229, 238)", "rgb(255, 20, 147)"]//first is crippler, second is deathray

  this.laser_polygon =
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/3), Math.sin(Math.PI * 1/3)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 5/3), Math.sin(Math.PI * 5/3)]]

  this.lin_damp = 10
  this.body.SetLinearDamping(10)

  this.laser_target_visible = true
  this.laser_target_visibility = 1

}
BossFour.prototype.additional_drawing = function(context, draw_factor) {
  if(this.spawner_timer >= 0) {

    context.beginPath()
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, (this.effective_radius*draw_factor) * 2, -.5* Math.PI,
     -.5 * Math.PI + 2*Math.PI * (this.spawner_timer / this.spawner_interval), true)
    context.lineWidth = 2
    context.strokeStyle = "gray"
    context.stroke()

    context.globalAlpha = 1
  }

  var laser_locs = this.get_two_laser_locs()

  for(var j = 0; j < 2; j++) {
      context.save();
      context.globalAlpha = this.visibility
      var tp = laser_locs[j]
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.body.GetAngle());
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);

      context.beginPath()

      context.moveTo((tp.x+this.laser_polygon[0][0] * 1.5)*draw_factor, (tp.y+this.laser_polygon[0][1] * 1.5)*draw_factor)
      for(var i = 1; i < this.laser_polygon.length; i++)
      {
        context.lineTo((tp.x+this.laser_polygon[i][0] * 1.5)*draw_factor, (tp.y+this.laser_polygon[i][1] * 1.5)*draw_factor)
      }
      context.closePath()
      context.lineWidth = 2
      context.strokeStyle = this.laser_colors[j]
      context.stroke()
      context.restore()
    }

  for(var m = 0; m < 2; m++) {
    if(this.shoot_durations[m] <= this.shoot_interval * this.aim_proportion && this.ray_angles[m]!= null) {

      context.beginPath()
      var cur_shape_points = this.laser_polygon
      var tp = this.ray_locs[m]

      context.save();
      context.translate(tp.x * draw_factor, tp.y * draw_factor);
      context.rotate(this.fire_angles[m]);
      context.translate(-(tp.x) * draw_factor, -(tp.y) * draw_factor);
      var offset = 0
      context.moveTo((tp.x+1.5 * Math.cos(offset))*draw_factor, (tp.y+1.5 * Math.sin(offset))*draw_factor)
      for(var i = 1; i < cur_shape_points.length; i++)
      {
        context.lineTo((tp.x+1.5 * Math.cos(i/3 * Math.PI + offset))*draw_factor, (tp.y+1.5 * Math.sin(i/3 * Math.PI + offset))*draw_factor)
      }
      context.strokeStyle = this.laser_colors[m]
      context.lineWidth = 2
      context.closePath()
      context.stroke()
      context.restore()

      if(this.laser_target_visibility > 0) {

        var prog = (1 - this.shoot_durations[m] / (this.shoot_interval * this.aim_proportion)) * this.laser_target_visibility

        context.beginPath()
        context.globalAlpha = Math.max(prog, .2)
        context.moveTo(this.ray_polygons[m][1].x * draw_factor, this.ray_polygons[m][1].y * draw_factor)
        context.lineTo(this.ray_polygons[m][2].x * draw_factor, this.ray_polygons[m][2].y * draw_factor)
        context.moveTo(this.ray_polygons[m][3].x * draw_factor, this.ray_polygons[m][3].y * draw_factor)
        context.lineTo(this.ray_polygons[m][0].x * draw_factor, this.ray_polygons[m][0].y * draw_factor)
        context.lineWidth = 1
        context.strokeStyle = this.laser_colors[m]
        context.stroke()
      }

      if(this.fire_durations[m] < this.fire_interval) {

        var vis = this.fire_durations[m] > this.fire_interval/2 ? this.fire_interval - this.fire_durations[m] : this.fire_durations[m]
        vis /= (this.fire_interval/2)
        context.globalAlpha = vis

        context.beginPath()

        context.moveTo(this.ray_polygons[m][0].x * draw_factor, this.ray_polygons[m][0].y * draw_factor)

        for(var i = 1; i < this.ray_polygons[m].length; i++)
        {
          context.lineTo(this.ray_polygons[m][i].x * draw_factor, this.ray_polygons[m][i].y * draw_factor)
        }
        context.closePath()
        context.fillStyle = this.laser_colors[m]
        context.fill()
        context.globalAlpha = 1
      }
    }

  }
  context.globalAlpha =1
}

BossFour.prototype.additional_processing = function(dt) {

  if(this.spawn_duration > 0) {
    this.spawn_duration = Math.max(this.spawn_duration - dt, 0)
    this.visibility = 1 - this.spawn_duration / this.spawn_interval
    return
  }
  else if(this.spawned == false){
    this.spawned = true
    this.visibility = 1
  }

  if(this.laser_target_visible && this.laser_target_visibility < 1)
    {
      this.laser_target_visibility = Math.min(1, this.laser_target_visibility + dt/1000)
    }
    else if(!this.laser_target_visible && this.laser_target_visibility > 0)
    {
      this.laser_target_visibility = Math.max(0, this.laser_target_visibility - dt/1000)
    }

  if(this.spawner_timer <= this.spawner_interval - 500) {

    this.lin_damp = impulse_enemy_stats["fourth boss"].lin_damp
  }

  if(this.spawner_timer <= 0) {
    this.lin_damp = 500
    this.spawner_timer = this.spawner_interval
    var spawner_set = this.get_spawner_set()
    var j = 0
    var exit_points = Math.max(spawner_set.length, 4)
    for(var i = 0; i < spawner_set.length; i++) {

      while(!isVisible(this.body.GetPosition(),
        {x: this.body.GetPosition().x + 15 * Math.cos((.25 * (this.spawn_count % 2)+ 2* (j + this.spawn_count) /(exit_points)) * Math.PI),
          y: this.body.GetPosition().y + 15 * Math.sin((.25 * (this.spawn_count % 2)+ 2*(j + this.spawn_count)/(exit_points)) * Math.PI)},
          this.level.obstacle_edges
        )) {j += 1}


      var loc = [this.body.GetPosition().x + (5 * Math.floor(j/4) + this.effective_radius) * Math.cos((.25 * (this.spawn_count % 2)+ 2*(j + this.spawn_count)/(exit_points)) * Math.PI),
       this.body.GetPosition().y + (5 * Math.floor(j/4) + this.effective_radius) * Math.sin((.25 * (this.spawn_count % 2)+ 2*(j + this.spawn_count)/(exit_points)) * Math.PI)]
      var new_enemy = new BossFourSpawner(this.world, loc[0], loc[1], this.level.enemy_counter,
      this.impulse_game_state, spawner_set[i], this.spawner_spawn_count[spawner_set[i]] * this.get_time_factor(), this.spawner_spawn_force[spawner_set[i]], this)
      this.level.spawned_enemies.push(new_enemy)
      var dir = new b2Vec2(Math.cos((.25 * (this.spawn_count % 2)+ 2*(j + this.spawn_count)/(exit_points)) * Math.PI), Math.sin((.25 * (this.spawn_count % 2)+ 2*(j + this.spawn_count)/(exit_points)) * Math.PI))
      dir.Multiply(this.spawner_push_force)
      new_enemy.body.ApplyImpulse(dir, new_enemy.body.GetWorldCenter())
      if(this.spawn_count > 1)
        new_enemy.silence(5000)
      this.level.enemy_counter +=1
      j+=1
    }
    this.spawn_count += 1
  }

  this.spawner_timer -= dt

  this.spawn_laser_angle += dt / this.spawn_laser_revolution * Math.PI * 2

  this.get_object_hit()

  for(var m = 0; m < 2; m++) {

    if(this.shoot_durations[m] <= 0) {

      if(this.fire_durations[m] <= 0) {
        //reset everything
        this.shoot_durations[m] = this.shoot_interval
        this.fire_durations[m] = this.fire_interval
        this.aimed[m] = false
        this.fired[m] = false
        this.ray_angles[m] = null
      }
      else {
        this.fire_durations[m] = Math.max(this.fire_durations[m] - dt, 0)
        //fire the ray
        if(this.fire_durations[m] <= this.fire_interval/2 && !this.fired[m]) {
          this.fired[m] = true

          if(pointInPolygon(this.ray_polygons[m], this.player.body.GetPosition())) {
            if(m == 1) {
              this.player.stun(1500)
              this.impulse_game_state.reset_combo()
            }
            if(m == 0) {
              this.player.body.ApplyImpulse(new b2Vec2(this.ray_force * Math.cos(this.ray_angles[m]), this.ray_force * Math.sin(this.ray_angles[m])), this.player.body.GetWorldCenter())
              this.impulse_game_state.reset_combo()
            }
          }
          for(var i = 0; i < this.level.enemies.length; i++) {
            if(pointInPolygon(this.ray_polygons[m], this.level.enemies[i].body.GetPosition())) {
              if(m == 1) {
                 this.level.enemies[i].stun(1500)
              }
              if(m == 0) {
                this.level.enemies[i].body.ApplyImpulse(new b2Vec2(this.ray_force * Math.cos(this.ray_angles[m]),
                this.ray_force * Math.sin(this.ray_angles[m])), this.level.enemies[i].body.GetWorldCenter())
              }

            }
          }

        }
      }
    }
    else {
      this.shoot_durations[m] = Math.max(this.shoot_durations[m] - dt, 0)
      if(this.shoot_durations[m] <= this.shoot_interval* this.aim_proportion && !this.aimed[m]) {//if it hasn't been aimed, aim it now
        var laser_loc = this.get_two_laser_locs()[m]
        this.ray_angles[m] = _atan(laser_loc, this.player.body.GetPosition())
        this.fire_angles[m] = this.body.GetAngle()
        this.ray_polygons[m] = []
        this.ray_polygons[m].push({x: laser_loc.x + this.ray_buffer_radius * Math.cos(this.ray_angles[m]) + this.ray_radius * Math.cos(this.ray_angles[m] + Math.PI/2),
          y: laser_loc.y + this.ray_buffer_radius * Math.sin(this.ray_angles[m]) + this.ray_radius * Math.sin(this.ray_angles[m] + Math.PI/2)})
        this.ray_polygons[m].push({x: laser_loc.x + this.ray_buffer_radius * Math.cos(this.ray_angles[m]) + this.ray_radius * Math.cos(this.ray_angles[m] - Math.PI/2),
          y: laser_loc.y + this.ray_buffer_radius * Math.sin(this.ray_angles[m]) + this.ray_radius * Math.sin(this.ray_angles[m] - Math.PI/2)})
        this.ray_polygons[m].push({x: laser_loc.x + 100 * Math.cos(this.ray_angles[m]) + this.ray_radius * Math.cos(this.ray_angles[m] - Math.PI/2),
          y: laser_loc.y + 100 * Math.sin(this.ray_angles[m]) + this.ray_radius * Math.sin(this.ray_angles[m] - Math.PI/2)})
        this.ray_polygons[m].push({x: laser_loc.x + 100 * Math.cos(this.ray_angles[m]) + this.ray_radius * Math.cos(this.ray_angles[m] + Math.PI/2),
         y: laser_loc.y + 100 * Math.sin(this.ray_angles[m]) + this.ray_radius * Math.sin(this.ray_angles[m] + Math.PI/2)})
        this.ray_locs[m] = laser_loc
        console.log("LASER LOC " + this.ray_locs[m].x + " " + this.ray_locs[m].y)
        this.aimed[m] = true
      }
    }
  }
}

BossFour.prototype.get_spawner_set = function() {

  if (this.spawn_count == 1) {
    return ["stunner", "spear", "harpoon", "fighter"]
  }
  else {
    return this.possible_spawn_sets[Math.floor(Math.random() * this.possible_spawn_sets.length)]
  }

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
      if(this.level.enemies[i].id == this.id) continue
      if(!(this.level.enemies[i] instanceof BossFourSpawner)) continue

      if(!is_angle_between(this.spawn_laser_angle - this.laser_check_diff, this.spawn_laser_angle + this.laser_check_diff,
        _atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()))) continue

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

BossFour.prototype.get_two_laser_locs = function() {
  var locs = []
  locs.push({x: this.body.GetPosition().x + Math.cos(this.body.GetAngle() - Math.PI/2) * this.effective_radius * 1.5,
    y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() - Math.PI/2) * this.effective_radius * 1.5})
  locs.push({x: this.body.GetPosition().x +Math.cos(this.body.GetAngle() + Math.PI/2) * this.effective_radius * 1.5,
    y: this.body.GetPosition().y +Math.sin(this.body.GetAngle() + Math.PI/2) * this.effective_radius * 1.5})
  return locs

}

BossFour.prototype.pre_draw = function(context, draw_factor) {

    if(!this.spawned) return
    context.beginPath()
    var laser_dist = this.cur_dist != null ? this.cur_dist : 100
    context.moveTo((this.body.GetPosition().x + this.spawn_laser_radius * Math.cos(this.spawn_laser_angle + Math.PI/2)) * draw_factor,
     (this.body.GetPosition().y + this.spawn_laser_radius * Math.sin(this.spawn_laser_angle + Math.PI/2)) * draw_factor)
    context.lineTo((this.body.GetPosition().x + this.spawn_laser_radius * Math.cos(this.spawn_laser_angle - Math.PI/2)) * draw_factor,
     (this.body.GetPosition().y + this.spawn_laser_radius * Math.sin(this.spawn_laser_angle - Math.PI/2)) * draw_factor)
    context.lineTo((this.body.GetPosition().x + laser_dist * Math.cos(this.spawn_laser_angle) +this.spawn_laser_radius * Math.cos(this.spawn_laser_angle - Math.PI/2)) * draw_factor,
      (this.body.GetPosition().y + laser_dist * Math.sin(this.spawn_laser_angle) +this.spawn_laser_radius * Math.sin(this.spawn_laser_angle - Math.PI/2)) * draw_factor)
    context.lineTo((this.body.GetPosition().x + laser_dist * Math.cos(this.spawn_laser_angle) +this.spawn_laser_radius * Math.cos(this.spawn_laser_angle + Math.PI/2)) * draw_factor,
      (this.body.GetPosition().y + laser_dist * Math.sin(this.spawn_laser_angle) +this.spawn_laser_radius * Math.sin(this.spawn_laser_angle + Math.PI/2)) * draw_factor)
    context.closePath()
    context.globalAlpha/=2
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
  for(var i = 0; i < this.shape_points[0].length; i++) {
    var temp = this.body.GetPosition().Copy()
    temp.Add(this.shape_points[0][i])
    ans.push(temp)
  }
  return ans
}

BossFour.prototype.explode = function() {

}

BossFour.prototype.get_time_factor = function() {
  //spawn increases by 30% for every minute
  return 1 + (this.impulse_game_state.game_numbers.seconds/60) * .2
}

BossFour.prototype.getLife = function() {
  if(this.dying) {
    return 0
  }
  var dist = Math.min(775/draw_factor - this.body.GetPosition().x, this.body.GetPosition().x - 25/draw_factor)
  var dist2 = Math.min(575/draw_factor - this.body.GetPosition().y, this.body.GetPosition().y - 25/draw_factor)
  return Math.min(dist, dist2)/(275/draw_factor)

}