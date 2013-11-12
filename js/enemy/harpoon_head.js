HarpoonHead.prototype = new Enemy()

HarpoonHead.prototype.constructor = HarpoonHead

function HarpoonHead(world, x, y, id, impulse_game_state, harpoon) {
  
  if(world === undefined) return

  this.harpoon = harpoon

  this.type="harpoonhead"

  this.init(world, x, y, id, impulse_game_state)

  this.require_open = false


}

HarpoonHead.prototype.collide_with = function(other) {
  if(this.dying || this.activated)//ensures the collision effect only activates once
    return

  if(other === this.player && this.harpoon.status_duration[1] <= 0) {
    if(!this.level.is_boss_level) {
      this.impulse_game_state.reset_combo()
    }
  }
}

HarpoonHead.prototype.additional_processing = function(other) {
  this.status_duration = this.harpoon.status_duration
}

HarpoonHead.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.harpoon.silence(this.harpoon.silence_length)
}

HarpoonHead.prototype.set_heading = function(heading) {
  this.actual_heading = heading
}