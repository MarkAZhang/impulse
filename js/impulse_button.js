
var ImpulseButton = function(text, size, x, y, w, h, action) {
  this.init(text, size, x, y, w, h, action)
}

ImpulseButton.prototype.init = function(text, size, x, y, w, h, action) {
  this.text = text
  this.size = size
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.action = action
  this.color = 'black'
  this.active = true
}

ImpulseButton.prototype.draw = function(context) {

  context.beginPath()
  context.textAlign = 'center'
  context.font = this.size+'px Century Gothic'
  ctx.fillStyle = this.color
  ctx.fillText(this.text, this.x, this.y)
  ctx.fill()
}

ImpulseButton.prototype.onMouseMove = function(x, y) {
  if(this.active)
  {
    if(x >= this.x - this.w/2 && x <= this.x + this.w/2 && y >= this.y - this.h/2 && y <= this.y + this.h/2)
    {
      this.color = 'blue'
      this.size = 25
    }
    else
    {
      this.color = 'black'
      this.size = 20
    }
  }
}

ImpulseButton.prototype.onClick = function(x, y) {
  if(this.active)
  {
    if(x >= this.x -this.w/2 && x <= this.x + this.w/2 && y >= this.y - this.h/2 && y <= this.y + this.h/2)
    {
      this.action()
    }
  }
}

ImpulseButton.prototype.setActive = function(active) {
  this.active = active
  if(!this.active)
  {
    this.color = "gray"
  }

}
