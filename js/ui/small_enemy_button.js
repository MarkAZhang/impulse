SmallEnemyButton.prototype = new ImpulseButton()

SmallEnemyButton.prototype.constructor = SmallEnemyButton

function SmallEnemyButton(enemy_name, size, x, y, w, h, color) {
  this.state = null
  this.enemy_name = enemy_name
  this.size = size
  var action = function() {set_dialog_box(new EnemyBox(this.enemy_name))}
  this.init(x, y, w, h, action, true, color)

  this.enemy_image_size = 30

}

SmallEnemyButton.prototype.additional_draw = function(context) {
  context.beginPath()
  context.textAlign = 'center'
  context.fillStyle = this.color
  context.font = this.size +'px Muli'
  context.fill()

  var cur_x = this.x
  var cur_y = this.y
  draw_enemy(context, this.enemy_name, cur_x, cur_y, this.enemy_image_size)

  if((impulse_enemy_stats[this.enemy_name].kills < 5 && !impulse_enemy_stats[this.enemy_name].is_boss) ||
    (impulse_enemy_stats[this.enemy_name].kills < 1 && impulse_enemy_stats[this.enemy_name].is_boss)) {
    context.font = "15px Muli"
    context.textAlign = "left"
    context.fillStyle = "black"
    context.fillText("NEW", this.x - this.w/2 - 10, this.y - this.h/2 + 5)

  }

}
