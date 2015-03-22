var constants = require('../data/constants.js');
var objectRenderUtils = require('../render/object.js');
var renderUtils = require('../render/utils.js');
var utils = require('../core/utils.js');

var Fragment = function(shape, size, loc, velocity, color) {
  this.init(shape, size, loc, velocity, color)
}

Fragment.prototype.init = function(shape, size, loc, velocity, color) {
  this.loc = loc
  this.shape = shape
  this.size = size
  this.velocity = velocity
  this.color = color
  this.v_half_life = 500
}

Fragment.prototype.process = function(dt) {
  this.loc.x += this.velocity.x * dt/1000
  this.loc.y += this.velocity.y * dt/1000
  this.velocity.x *= Math.pow(.5, dt/this.v_half_life);
  this.velocity.y *= Math.pow(.5, dt/this.v_half_life);
}

Fragment.prototype.draw = function(context, prog) {
  if(this.shape == "multi") {
    context.save()
    context.globalAlpha *= prog
    var pointer_angle = utils.atan({x: 0, y: 0}, this.velocity)
    if(this.shape == "multi")
      objectRenderUtils.drawMultiFragment(context, this.loc.x/constants.drawFactor, this.loc.y/constants.drawFactor, pointer_angle)

    context.restore()

  } else if(this.shape == "shadow" ) {
    context.save()
    context.globalAlpha *= prog;
    renderUtils.drawSprite(context, this.loc.x,
      this.loc.y,
      0, 150 * prog,
      150 * prog, "dark_aura");
    context.restore();
  } else {
    context.save()
    var pointer_angle = utils.atan({x: 0, y: 0}, this.velocity)
    renderUtils.drawShape(context, this.loc.x, this.loc.y, this.shape, this.size, this.color, prog, pointer_angle)
    context.restore()
  }
}

module.exports = Fragment;
