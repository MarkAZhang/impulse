var saveData = require('../load/save_data.js');
var utils = require('../core/utils.js');

var Goo = require('../enemy/goo.js');

Disabler.prototype = new Goo()

Disabler.prototype.constructor = Disabler

function Disabler(world, x, y, id, impulse_game_state) {
 this.type = "disabler"

  this.init(world, x, y, id, impulse_game_state)


  this.death_radius = 2

  this.do_yield = false

  this.goo_radius_small = 3;
  this.goo_radius_big = 8;

  if(saveData.difficultyMode == "easy")
    this.goo_radius_big = 8

  this.goo_radius = this.goo_radius_small

  this.goo_change_transition = 500

  this.goo_expand_period = 2500
  if(saveData.difficultyMode == "easy")
    this.goo_expand_period = 3500

  this.goo_state = "small"

  this.goo_state_timer = 0

  this.default_heading = false

  this.spin_rate = 6000

  this.slow_factor = 0

}

Disabler.prototype.check_area_of_effect = function() {
  if(!this.is_silenced() && utils.pDist(this.body.GetPosition(), this.player.body.GetPosition()) < this.goo_radius) {
    this.area_effect(this.player)
  }

  for(var j = 0; j < this.level.enemies.length; j++) {
    if(!this.is_silenced() && utils.pDist(this.body.GetPosition(), this.level.enemies[j].body.GetPosition()) < this.goo_radius)
    {
      if(this.level.enemies[j].type != this.type)
        this.area_effect(this.level.enemies[j])
    } else if(this.level.enemies[j].type == "harpoon" &&
      (utils.pDist(this.level.enemies[j].harpoon_head.body.GetPosition(), this.body.GetPosition()) < this.goo_radius ||
        (this.level.enemies[j].harpoon_state == "engaged" && utils.pDist(this.level.enemies[j].harpooned_target.body.GetPosition(), this.body.GetPosition()) < this.goo_radius))) {
      this.area_effect(this.level.enemies[j])
    }
  }
}

Disabler.prototype.area_effect = function(obj) {

  if(obj.type == "harpoonhead") {
    obj.harpoon.disable(100)
  }
  else if(obj === this.player) {
    obj.bulk(100)
    obj.silence(100)
  } else {
    obj.disable(100)
  }
}

module.exports = Disabler;
