var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var music_player = require('../core/music_player.js');
var saveData = require('../load/save_data.js');
var utils = require('../core/utils.js');

var Enemy = require('../enemy/enemy.js');

FighterBullet.prototype = new Enemy()

FighterBullet.prototype.constructor = FighterBullet

function FighterBullet(world, x, y, id, impulse_game_state, dir, parent_id) {
  if(world === undefined) return
  this.type = "fighter_bullet"

  this.init(world, x, y, id, impulse_game_state)

  if(world === null) return
  this.special_mode = false

  this.death_radius = 5

  this.v = new box_2d.b2Vec2(Math.cos(dir), Math.sin(dir))
  this.v.Normalize()
  this.v.Multiply(this.force)

  if(saveData.difficultyMode == "easy") {
    this.v.Multiply(0.5)
  }
  this.do_yield = false
  this.bullet_force = 100
  if(saveData.difficultyMode == "easy") {
    this.bullet_force = 50
  }

  this.adjust_position_enabled = false

  this.bullet_enemy_factor = 150;

  this.parent_id = parent_id

  this.reflected = false
  this.body.SetBullet(true)

  this.do_yield = false

  this.bullet_goo_factor = 0.33

}

FighterBullet.prototype.start_death = function(death) {
  this.dying = death
  this.dying_duration = this.dying_length
  this.died = true
}

FighterBullet.prototype.collide_with = function(other) {
  if(this.dying)//ensures the collision effect only activates once
    return
  if(other === this.player) {
    this.start_death("hit_player")
    if(!this.is_silenced()) {
      music_player.play_sound("fbullethit")
      var vel = this.body.GetLinearVelocity().Copy()
      vel.Normalize()
      //utils.atan(this.body.GetPosition(), this.player.body.GetPosition())
      if(this.player.is_gooed() > 0) {
        vel.Multiply(this.bullet_force * this.bullet_goo_factor)
        this.player.body.ApplyImpulse(vel, this.player.body.GetWorldCenter())
      } else {
        vel.Multiply(this.bullet_force)
        this.player.body.ApplyImpulse(vel, this.player.body.GetWorldCenter())
      }
      this.impulse_game_state.reset_combo()
    }
  }
  else if(other.is_enemy)
  {
    if(other.type === "fighter_bullet") return

    this.start_death("hit_enemy")

    if(other.id != this.parent_id || this.reflected) {
      if(!this.is_silenced()) {
        music_player.play_sound("fbullethit")
        if(other.type === 'fighter' ) {
          other.frenzy_charge = 0
        }
        var vel = this.body.GetLinearVelocity().Copy()
        vel.Normalize()
        //var bullet_angle = utils.atan(this.body.GetPosition(), other.body.GetPosition())

        var factor = 1;

        if(other.id == this.parent_id) {
          factor *= 1.5
          if (other.is_gooed()) {
            factor *= 2;
          }
        } else if (other.type === "fighter") {
          factor *= 1.5
        } else if (other.type === "orbiter") {
          other.weaken()
        }

        vel.Multiply(this.bullet_enemy_factor * other.force * factor)
        other.open(1500)
        //var force = new box_2d.b2Vec2(this.bullet_force * factor * Math.cos(bullet_angle), this.bullet_force * factor * Math.sin(bullet_angle));

        other.body.ApplyImpulse(vel, other.body.GetWorldCenter())
      }
    }
  }

}

FighterBullet.prototype.move = function() {

  if (this.is_gooed()) {
    this.body.ApplyImpulse(new box_2d.b2Vec2(0.7 * this.v.x, 0.7 * this.v.y), this.body.GetWorldCenter())
  } else {
    this.body.ApplyImpulse(this.v, this.body.GetWorldCenter())
  }

  this.set_heading(utils.atan({x: 0, y: 0}, this.v))
}

FighterBullet.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
  var temp_dir = new box_2d.b2Vec2(this.body.GetPosition().x - attack_loc.x, this.body.GetPosition().y - attack_loc.y)
  temp_dir.Normalize()
  temp_dir.Multiply(impulse_force)
  this.v.Add(temp_dir)
  this.reflected = true
  this.open(this.open_period)

}

FighterBullet.prototype.check_death = function()
{
  //check if enemy has intersected polygon, if so die
  for(var k = 0; k < this.level.obstacle_polygons.length; k++)
  {
    if(utils.pointInPolygon(this.level.obstacle_polygons[k], this.body.GetPosition()))
    {
      this.start_death("kill")

      return
    }
  }
  if(this.body.GetPosition().x <= -5 || this.body.GetPosition().x >= constants.canvasWidth/constants.drawFactor + 5 || this.body.GetPosition().y <= -5 || this.body.GetPosition().y >= constants.canvasWidth/constants.drawFactor + 5)
  {
    this.start_death("kill")
  }
}

FighterBullet.prototype.player_hit_proc = function() {
}

module.exports = FighterBullet;
