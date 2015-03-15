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

  context.save();
  context.beginPath()
  context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  context.globalAlpha *=  this.hover ? 1 : 0.5;
  context.fillStyle = this.color;
  context.fill();
  context.restore();
  if (this.bcolor) {
    context.strokeStyle = this.bcolor;
    context.lineWidth = 2;
    context.stroke();
  }

  var cur_x = this.x
  var cur_y = this.y
  draw_enemy(context, this.enemy_name, cur_x, cur_y, this.enemy_image_size)

  context.restore()
}

