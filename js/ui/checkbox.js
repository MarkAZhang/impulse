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
  context.lineWidth = 2
  context.stroke()
}

CheckBox.prototype.on_click = function(x, y) {
  if(x > this.x - this.w/2 && x < this.x + this.w/2 && y > this.y - this.h/2 && y < this.y + this.h/2) {
    this.checked = !this.checked
    this.toggleFunction(this.checked)
  }
}

module.exports = CheckBox;
