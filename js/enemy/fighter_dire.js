FighterDire.prototype = new Fighter()

FighterDire.prototype.constructor = FighterDire

function FighterDire(world, x, y, id, impulse_game_state) {
  this.type = "fighterdire"

  this.init(world, x, y, id, impulse_game_state)

  this.special_mode = false

  this.death_radius = 5

  this.shoot_interval = 750

  this.shoot_duration = this.shoot_interval

  this.do_yield = false

  this.safe_radius = 15

  this.safe_radius_buffer = 2

  this.safe_lines = [{x: -5, y: -5}, {x: -5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: -5}]

  this.bullet_alternater = 0

  this.safe = true

}

FighterDire.prototype.get_target_point = function() {
  if(!this.safe) {

    var best_dir = _atan(this.player.body.GetPosition(), this.body.GetPosition())

    var mods = [0, Math.PI/4, -Math.PI/4, Math.PI/2, -Math.PI/2, 3*Math.PI/4, -3*Math.PI/4, Math.PI]

    for(var i = 0; i < mods.length; i++) {
      var temp_pt = {x: this.body.GetPosition().x + 10 * Math.cos(best_dir + mods[i]), y: this.body.GetPosition().y + 10 * Math.sin(best_dir + mods[i])}
     if(isVisible(temp_pt, this.body.GetPosition(), this.level.obstacle_edges)) {
        return temp_pt
     }
   }
    return null
  }
  else
    return this.player.body.GetPosition()
}
