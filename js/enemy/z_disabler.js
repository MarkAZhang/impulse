Disabler.prototype = new Goo()

Disabler.prototype.constructor = Disabler

function Disabler(world, x, y, id, impulse_game_state) {
 this.type = "disabler"

  this.init(world, x, y, id, impulse_game_state)


  this.death_radius = 2

  this.do_yield = false

  this.goo_radius_small = 3;
  this.goo_radius_big = 9;

  this.goo_radius = this.goo_radius_small

  this.goo_change_transition = 500

  this.goo_expand_period = 2500
  if(imp_vars.player_data.difficulty_mode == "easy")
    this.goo_expand_period = 3000

  this.goo_state = "small"

  this.goo_state_timer = 0

  this.default_heading = false

  this.spin_rate = 6000

  this.slow_factor = 0

}

Disabler.prototype.check_area_of_effect = function() {
  if(this.status_duration[1] <= 0 && p_dist(this.body.GetPosition(), this.player.body.GetPosition()) < this.goo_radius) {
    this.area_effect(this.player)
  }

  for(var j = 0; j < this.level.enemies.length; j++) {
    if(this.status_duration[1] <= 0 && p_dist(this.body.GetPosition(), this.level.enemies[j].body.GetPosition()) < this.goo_radius)
    {
      if(this.level.enemies[j].className != this.className)
        this.area_effect(this.level.enemies[j])
    } else if(this.level.enemies[j].type == "harpoon" &&
      (p_dist(this.level.enemies[j].harpoon_head.body.GetPosition(), this.body.GetPosition()) < this.goo_radius ||
        (this.level.enemies[j].harpoon_state == "engaged" && p_dist(this.level.enemies[j].harpooned_target.body.GetPosition(), this.body.GetPosition()) < this.goo_radius))) {
      this.area_effect(this.level.enemies[j])
    }
  }
}

Disabler.prototype.area_effect = function(obj) {
  
  if(obj.type == "harpoonhead") {
    obj.harpoon.silence(100, true)
  }
  else if(obj === this.player) {
    obj.bulk(100)
    obj.silence(100)
  } else {
    obj.silence(100, true)
  }
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

