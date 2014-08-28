SliderOptionButton.prototype = new ImpulseButton()

SliderOptionButton.prototype.constructor = SliderOptionButton

function SliderOptionButton(text, x, y, w, h, color, action, starting_value) {
  this.text = text;
  this.init(x, y, w, h, function(){}, false, color)
  this.slider = new Slider(this.x + this.w/2 - 20, this.y, 100, 5, this.color)
  this.slider.value = starting_value
  this.slider.onselect = action
  //this.checkbox.checked = check_verifier();

  /*this.action = function() {
    action(this.checkbox.checked);
    this.checkbox.checked = !this.checkbox.checked;
  }*/
}

SliderOptionButton.prototype.additional_draw = function(ctx) {
  ctx.save();
  if (!this.mouseOver) {
    ctx.globalAlpha *= 0.5;
  }

  ctx.textAlign = 'left'
  ctx.font = '18px Muli';
  ctx.fillStyle = this.color;
  ctx.fillText(this.text, this.x - this.w/2 + 10, this.y + 7);
  this.slider.draw(ctx)
  ctx.restore();
}

SliderOptionButton.prototype.on_mouse_down = function(x, y) {
  this.slider.on_mouse_down(x, y)
}

SliderOptionButton.prototype.on_mouse_up = function(x, y) {
  this.slider.on_mouse_up(x, y)
}

SliderOptionButton.prototype.on_mouse_move_super = ImpulseButton.prototype.on_mouse_move;

SliderOptionButton.prototype.on_mouse_move = function(x, y) {
  this.on_mouse_move_super(x, y);
  this.slider.on_mouse_move(x, y);
}