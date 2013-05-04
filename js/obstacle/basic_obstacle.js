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


  context.beginPath()

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 20;
  context.shadowColor = this.color;

  context.moveTo(this.verticeSet[0].x*draw_factor, this.verticeSet[0].y*draw_factor)
  for(var i = 1; i < this.verticeSet.length; i++)
  {
    context.lineTo(this.verticeSet[i].x*draw_factor, this.verticeSet[i].y*draw_factor)
  }
  context.closePath()
  context.fillStyle = this.darkColor;
  //var vertices =
  context.strokeStyle = this.color
  context.lineWidth = 6
  context.stroke()
  context.fill()
  context.shadowBlur = 0;
}

