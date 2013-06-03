HarpoonHead.prototype = new Enemy()

HarpoonHead.prototype.constructor = HarpoonHead

function HarpoonHead(world, x, y, id, impulse_game_state, harpoon) {

  this.harpoon = harpoon

  this.type="harpoonhead"

  this.init(world, x, y, id, impulse_game_state)

  this.require_open = false

  this.additional_statuses = ["unharpoonable"]

}

HarpoonHead.prototype.collide_with = function(other) {
  if(!this.level.is_boss_level && other === this.player && this.harpoon.harpoon_state == "inactive") {
    this.impulse_game_state.reset_combo()
  }
  /*if(other === this.player){
    if(this.harpoon.harpoon_state == "inactive") {
      this.harpoon.start_death("hit_player")
      if(this.status_duration[1] <= 0) {
        var harpoon_angle = _atan(this.body.GetPosition(), this.player.body.GetPosition())
        this.player.body.ApplyImpulse(new b2Vec2(this.harpoon.harpoon_explode_force * Math.cos(harpoon_angle), this.harpoon.harpoon_explode_force * Math.sin(harpoon_angle)), this.player.body.GetWorldCenter())
      }
    }
  }*/
}

HarpoonHead.prototype.additional_processing = function(other) {
  this.status_duration = this.harpoon.status_duration
}

HarpoonHead.prototype.process_impulse_specific = function(attack_loc, impulse_force, hit_angle) {
  this.harpoon.silence(this.harpoon.stun_length)
  this.harpoon.last_stun = this.harpoon.status_duration[1]
}
