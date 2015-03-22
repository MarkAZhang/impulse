var BasicObstacle = function(vertices, color, darkColor) {
  this.init(vertices, color, darkColor)
}

BasicObstacle.prototype.init = function(verticeSet, color, darkColor) {

  this.verticeSet = verticeSet
  this.color = color
  this.darkColor = darkColor
}

BasicObstacle.prototype.process = function() {

}

BasicObstacle.prototype.draw = function(context, draw_factor) {

  context.save();
  context.beginPath()

  context.moveTo(this.verticeSet[0].x*draw_factor, this.verticeSet[0].y*draw_factor)
  for(var i = 1; i < this.verticeSet.length; i++)
  {
    context.lineTo(this.verticeSet[i].x*draw_factor, this.verticeSet[i].y*draw_factor)
  }
  context.closePath()
  context.clip();
  context.fillStyle = this.darkColor;
  context.strokeStyle = this.color
  context.lineWidth = 6
  context.fill();
  context.stroke()
  context.restore();
  context.save();
  // The last clip doesn't seem to obey the parent clipping region.
  // This appears to be a bug.
  context.beginPath();
  context.clip();
  context.restore();
}

module.exports = BasicObstacle;
