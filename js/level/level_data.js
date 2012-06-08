impulse_level_data = {}

//enemy format is [start_spawn_time, spawn_period, number_of_spawn, incr_of_spawn_per_minute, cap]

impulse_level_data['survival'] = {
  enemies: {
              stunner: [0, 3, 1, 3, 0],
              spear: [0, 1, 0, 3, 0],
              tank: [0, 1, 0, 2, 0],
              mote: [0, 1, 0, 1, 0],
              goo: [0, 1, 0, 0, 0],
              disabler: [0, 1, 0, 0, 0],
              crippler: [0, 1, 0, 0, 0],
              wisp: [0, 1, 0, 0, 0],
              fighter: [0, 1, 0, 0, 1],
              harpoon: [0, 1, 0, 0, 1],
              slingshot: [0, 1, 0, 0, 1],
              deathray: [0, 1, 1, 1, 1]
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
