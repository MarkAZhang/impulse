var ImpulseButton = require('../ui/impulse_button.js');
var Slider = require('../ui/slider.js');

SliderOptionButton.prototype = new ImpulseButton()

SliderOptionButton.prototype.constructor = SliderOptionButton

function SliderOptionButton(text, x, y, w, h, color, hcolor, action, starting_value) {
  this.text = text;
  this.init(x, y, w + 90, h, function(){}, false, color)
  this.slider_x = this.x + this.w/2 - 65;
  this.slider = new Slider(this.slider_x, this.y, 100, 5, this.color)
  this.slider.value = starting_value
  this.slider.onselect = action
  this.hcolor = hcolor;
  this.special_mode = false;
  this.special_text = 'MUTED'
}

SliderOptionButton.prototype.additional_draw = function(ctx) {
  ctx.save();

  ctx.textAlign = 'left'
  ctx.font = '18px Open Sans';
  ctx.fillStyle = this.mouseOver ? this.hcolor : this.color;
  ctx.fillText(this.text, this.x - this.w/2 + 55, this.y + 7);
  if (this.special_mode) {
    ctx.textAlign = 'center'
    ctx.fillText(this.special_text, this.slider_x, this.y + 7);
  } else {
    this.slider.draw(ctx)
  }
  ctx.restore();
}

SliderOptionButton.prototype.on_mouse_down = function(x, y) {
  if (!this.special_mode) {
    this.slider.on_mouse_down(x, y)
  }
}

SliderOptionButton.prototype.on_mouse_up = function(x, y) {
  if (!this.special_mode) {
    this.slider.on_mouse_up(x, y)
  }
}

SliderOptionButton.prototype.on_mouse_move_super = ImpulseButton.prototype.on_mouse_move;

SliderOptionButton.prototype.on_mouse_move = function(x, y) {
  this.on_mouse_move_super(x, y);
  if (!this.special_mode) {
    this.slider.on_mouse_move(x, y);
  }
}

module.exports = SliderOptionButton;
