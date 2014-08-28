var Slider = function(x, y, w, h, color) {
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.color = color
  this.active = true
  this.value = 0
  this.thumb_width = 20
  this.dragged = false
}

Slider.prototype.draw = function(context) {
  context.beginPath()
  context.strokeStyle = this.color
  context.fillStyle  = this.color
  context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  context.lineWidth = 1
  context.save();
  context.globalAlpha *= 0.75
  context.fill()
  context.restore();
  context.stroke()

  context.beginPath()

  context.rect(this.x - this.w/2 + this.w * this.value - this.thumb_width/2, this.y - this.thumb_width/2, this.thumb_width, this.thumb_width)
  context.fill()
}

Slider.prototype.on_mouse_down = function(x, y) {
  if(x > this.x - this.w/2 - this.thumb_width/2 && x < this.x + this.w/2 + this.thumb_width/2 && y > this.y - this.h/2 - this.thumb_width/2 && y < this.y + this.h/2 + this.thumb_width/2) {
    this.set_value((x - (this.x - this.w/2)) / this.w)
    this.drag = true
  }

}

Slider.prototype.set_value = function(value) {
  this.value = value
  if (this.value < 0) this.value = 0
  if (this.value > 1) this.value = 1
}


Slider.prototype.on_mouse_up = function(x,y) {
  this.onselect(this.value)
  this.drag = false
}

Slider.prototype.onselect = function(value) {
}

Slider.prototype.on_mouse_move = function(x,y) {
  if(this.drag) {
    this.set_value((x - (this.x - this.w/2)) / this.w)
  }
}

var CheckBox = function(x, y, w, h, color, toggleFunction, checked) {
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.color = color
  this.active = true
  this.checked = checked ? checked: false
  this.toggleFunction = toggleFunction
}

CheckBox.prototype.draw = function(context) {
  context.beginPath()
  context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  if(this.checked) {
    context.moveTo(this.x - this.w/2, this.y - this.h/2)
    context.lineTo(this.x + this.w/2, this.y + this.h/2)
    context.moveTo(this.x - this.w/2, this.y + this.h/2)
    context.lineTo(this.x + this.w/2, this.y - this.h/2)
  }
  context.strokeStyle = this.color
  context.lineWidth = 1
  context.stroke()
}

CheckBox.prototype.on_click = function(x, y) {
  if(x > this.x - this.w/2 && x < this.x + this.w/2 && y > this.y - this.h/2 && y < this.y + this.h/2) {
    this.checked = !this.checked
    this.toggleFunction(this.checked)
  }
}
