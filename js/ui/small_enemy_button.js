SmallEnemyButton.prototype = new ImpulseButton()

SmallEnemyButton.prototype.constructor = SmallEnemyButton

function SmallEnemyButton(enemy_name, size, x, y, w, h, color, action) {
  this.state = null
  this.enemy_name = enemy_name
  this.size = size
  this.init(x, y, w, h, action, true, color)
  this.enemy_image_size = 30

}

SmallEnemyButton.prototype.additional_draw = function(context) {
  context.save()
  context.beginPath()
  context.textAlign = 'center'
  context.fillStyle = this.color
  context.font = this.size +'px Muli'
  context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  context.globalAlpha = 0.3
  if(this.hover)
    context.globalAlpha = 0.5
  context.fill()
  context.globalAlpha = 1

  var cur_x = this.x
  var cur_y = this.y
  draw_enemy(context, this.enemy_name, cur_x, cur_y, this.enemy_image_size)

  if((impulse_enemy_stats[this.enemy_name].seen <= 3 && !impulse_enemy_stats[this.enemy_name].is_boss) ||
    (impulse_enemy_stats[this.enemy_name].kills <= 1 && impulse_enemy_stats[this.enemy_name].is_boss)) {
    context.font = "12px Muli"
    context.textAlign = "center"
    context.fillStyle = this.color
    context.fillText("NEW", this.x, this.y - this.h*5/8)

  }
  context.restore()
}
