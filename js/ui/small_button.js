SmallButton.prototype = new ImpulseButton()

SmallButton.prototype.constructor = SmallButton

function SmallButton(text, size, x, y, w, h, action) {

  this.text = text
  this.size = size
  this.real_size = size
  this.init(x, y, w, h, action, false, "black")
}

SmallButton.prototype.additional_draw = function(context) {

  context.beginPath()
  context.textAlign = 'center'
  context.font = this.hover ? (1.25 * this.size)+'px Century Gothic' : this.size+'px Century Gothic'
  ctx.fillStyle = this.hover ? "blue" : this.color
  ctx.fillText(this.text, this.x, this.y)
  ctx.fill()
}



