var CheckBox = require('../ui/checkbox.js');
var ImpulseButton = require('../ui/impulse_button.js');

CheckboxOptionButton.prototype = new ImpulseButton()

CheckboxOptionButton.prototype.constructor = CheckboxOptionButton

function CheckboxOptionButton(text, x, y, w, h, color, hcolor, action, check_verifier) {
  this.text = text;
  this.init(x, y, w, h, null, false, color)
  this.hcolor = hcolor
  this.checkbox = new CheckBox(this.x + this.w/2 - 20, this.y, 20, 20, this.color);
  this.checkbox.checked = check_verifier();
  this.change_checkbox_on_click = true;

  this.action = function() {
    action(this.checkbox.checked);
    if (this.change_checkbox_on_click) {
      this.checkbox.checked = !this.checkbox.checked;
    }
  }
}

CheckboxOptionButton.prototype.additional_draw = function(ctx) {
  ctx.save();
  if (!this.mouseOver) {
    ctx.globalAlpha *= 0.5;
  }

  ctx.textAlign = 'left'
  ctx.font = '18px Open Sans';
  ctx.fillStyle = this.mouseOver ? this.hcolor : this.color;
  ctx.fillText(this.text, this.x - this.w/2 + 10, this.y + 7);
  this.checkbox.color = this.mouseOver ? this.hcolor : this.color;
  this.checkbox.draw(ctx);
  ctx.restore();
}

module.exports = CheckboxOptionButton;
