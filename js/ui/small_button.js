SmallButton.prototype = new ImpulseButton()

SmallButton.prototype.constructor = SmallButton

function SmallButton(text, size, x, y, w, h, color, hcolor, action) {

  this.text = text
  this.size = size
  this.real_size = size
  this.init(x, y, w, h, action, false, color)
  this.hover_color = hcolor
  this.underline = false
}

SmallButton.prototype.additional_draw = function(context) {

  context.beginPath()
  context.textAlign = 'center'
  context.shadowBlur = 5
  //context.font = this.hover ? (1.25 * this.size)+'px Century Gothic' : this.size+'px Century Gothic'
  context.font = this.size+'px Century Gothic';
  context.fillStyle = this.color;
  //context.fillStyle = this.hover ? this.hover_color : this.color
  context.shadowColor = context.fillStyle
  context.fillText(this.text, this.x, this.y)
  context.fill()
  if(this.hover || this.underline) {
    context.beginPath();
    var textWidth = context.measureText(this.text).width;
    context.moveTo(this.x - textWidth/2, this.y + this.size/4);
    context.lineTo(this.x + textWidth/2, this.y + this.size/4);
    context.strokeStyle = this.color;
    context.lineWidth = 1;
    context.stroke();
  }
  context.shadowBlur = 0
}



