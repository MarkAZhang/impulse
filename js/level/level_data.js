impulse_level_data = {}

//enemy format is [start_spawn_time, spawn_period, number_of_spawn, incr_of_spawn_per_minute, cap]

impulse_level_data['SURVIVAL'] = {
  enemies: {
              stunner: [0, 3, 1, 3, 5],
              spear: [0, 1, 1, 3, 5],
              tank: [0, 1, 1, 2, 5],
              mote: [0, 1, 1, 1, 5],
              goo: [0, 1, 1, 1, 2],
              disabler: [0, 1, 1, 1, 2],
              crippler: [0, 1, 1, 1, 2],
              wisp: [0, 1, 1, 1, 5],
              fighter: [0, 1, 1, 1, 2],
              harpoon: [0, 1, 1, 1, 2],
              slingshot: [0, 1, 1, 1, 2],
              deathray: [0, 1, 1, 1, 2]
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
  },
  buffer_radius: 1

}

impulse_level_data['LEVEL 1-1'] = {
  enemies: {
              stunner: [0, 3, 1, 2, 50]
              //spear: [30, 5, 1, .75, 20],
              
           },
  obstacle_num: 2, 
  get_obstacle_vertices: function (index) {
    var ob_v = [[[100, 200], [150, 200], [300, 350], [500, 450], [100, 450]],
    [[300, 200], [400, 150], [600, 150], [700, 200], [700, 400], [600, 450], [400, 400]]]

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [100, 300, 1000]

}

impulse_level_data['LEVEL 1-2'] = {
  enemies: {
              stunner: [0, 3, 1, 2, 50],
              spear: [3, 5, 1, .75, 20],
              
           },
  obstacle_num: 2, 
  get_obstacle_vertices: function (index) {
    var ob_v = [[[100, 200], [150, 200], [300, 350], [500, 450], [100, 450]],
    [[300, 200], [400, 150], [600, 150], [700, 200], [700, 400], [600, 450], [400, 400]]]

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [100000, 300000, 1000000]

}

for(i in impulse_level_data) {
  impulse_level_data[i].level_name = i
}

var impulse_level_cutoffs = {'LEVEL 1-1': 0, 'LEVEL 1-2': 1}

for(i in impulse_level_cutoffs) {
  impulse_level_data[i].star_cutoff = impulse_level_cutoffs[i]
}

var world_cutoffs = {'WORLD 1': 0, 'WORLD 2': 16, 'WORLD 3': 32, 'WORLD 4': 48, 
  'WORLD 5': 64, 'WORLD 6': 80, 'WORLD 7': 96, 'WORLD 8': 112}
