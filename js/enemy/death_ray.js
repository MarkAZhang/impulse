var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var music_player = require('../core/music_player.js');
var saveData = require('../load/save_data.js');
var uiRenderUtils = require('../render/ui.js');
var utils = require('../core/utils.js');

var Enemy = require('../enemy/enemy.js');

DeathRay.prototype = new Enemy()

DeathRay.prototype.constructor = DeathRay

function DeathRay(world, x, y, id, impulse_game_state) {
  if(world === undefined) return
  this.type = "deathray"

  this.init(world, x, y, id, impulse_game_state)
  if(world === null) return

  this.do_yield = false

  this.safe_radius = 10

  this.safe_radius_buffer = 2 //prevents the Death Ray from immediately toggling between running away and running towards

  this.interior_buffer = 5
  this.safe = true
  this.within_bounds = false

  this.shoot_interval = 1200

  if(saveData.difficultyMode == "easy") {
    this.shoot_interval = 1400
  }

  this.extra_adjust = false
  this.adjust_position_factor = 0.5;

  this.shoot_duration = this.shoot_interval

  this.aim_proportion = .56

  this.fire_interval = 200

  this.fire_duration = this.fire_interval

  this.fast_factor = 5

  this.ray_angle = null

  this.ray_radius = 0.8
  this.ray_buffer_radius = -0.5

  this.ray_force = 400

  this.turret_arm_angle = 0

  this.stun_length = 2000
  if(saveData.difficultyMode == "easy") {
    this.stun_length = 2000
  }


  this.aimed = false
  this.fired = false

  this.goalPt = null

  this.ray_size = 100
  this.ray_spread = Math.PI/48

  this.default_heading = false

  this.impulse_extra_factor = 3

  this.tank_force = 100

  this.die_on_player_collision = false
}

DeathRay.prototype.additional_processing = function(dt) {

  if(this.aimed) {
    this.set_heading(this.ray_angle)
  } else
    this.set_heading(utils.atan(this.body.GetPosition(), this.player.body.GetPosition()))

  if(this.safe != utils.pDist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius)
  {
    this.safe = !this.safe
  }

  if(this.destroyable_timer > 0) {
    this.destroyable_timer -= dt
  }

  this.within_bounds = utils.checkBounds(this.interior_buffer, this.body.GetPosition(), constants.drawFactor)

  if (this.recovery_timer > 0) {
    this.recovery_timer -= dt
  }
  if(this.is_silenced()) {
    this.reset_ray()
    return
  }

  //ready to shoot
  if(this.shoot_duration <= 0) {

    if(this.fire_duration <= 0) {
      //reset everything
      this.reset_ray()
      this.stun(this.stun_length);
      this.recovery_timer = this.stun_length;
      this.recovery_interval = this.stun_length;
    }
    else {
      this.fire_duration = Math.max(this.fire_duration - dt, 0)
      //fire the ray
      music_player.play_sound("deathray")
      if(this.fire_duration <= this.fire_interval/2 && !this.fired) {
        var ray_polygon = this.get_ray_polygon()
        this.fired = true
        if(utils.pointInPolygon(ray_polygon, this.player.body.GetPosition())) {
          var factor = 1
          if(this.player.is_bulked()) {
            factor *= 10
          }
          if(this.player.is_gooed() > 0) {
            factor *= 0.25
          }
          this.player.body.ApplyImpulse(new box_2d.b2Vec2(factor * this.ray_force * Math.cos(this.ray_angle), factor * this.ray_force * Math.sin(this.ray_angle)), this.player.body.GetWorldCenter())
          this.impulse_game_state.reset_combo()
        }
        for(var i = 0; i < this.level.enemies.length; i++) {
          if(this.level.enemies[i] != this && utils.pointInPolygon(ray_polygon, this.level.enemies[i].body.GetPosition())) {
            if(this.level.enemies[i].type == "orbiter") {
              this.level.enemies[i].weaken()
            }
            this.level.enemies[i].body.ApplyImpulse(new box_2d.b2Vec2(this.ray_force * Math.cos(this.ray_angle), this.ray_force * Math.sin(this.ray_angle)), this.level.enemies[i].body.GetWorldCenter())
            this.level.enemies[i].open(2500)
          }
        }
      }
    }

  }
  else if(this.aimed || (!this.aimed && this.within_bounds && !this.moving)) {
    this.shoot_duration = Math.max(this.shoot_duration - dt, 0)
    if(this.shoot_duration <= this.shoot_interval* this.aim_proportion && !this.aimed) {//if it hasn't been aimed, aim it now
      this.aim_ray()
    }
  }
}

DeathRay.prototype.additional_drawing = function(context, draw_factor) {
  if(this.recovery_timer > 0 && !this.dying) {
    uiRenderUtils.drawProgCircle(context, this.body.GetPosition().x, this.body.GetPosition().y, this.effective_radius, 1 - this.recovery_timer/this.recovery_interval, "#444444", 4)
  }
}


DeathRay.prototype.reset_ray = function() {
  this.shoot_duration = this.shoot_interval
  this.fire_duration = this.fire_interval
  this.aimed = false
  this.fired = false
  this.ray_angle = null
}

DeathRay.prototype.aim_ray = function() {
  this.ray_angle = utils.atan(this.body.GetPosition(), this.player.body.GetPosition())
  this.shoot_duration = this.shoot_interval * this.aim_proportion

  this.aimed = true
}

DeathRay.prototype.get_ray_polygon = function() {
  var ray_polygon = []
  ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle + Math.PI/2),
   y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle + Math.PI/2)})
  ray_polygon.push({x: this.body.GetPosition().x + this.ray_buffer_radius * Math.cos(this.ray_angle) + this.ray_radius * Math.cos(this.ray_angle - Math.PI/2),
    y: this.body.GetPosition().y + this.ray_buffer_radius * Math.sin(this.ray_angle) + this.ray_radius * Math.sin(this.ray_angle - Math.PI/2)})
  ray_polygon.push({x: ray_polygon[1].x + this.ray_size * Math.cos(this.ray_angle - this.ray_spread),
    y: ray_polygon[1].y + this.ray_size * Math.sin(this.ray_angle - this.ray_spread)
  })
  ray_polygon.push({x: ray_polygon[0].x + this.ray_size * Math.cos(this.ray_angle + this.ray_spread),
    y: ray_polygon[0].y + this.ray_size * Math.sin(this.ray_angle + this.ray_spread)
  })
  return ray_polygon
}

DeathRay.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {

  this.open(this.open_period)
  this.durations["impulsed"] += this.impulsed_duration
  this.body.ApplyImpulse(new box_2d.b2Vec2(this.impulse_extra_factor * impulse_force*Math.cos(hit_angle), this.impulse_extra_factor * impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
  this.process_impulse_specific(attack_loc, impulse_force, hit_angle)
}

DeathRay.prototype.get_target_point = function() {
  if(!this.safe) {
    this.goalPt = null
    var point = utils.getNearestSpawnPoint(this, this.player, this.impulse_game_state.level_name)
    return {x: point.x/constants.drawFactor, y: point.y/constants.drawFactor}
  }
  else {
    if(this.goalPt == null) {
      this.goalPt = {x: this.level.get_starting_loc().x/constants.drawFactor, y: this.level.get_starting_loc().y/constants.drawFactor}
    }
    return this.goalPt
  }
}

DeathRay.prototype.enemy_move = Enemy.prototype.move

DeathRay.prototype.move = function() {
  if(this.aimed) return // cannot move if aimed

  if(!this.safe) {// && this.turret_timer == 0) {
    if(this.path == null) {
      this.pathfinding_counter = 2 * this.pathfinding_delay
    }
    this.goalPt = null
    this.enemy_move()
    this.moving = true
  }
  else
  {
    if(this.within_bounds)
    {//within bounds
      this.path = null
      this.goalPt = null
      this.moving = false
    }
    else if(utils.pDist(this.player.body.GetPosition(), this.body.GetPosition()) > this.safe_radius + this.safe_radius_buffer)
    {
      if(this.path == null) {
        this.pathfinding_counter = 2 * this.pathfinding_delay
      }
      this.enemy_move()
      this.moving = true
    }
    else
      this.goalPt = null

  }

}

DeathRay.prototype.pre_draw = function(context, draw_factor) {


  if(!this.is_silenced()) {
    var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
    context.save()
    context.globalAlpha *= (1-prog)

    var ray_polygon = this.get_ray_polygon()

    if(this.shoot_duration <= this.shoot_interval * this.aim_proportion && this.ray_angle!= null) {
      var prog = 1 - this.shoot_duration / (this.shoot_interval * this.aim_proportion)
      context.save();
      context.beginPath()
      context.globalAlpha *= Math.max(prog, .2)
      context.moveTo(ray_polygon[1].x * draw_factor, ray_polygon[1].y * draw_factor)
      context.lineTo(ray_polygon[2].x * draw_factor, ray_polygon[2].y * draw_factor)
      context.moveTo(ray_polygon[3].x * draw_factor, ray_polygon[3].y * draw_factor)
      context.lineTo(ray_polygon[0].x * draw_factor, ray_polygon[0].y * draw_factor)
      context.lineWidth = 1
      context.strokeStyle = this.color
      context.stroke()

      if(this.fire_duration < this.fire_interval) {

        var vis = this.fire_duration > this.fire_interval/2 ? this.fire_interval - this.fire_duration : this.fire_duration
        vis /= (this.fire_interval/2)
        context.globalAlpha *= vis

        context.beginPath()

        context.moveTo(ray_polygon[0].x * draw_factor, ray_polygon[0].y * draw_factor)

        for(var i = 1; i < ray_polygon.length; i++)
        {
          context.lineTo(ray_polygon[i].x * draw_factor, ray_polygon[i].y * draw_factor)
        }
        context.closePath()
        context.fillStyle = this.color
        context.fill()
      }
      context.restore();
    }
    context.restore()

  }
}

DeathRay.prototype.get_color_for_status = function(status) {
  if(status == "normal") {
    return this.color ? this.color : null
  } else if(status == "stunned") {
    return '#444444';
  } else if(status == "silenced") {
    return 'gray'
  } else if(status == "gooed") {
    return "#e6c43c"
  } else if(status == "impulsed") {
    return this.impulsed_color
  } else if(status == "white") {
    return "white"
  } else if(status.slice(0, 5) == "world") {
    return constants.colors["world "+status.slice(5,6)+" lite"]
  }

  return this.get_additional_color_for_status(status)
}

DeathRay.prototype.modify_movement_vector = function(dir) {
  //apply impulse to move enemy

  if(!utils.checkBounds(-3, this.body.GetPosition(), constants.drawFactor)) {
    dir.Multiply(this.fast_factor)
  }

  var in_poly = false
  for(var i = 0; i < this.level.obstacle_polygons.length; i++)
  {
    if(utils.pointInPolygon(this.level.obstacle_polygons[i], this.body.GetPosition()))
    {
      in_poly = true
    }
  }
  if(in_poly)
  {
    dir.Multiply(this.slow_force)
  }
  else {

    if (this.is_silenced()) {
      dir.Multiply(0.5)
    }

    if(this.is_gooed()) {
      dir.Multiply(this.slow_factor)
    }
    dir.Multiply(this.force)
  }
}

DeathRay.prototype.player_hit_proc = function() {
}

module.exports = DeathRay;
