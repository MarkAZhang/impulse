var Level = function(id) {
  this.init(id)
}



Level.prototype.init = function(id) {
  
  this.id = id
  this.boundary_polygons = []; //the polygons that enemies use to calculate pathfinding
  this.obstacle_polygons = []; //the actual polygons that kill players and enemies
  this.obstacles = []
  this.obstacle_edges = []
  this.kills_to_win = 100
}

Level.prototype.generate_obstacles = function() {

  switch(this.id){
    case 1:
      console.log("GENERATING POLYGONS")
  //obstacles.push(new BasicObstacle(world, 30, 30, [[new b2Vec2(-10,-10), new b2Vec2(10, -10), new b2Vec2(-10, 10)], 
  //      [new b2Vec2(-30,-10), new b2Vec2(-10, -30), new b2Vec2(-10, -10)]]))
  for(var i = 0; i < 20; i++)
  {
    var x = Math.random()*canvasWidth/draw_factor
    var y =  Math.random()*canvasHeight/draw_factor
    var r1 = Math.random()*4+3
    var r2 = Math.random()*4+3
    var r3 = Math.random()*4+3
    var r4 = Math.random()*2*Math.PI
    var temp_v = [new b2Vec2(r1*Math.cos(r4+Math.PI)+x, r1*Math.sin(r4+Math.PI)+y),
          new b2Vec2(r2*Math.cos(r4+Math.PI*2/3)+x, r2*Math.sin(r4+Math.PI*2/3)+y),
          new b2Vec2(r3*Math.cos(r4+Math.PI*4/3)+x, r3*Math.sin(r4+Math.PI*4/3)+y)]
    this.obstacles.push(new BasicObstacle(temp_v))
    this.obstacle_polygons.push(temp_v)
    this.boundary_polygons.push(getBoundaryPolygon(temp_v, buffer_radius))
    
  }
  this.generate_obstacle_edges()

  }


}

Level.prototype.generate_obstacle_edges = function() {
  for(var i = 0; i < this.obstacles.length; i++)
  {
    var obstacle = this.obstacles[i]
    var k = obstacle.verticeSet.length - 1
    for(var j = 0; j < obstacle.verticeSet.length; j++)
    {
      this.obstacle_edges.push({p1: obstacle.verticeSet[k], p2: obstacle.verticeSet[j]})
      k = j
    }
  }
}

Level.prototype.getEnemyCap = function(time) {
  switch(this.id) {
    case 1:
      return Math.min(Math.floor(time), 1)
      break
  }
}

Level.prototype.getSpawnRate = function (time) {
  switch(this.id) {
    case 1:
      return Math.min(0.01+time/200*0.02, 0.03)
      break
  }
}

Level.prototype.getRandomEnemy = function(time) {
  switch(this.id) {
    case 1:
      var enemy_prob = [1, Math.max(Math.min((time-10)/100, 0.1), 0), Math.max(Math.min((time-10)/100, 0.1), 0), Math.max(Math.min((time-10)/100, 0.1),0), Math.max(Math.min((time-10)/100, 0.1), 1) ]
      index = enemy_prob.length - 1
      var choice = Math.random()
      var cumul = enemy_prob[index]
      
      while( choice > cumul)
      {
        index-=1
        cumul+=enemy_prob[index]
      }
      console.log(enemy_prob)
      console.log("RETURNING "+index +" "+choice)
      return index

      break

  }
}

Level.prototype.draw = function(context) {

  for(var i = 0; i < this.obstacles.length; i++) {
    this.obstacles[i].draw(ctx, draw_factor)
  }
  
}

Level.prototype.has_won = function (game_numbers) {
  return game_numbers.kills >= this.kills_to_win
}

Level.prototype.get_win_progress_text = function (game_numbers) {
  return "KILLS LEFT: "+(Math.max(0, this.kills_to_win - game_numbers.kills))
}
