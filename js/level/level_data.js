impulse_level_data = {}

//enemy format is [start_spawn_time, spawn_period, number_of_spawn, incr_of_spawn_per_minute, cap]

impulse_level_data['survival'] = {
  enemies: {
              stunner: [0, 3, 1, 3, 20],
              spear: [30, 5, 1, 3, 10]
           },
  obstacle_num: 20, 
  get_obstacle_vertices: function (index) {
    var x = Math.random()*canvasWidth/draw_factor
    var y = Math.random()*canvasHeight/draw_factor
    var r1 = Math.random()*4+3
    var r2 = Math.random()*4+3
    var r3 = Math.random()*4+3
    var r4 = Math.random()*2*Math.PI
    return [new b2Vec2(r1*Math.cos(r4+Math.PI * 0)+x, r1*Math.sin(r4+Math.PI* 0)+y),
          new b2Vec2(r2*Math.cos(r4+Math.PI*2/3)+x, r2*Math.sin(r4+Math.PI*2/3)+y),
          new b2Vec2(r3*Math.cos(r4+Math.PI*4/3)+x, r3*Math.sin(r4+Math.PI*4/3)+y)]
  }

}
