
EnemyButton.prototype = new ImpulseButton()

EnemyButton.prototype.constructor = EnemyButton

function EnemyButton(enemy_name, size, x, y, w, h, color) {
  this.state = null
  this.enemy_name = enemy_name
  this.size = size
  var action = function() {set_dialog_box(new EnemyBox(this.enemy_name))}
  this.seen = imp_params.impulse_enemy_stats[this.enemy_name].seen
  this.init(x, y, w, h, action, true, color)
  this.set_active(this.seen)

  this.enemy_image_size = 30

  if (impulse_enemy_kills_star_cutoffs[this.enemy_name]) {
    this.kill_prop = Math.min(imp_params.impulse_enemy_stats[this.enemy_name].kills/impulse_enemy_kills_star_cutoffs[this.enemy_name],1)
  }
}

EnemyButton.prototype.additional_draw = function(context) {
  context.beginPath()
  context.textAlign = 'center'
  context.fillStyle = imp_params.impulse_enemy_stats[this.enemy_name].color
  context.font = this.size +'px Muli'
  if(this.seen) {
    context.fillText(this.enemy_name.toUpperCase(), this.x, this.y - this.h/2 + this.size + 5)
    if((imp_params.impulse_enemy_stats[this.enemy_name].kills < 5 && !imp_params.impulse_enemy_stats[this.enemy_name].is_boss) ||
      (imp_params.impulse_enemy_stats[this.enemy_name].kills < 1 && imp_params.impulse_enemy_stats[this.enemy_name].is_boss)) {
      context.font = "25px Muli"
      context.textAlign = "left"
      context.fillStyle = "white"
      context.fillText("NEW", this.x - this.w/2 - 10, this.y - this.h/2 + 5)
    }
    if (impulse_enemy_kills_star_cutoffs[this.enemy_name]) {
      if (this.kill_prop < 1) {
        draw_progress_bar(context, this.x, this.y + this.h * .4, this.w * 2/3, 10, this.kill_prop, imp_params.impulse_enemy_stats[this.enemy_name].color, imp_params.impulse_enemy_stats[this.enemy_name].color)
      }
      else {
        context.globalAlpha = .3
        draw_star(context, this.x, this.y + this.h * .4, 10, imp_params.impulse_enemy_stats[this.enemy_name].color)
        context.globalAlpha = 1
      }
    }

  }
  else {
    context.fillText("???", this.x, this.y - this.h/2 + this.size + 5)
  }

  var cur_x = this.x
  var cur_y = this.y + this.h * 3/32
  if(this.seen) {
    draw_enemy(context, this.enemy_name, cur_x, cur_y, this.enemy_image_size)
  }
  else {
    context.fillText("NOT SEEN", cur_x, this.y + this.h/2 - 5)
    context.font = (3 * this.size) +'px Muli'
    context.fillText("?", cur_x, cur_y + 10)
  }





}


