var box_2d = require('../vendor/box2d.js');
var renderUtils = require('../render/utils.js');
var saveData = require('../load/save_data.js');
var sprites = require('../render/sprites.js');
var utils = require('../core/utils.js');

var Enemy = require('../enemy/enemy.js');

BossFourAttacker.prototype = new Enemy()

BossFourAttacker.prototype.constructor = BossFourAttacker

function BossFourAttacker(world, x, y, id, impulse_game_state,size) {

  this.type = "boss_four_attacker"

  this.init(world, x, y, id, impulse_game_state)

  this.size = size
  this.default_heading = false
  this.tank_force = 100
  if (saveData.difficultyMode == "easy") {
    this.tank_force = 70
  }
  this.spawner_hit_force = 200

  this.dir = null
  this.firing = false

  this.adjust_position_enabled = false

}

BossFourAttacker.prototype.draw = function(context, draw_factor) {

  var prog = this.dying ? Math.min((this.dying_length - this.dying_duration) / this.dying_length, 1) : 0
  context.save()
  context.globalAlpha *= 1-prog
  if(this.firing)
    renderUtils.drawSprite(context, this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor, this.body.GetAngle(), this.size * draw_factor * 2, this.size* draw_factor * 2, "adrogantia_attack_bud_firing", sprites.adrogantiaSprite)
  else
    renderUtils.drawSprite(context, this.body.GetPosition().x* draw_factor, this.body.GetPosition().y* draw_factor, this.body.GetAngle(), this.size * draw_factor * 2, this.size* draw_factor * 2, "adrogantia_attack_bud", sprites.adrogantiaSprite)
  context.restore()
}

BossFourAttacker.prototype.additional_processing = function(dt) {
  if(this.dir) {
    var dir = new box_2d.b2Vec2(this.dir.x, this.dir.y)
    dir.Normalize()
    dir.Multiply(this.force)
    if (saveData.difficultyMode == "easy") {
      dir.Multiply(0.5)
    }
    this.body.ApplyImpulse(dir, this.body.GetWorldCenter())
  }
}

BossFourAttacker.prototype.move = function() {
  return
}

BossFourAttacker.prototype.collide_with = function(other) {
  if(this.dying)//ensures the collision effect only activates once
    return

  if(this.is_silenced()) return


  if(other === this.player) {
      var tank_angle = utils.atan(this.body.GetPosition(), this.player.body.GetPosition())
      this.player.body.ApplyImpulse(new box_2d.b2Vec2(this.tank_force * Math.cos(tank_angle), this.tank_force * Math.sin(tank_angle)), this.player.body.GetWorldCenter())
      this.impulse_game_state.reset_combo();
      //this.cause_of_death = "hit_player"
      return
  } else if(this.dir && other.type == "boss_four_spawner") {
    var tank_angle = utils.atan({x:0, y:0}, this.dir)
    var ref_angle = utils.angleClosestTo(tank_angle, utils.atan(this.body.GetPosition(), other.body.GetPosition()))
    if(tank_angle < ref_angle) {
      tank_angle -= Math.PI/2
    } else {
      tank_angle += Math.PI/2
    }
    other.body.ApplyImpulse(new box_2d.b2Vec2(this.spawner_hit_force * Math.cos(tank_angle), this.spawner_hit_force * Math.sin(tank_angle)), other.body.GetWorldCenter())
  } else if(this.dir && other.type != "boss_four") {
    var tank_angle = utils.atan(this.body.GetPosition(), other.body.GetPosition())
    var dir = new box_2d.b2Vec2(this.dir.x, this.dir.y)
    dir.Normalize()
    dir.Multiply(100 * other.force)
    other.body.ApplyImpulse(dir, other.body.GetWorldCenter())
  }
}

BossFourAttacker.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {

}

BossFourAttacker.prototype.check_death = function() {
  //check if enemy has intersected polygon, if so die

  if(!this.dir) return

  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(utils.pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {

      if (this.durations["open"] <= 0 && this.require_open) {
        this.start_death("accident")
      } else {
        this.start_death("kill")
      }

      return
    }
  }
}


BossFourAttacker.prototype.set_size = function(size) {
  var vertices = []
  for(var j = 0; j < 5; j++) {
    vertices.push({x: Math.cos(Math.PI * 2 * j / 5) * size, y: Math.sin(Math.PI * 2 * j / 5) * size})
  }
  this.body.GetFixtureList().m_shape.m_vertices = vertices
  this.size = size
  this.body.ResetMassData()
}

module.exports = BossFourAttacker;
