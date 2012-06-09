
var WorldButton = function(level_name, size, x, y, w, h, color, action) {
  if(!level_name) return
  this.init(level_name, size, x, y, w, h, color, action)
}

WorldButton.prototype.init = function(level_name, size, x, y, w, h, color, action) {
  this.level_name = level_name
  this.size = size
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.action = action
  this.color = color
  this.active = true
}

WorldButton.prototype.draw = function(context) {

  context.beginPath()
  context.textAlign = 'center'
  context.font = (this.hover ? 1.25 * this.size : this.size) +'px Century Gothic'
  context.fillStyle = this.active ? this.color : "gray"
  context.fillText(this.level_name, this.x, this.y)
  context.fill()
  context.strokeStyle = this.active ? this.color : "gray"
  context.beginPath()
  context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
  context.lineWidth = 2
  context.stroke()
}

WorldButton.prototype.onMouseMove = function(x, y) {
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

WorldButton.prototype.onClick = function(x, y) {
  if(this.active)
  {
    if(x >= this.x -this.w/2 && x <= this.x + this.w/2 && y >= this.y - this.h/2 && y <= this.y + this.h/2)
    {
      this.action()
    }
  }
}

WorldButton.prototype.setActive = function(active) {
  this.active = active

}
