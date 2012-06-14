var BasicObstacle = function(vertices, color) {
  this.init(vertices, color)
}



BasicObstacle.prototype.init = function(verticeSet, color) {
  
  this.verticeSet = verticeSet
  this.color = color
}

BasicObstacle.prototype.process = function() {

}

BasicObstacle.prototype.draw = function(context, draw_factor) {

  
  context.beginPath()
  
  context.moveTo(this.verticeSet[0].x*draw_factor, this.verticeSet[0].y*draw_factor)
  for(var i = 1; i < this.verticeSet.length; i++)
  {
    context.lineTo(this.verticeSet[i].x*draw_factor, this.verticeSet[i].y*draw_factor)
  }
  context.closePath()
  context.fillStyle = 'black';
  //var vertices = 
  context.fill()
  context.strokeStyle = this.color
  context.lineWidth = 5
  context.stroke()
}

