var constants = require('../data/constants.js');
var uiRenderUtils = require('../render/ui.js');

var Background = function (backgroundColor, bgFile, alpha) {
  this.bgFile = bgFile;
  this.alpha = alpha;
  this.backgroundColor = backgroundColor;
  this.canvas = document.createElement('canvas');
  this.canvas.width = constants.levelWidth;
  this.canvas.height = constants.levelHeight;
  this.ctx = this.canvas.getContext('2d');
  this.render();
};

Background.prototype.render = function () {
  this.ctx.save();
  this.ctx.fillStyle = this.backgroundColor;
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.globalAlpha = this.alpha;
  if (this.bgFile) {
    uiRenderUtils.tessellateBg(this.ctx, 0, 0, constants.levelWidth, constants.levelHeight, this.bgFile)
  }
  this.ctx.restore();
}

Background.prototype.getCanvas = function() {
  return this.canvas;
}

module.exports = Background;
