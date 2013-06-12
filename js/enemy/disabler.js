Disabler.prototype = new Goo()

Disabler.prototype.constructor = Disabler

function Disabler(world, x, y, id, impulse_game_state) {
 this.type = "disabler"

  this.init(world, x, y, id, impulse_game_state)


  this.death_radius = 2
  this.life_time = 7500 //goo automatically dies after this

  this.do_yield = false

  this.type = "disabler"
  this.init(world, x, y, id, impulse_game_state)

  this.death_radius = 2

  this.goo_radius_small = 3;
  this.goo_radius_big = 9;

  this.goo_radius = this.goo_radius_small

  this.goo_change_transition = 500

  this.goo_expand_period = 4000

  this.goo_state = "small"

  this.goo_state_timer = 0

  this.default_heading = false

  this.spin_rate = 6000

  this.slow_factor = 0

}

Disabler.prototype.area_effect = function(obj) {
  obj.silence(100, true)
}

Disabler.prototype.collide_with = function(other) {
//function for colliding with the player

  if(this.dying)//ensures the collision effect only activates once
    return
  if(other === this.player) {

    this.start_death("hit_player")
    if(this.status_duration[1] <= 0) {//do not proc if silenced
      this.impulse_game_state.reset_combo()
    }
  }
}

