var Slider = function(x, y, w, h, color) {
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.color = color
  this.active = true
  this.value = 0
  this.thumb_width = 20
}

Slider.prototype.draw = function(context) {
  context.beginPath()
  context.strokeStyle = "gray"
  context.fillStyle  = this.color
  context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  context.lineWidth = 1
  context.fill()
  context.stroke()

  context.beginPath()

  context.rect(this.x - this.w/2 + this.w * this.value - this.thumb_width/2, this.y - this.thumb_width/2, this.thumb_width, this.thumb_width)

  context.fillStyle = "white"
  context.strokeStyle = "blue"

  context.fill()
  context.stroke()

}

Slider.prototype.on_mouse_down = function(x, y) {
  console.log("HERE")
  if(x > this.x - this.w/2 - this.thumb_width/2 && x < this.x + this.w/2 + this.thumb_width/2 && y > this.y - this.h/2 - this.thumb_width/2 && y < this.y + this.h/2 + this.thumb_width/2) {
    this.set_value((x - (this.x - this.w/2)) / this.w)
  }
  this.drag = true
}

Slider.prototype.set_value = function(value) {
  this.value = value
  if (this.value < 0) this.value = 0
  if (this.value > 1) this.value = 1
}


Slider.prototype.on_mouse_up = function(x,y) {
  this.drag = false
  this.onselect(this.value)
}

Slider.prototype.onselect = function(value) {
}

Slider.prototype.on_mouse_move = function(x,y) {
  if(this.drag) {
    this.set_value((x - (this.x - this.w/2)) / this.w)
  }


}
