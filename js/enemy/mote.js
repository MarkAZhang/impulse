var box_2d = require('../vendor/box2d.js');
var saveData = require('../load/save_data.js');

var Enemy = require('../enemy/enemy.js');

Mote.prototype = new Enemy()

Mote.prototype.constructor = Mote

function Mote(world, x, y, id, impulse_game_state) {
  this.type = "mote"

  this.silence_outside_arena = false
  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5
  this.default_heading = false

  this.spin_rate = 2000

  this.cautious = true
  this.extra_adjust = false

  this.adjust_position_factor = 1

  this.silence_duration = 3000
  if(saveData.difficultyMode == "easy")
    this.silence_duration = 2000

}

Mote.prototype.player_hit_proc = function() {
  if(!this.is_silenced())
    this.player.silence(this.silence_duration, true)
}

Mote.prototype.additional_processing = function(dt) {
  this.body.SetAngle(this.body.GetAngle() + 2*Math.PI * dt/this.spin_rate)
}

Mote.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
	if(this.is_silenced()) {
		this.body.ApplyImpulse(new box_2d.b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
    this.open(this.open_period)
  }
}

module.exports = Mote;
