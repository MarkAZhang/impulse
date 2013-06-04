var ImpulseButton = function() {

}

ImpulseButton.prototype.init = function(x, y, w, h, action, border, color) {
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.action = action
  this.active = true
  this.border = border
  this.color = color
  this.hover = false
}

ImpulseButton.prototype.draw = function(context) {
  if(this.border) {
    context.beginPath()
    context.strokeStyle = this.active ? this.color : "gray"
    context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
    context.lineWidth = 2
    context.stroke()
  }
  this.additional_draw(context)
}
ImpulseButton.prototype.additional_draw = function(context) {}

ImpulseButton.prototype.on_mouse_move = function(x,y) {
  if(this.active)
  {
    if(x >= this.x - this.w/2 && x <= this.x + this.w/2 && y >= this.y - this.h/2 && y <= this.y + this.h/2)
    {
      this.hover = true
    }
    else
    {
      this.hover = false
    }
  }
}

ImpulseButton.prototype.on_click = function(x,y) {
  if(this.active)
  {
    if(x >= this.x -this.w/2 && x <= this.x + this.w/2 && y >= this.y - this.h/2 && y <= this.y + this.h/2)
    {
      this.action()
    }
  }
}

ImpulseButton.prototype.set_active = function(active) {
  this.active = active
  if(!this.active) this.color = "gray"
}

