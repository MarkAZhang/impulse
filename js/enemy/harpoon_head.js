var Enemy = require('../enemy/enemy.js');

HarpoonHead.prototype = new Enemy()

HarpoonHead.prototype.constructor = HarpoonHead

function HarpoonHead(world, x, y, id, impulse_game_state, harpoon) {

  if(world === undefined) return

  this.harpoon = harpoon
  if (harpoon) {
    this.status_duration = this.harpoon.status_duration
  }

  this.type="harpoonhead"

  this.init(world, x, y, id, impulse_game_state)

  this.require_open = false

  this.die_on_player_collision = false
}

HarpoonHead.prototype.additional_processing = function(other) {
}

HarpoonHead.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.harpoon.silence(this.harpoon.silence_length)
}

HarpoonHead.prototype.set_heading = function(heading) {
  this.actual_heading = heading
}

HarpoonHead.prototype.player_hit_proc = function() {}

// HarpoonHead's durations is set to Harpoon's durations so that the two will be the same color. This means we must disable things like "open"
HarpoonHead.prototype.open = function() {}

module.exports = HarpoonHead;
