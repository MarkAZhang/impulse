var BasicObstacle = function(vertices) {
  this.init(vertices)
}



BasicObstacle.prototype.init = function(verticeSet) {
  
  this.verticeSet = verticeSet
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
  context.globalAlpha = .8
  context.fill()
  context.globalAlpha = 1
  context.strokeStyle = 'blue'
  context.lineWidth = 3
  context.stroke()
}

