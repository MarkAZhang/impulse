Mote.prototype = new Enemy()

Mote.prototype.constructor = Mote

function Mote(world, x, y, id, impulse_game_state) {
  this.type = "mote"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

}

Mote.prototype.player_hit_proc = function() {
  this.player.silence(2000)
}

Mote.prototype.additional_processing = function(dt) {
}

Mote.prototype.process_impulse = function(attack_loc, impulse_force, hit_angle) {
	if(this.status_duration[1] > 0) {
		this.body.ApplyImpulse(new b2Vec2(impulse_force*Math.cos(hit_angle), impulse_force*Math.sin(hit_angle)),
    this.body.GetWorldCenter())
    this.open(this.open_period)
  }
}
