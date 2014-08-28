CheckboxOptionButton.prototype = new ImpulseButton()

CheckboxOptionButton.prototype.constructor = CheckboxOptionButton

function CheckboxOptionButton(text, x, y, w, h, color, action, check_verifier) {
  this.text = text;
  this.init(x, y, w, h, null, false, color)
  this.checkbox = new CheckBox(this.x + this.w/2 - 20, this.y, 20, 20, this.color);
  this.checkbox.checked = check_verifier();

  this.action = function() {
    action(this.checkbox.checked);
    this.checkbox.checked = !this.checkbox.checked;
  }
}

CheckboxOptionButton.prototype.additional_draw = function(ctx) {
  ctx.save();
  if (!this.mouseOver) {
    ctx.globalAlpha *= 0.5;
  }

  ctx.textAlign = 'left'
  ctx.font = '18px Muli';
  ctx.fillStyle = this.color;
  ctx.fillText(this.text, this.x - this.w/2 + 10, this.y + 7);
  this.checkbox.draw(ctx);
  ctx.restore();
}

