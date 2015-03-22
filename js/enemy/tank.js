var box_2d = require('../vendor/box2d.js');
var enemyData = require('../data/enemy_data.js');
var saveData = require('../load/save_data.js');
var utils = require('../core/utils.js');

var Enemy = require('../enemy/enemy.js');

Tank.prototype = new Enemy()

Tank.prototype.constructor = Tank

function Tank(world, x, y, id, impulse_game_state) {
  this.type = "tank"

  this.silence_outside_arena = false

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.tank_force = 100 //force that the spear impulses the player

  if(saveData.difficultyMode == "easy")
    this.tank_force = 80

  if (saveData.difficultyMode == "normal") {}

  this.death_radius = 5

  this.detonate_timer = 200
  this.detonate_duration = 200
  this.death_delay = 200
  this.bomb_factor = 6

  if(saveData.difficultyMode == "easy") {
    this.bomb_factor = 5
  }

  this.tank_collision_fudge_period = 75;

  this.activated = false

  this.cause_of_death = null
  this.do_yield = false

  this.default_heading = false

  this.spin_rate = 4000

  this.require_open = true;
  this.open_period = 500;
  this.additional_statuses = ["volatile"]
  this.durations["volatile"] = 0

  this.has_bulk_draw = true
  this.bulk_draw_nums = 1

  this.volatile_interval = 1500
}

Tank.prototype.additional_processing = function(dt) {

  this.special_mode = !this.is_silenced();

  if (this.tank_collision_fudge_timer > 0) {
    this.tank_collision_fudge_timer -= dt;
  }

  if(this.durations["volatile"] > 0) {
    this.durations["volatile"] -= dt
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
    if(utils.pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      if(!this.is_silenced() && this.durations["volatile"] > 0) {
        this.activated = true
        this.cause_of_death = "kill"
      }
      else if(this.durations["open"] > 0) {
        this.start_death("kill")
      } else {
        this.start_death("accident")
      }
      return
    }
  }
}


Tank.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  this.durations["impulsed"] += this.impulsed_duration
  this.process_impulse_specific(attack_loc, impulse_force, hit_angle)
  this.open(this.open_period)
  if (this.is_gooed()) {
    this.body.ApplyImpulse(new box_2d.b2Vec2(1.3 * impulse_force*Math.cos(hit_angle), 1.3 * impulse_force*Math.sin(hit_angle)), this.body.GetWorldCenter())
  } else {
    if (saveData.difficultyMode == "easy") {
      this.body.ApplyImpulse(new box_2d.b2Vec2(1.25 * impulse_force*Math.cos(hit_angle), 1.25 * impulse_force*Math.sin(hit_angle)), this.body.GetWorldCenter())
    } else {
      this.body.ApplyImpulse(new box_2d.b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)), this.body.GetWorldCenter())
    }

  }

  if (this.tank_collision_fudge_timer > 0 && !this.dying && !this.activated && !this.is_silenced()) {
    this.activated = true
    this.cause_of_death = "kill"
  }
}

Tank.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.durations["volatile"] = this.volatile_interval
}

Tank.prototype.collide_with = function(other, this_body, other_body) {
  if(other.type === "tank") {
    if (this.durations["volatile"] > 0 && !this.dying && !this.activated && !this.is_silenced())
    {
      this.activated = true
      this.cause_of_death = "kill"
    } else {
      // If we've collided with a tank, but we haven't received the impulse,
      // it's possible that the impulse is about to hit. Give a short grace period.
      this.tank_collision_fudge_timer = this.tank_collision_fudge_period;
    }
  }

  if(this.dying || this.activated)//ensures the collision effect only activates once
    return

  if(other === this.player) {
    if(!this.is_silenced()) {
      this.activated = true
      this.cause_of_death = "hit_player"
      this.impulse_game_state.reset_combo()
    }
    else {
      this.start_death("hit_player")
    }
  } else if(other.isEnemy) {
    if(other.durations["open"] > 0) {
      this.open(other.durations["open"])
    }
}
}

Tank.prototype.explode = function() {
  if(utils.pDist(this.body.GetPosition(), this.player.body.GetPosition()) <= this.effective_radius * this.bomb_factor)
  {
    var tank_angle = utils.atan(this.body.GetPosition(), this.player.body.GetPosition())
    var force = this.tank_force;
    this.player.body.ApplyImpulse(new box_2d.b2Vec2(force * Math.cos(tank_angle), force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
    // If you get caught in explosion, your combo resets.
    if (this.cause_of_death != "hit_player") {
      this.impulse_game_state.reset_combo()
    }
  }

  for(var i = 0; i < this.level.enemies.length; i++)
  {

    if(this.level.enemies[i] !== this && utils.pDist(this.body.GetPosition(), this.level.enemies[i].body.GetPosition()) <= this.effective_radius * this.bomb_factor)
    {
      var _angle = utils.atan(this.body.GetPosition(), this.level.enemies[i].body.GetPosition())
      this.level.enemies[i].body.ApplyImpulse(new box_2d.b2Vec2(this.tank_force * Math.cos(_angle), this.tank_force * Math.sin(_angle)), this.level.enemies[i].body.GetWorldCenter())
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
  if(this.is_lightened()) {
    lighten_multiplier /= this.lighten_factor
  }

  if(this.activated && this.detonate_timer > 0)
  {
    context.beginPath()
    context.strokeStyle = "red";
    context.lineWidth = 5
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * (this.bomb_factor * (1 - this.detonate_timer/this.detonate_duration)) * draw_factor, 0, 2*Math.PI*0.999)
    context.stroke()
  } else if(!this.is_silenced() && this.durations["volatile"] > 0) {
    context.beginPath()
    context.strokeStyle = "red"
    context.lineWidth = 2
    context.globalAlpha *= .5
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * this.bomb_factor * draw_factor, 0, 2*Math.PI * 0.999)
    context.stroke()

  }
  context.restore();

}

Tank.prototype.bulk_draw_start = function(context, draw_factor, num) {
  context.save()
  context.beginPath()
  context.lineWidth = 2
  context.globalAlpha *= .5
  context.strokeStyle = enemyData[this.type].color
}

Tank.prototype.bulk_draw = function(context, draw_factor, num) {
  // Do not draw if dying. We cannot change the opacity for a given enemy for bulk-draw, so we just don't draw at all.
  if (this.dying) {
    return
  }
  if(this.durations["volatile"] <= 0 && !this.is_silenced()) {
    context.moveTo(this.body.GetPosition().x*draw_factor +  this.effective_radius * this.bomb_factor * draw_factor, this.body.GetPosition().y*draw_factor)
    context.arc(this.body.GetPosition().x*draw_factor, this.body.GetPosition().y*draw_factor, this.effective_radius * this.bomb_factor * draw_factor, 0, 2*Math.PI*0.999)
  }
}

Tank.prototype.bulk_draw_end = function(context, draw_factor, num) {
  context.stroke()
  context.restore()
}

Tank.prototype.get_additional_color_for_status = function(status) {
  if(status == "volatile") {
    return "red"
  }
}

Tank.prototype.get_current_status = function() {
  if(this.dying) {
    return "volatile"
  }

  if(!this.dying) {
    if(this.is_locked()) {
      return 'stunned';
    } else if(this.color_silenced) {
      return 'silenced'
    } if(this.durations["volatile"] > 0) {
      return "volatile"
    } else if(this.is_gooed()) {
      return "gooed"
    } else if (this.is_disabled()) {
      return 'silenced';
    }
    if(this.durations["impulsed"] > 0) {
      return "impulsed"
    }
  }

  return this.get_additional_current_status()
}

module.exports = Tank;
