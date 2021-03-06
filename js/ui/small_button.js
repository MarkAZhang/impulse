var ImpulseButton = require('../ui/impulse_button.js');

SmallButton.prototype = new ImpulseButton()

SmallButton.prototype.constructor = SmallButton

function SmallButton(text, size, x, y, w, h, color, hcolor, action) {

  this.text = text
  this.size = size
  this.real_size = size
  this.init(x, y, w, h, action, false, color)
  this.hover_color = hcolor
  this.underline = false
  this.underline_index = null
  this.extra_text = ""
  this.shadow = false
  this.shadowColor = this.color
  this.dim_extra_text = false
}

SmallButton.prototype.additional_draw = function(context) {
  context.save()
  context.beginPath()
  context.textAlign = 'center'

  context.font = this.size+'px Open Sans';
  context.fillStyle = this.hover ? this.hover_color : this.color
  if(this.shadow) {
    context.shadowBlur = 5
    context.shadowColor = this.shadowColor
  } else {
    context.shadowBlur = 0
  }
  context.fillText(this.text, this.x, this.y)
  context.fill()
  if(this.underline_index != null && this.underline_index < this.text.length) {

    context.globalAlpha *= 0.5
    context.beginPath();
    var textStart = context.measureText(this.text.slice(0, this.underline_index)).width;
    var textEnd = context.measureText(this.text.slice(0, this.underline_index+1)).width;
    var textWidth = context.measureText(this.text).width;
    context.moveTo(this.x - textWidth/2 + textStart, this.y + this.size/4);
    context.lineTo(this.x - textWidth/2 + textEnd, this.y + this.size/4);
    context.strokeStyle = this.color;
    context.lineWidth = 1;
    context.stroke();
    context.globalAlpha /= 0.5
    if(this.extra_text != "") {

      context.globalAlpha *= 0.5
      if(this.dim_extra_text) {
        context.globalAlpha *= 0.5
      }
      context.font = this.size/2 + 'px Open Sans'
      context.fillText(this.extra_text, this.x - textWidth/2 + (textStart + textEnd)/2, this.y + 3*this.size/4)
    }
  } else {
    if(this.extra_text != "") {
      context.globalAlpha *= 0.5
      if(this.dim_extra_text) {
        context.globalAlpha *= 0.5
      }
      context.font = this.size/2 + 'px Open Sans'
      var textWidth = context.measureText(this.text).width;
      context.fillText(this.extra_text, this.x, this.y + 3*this.size/4)
    }
  }

  context.restore()
  context.shadowBlur = 0
}

module.exports = SmallButton;
