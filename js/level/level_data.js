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
  buffer_radius: 1,
  cutoff_scores: [100000, 300000, 1000000]
}

impulse_level_data['HOW TO PLAY 1'] = {
  enemies: {
              stunner: [0, 3, 1, 0, 0]
              
           },
  obstacle_num: 0, 
  get_obstacle_vertices: function (index) {

    return null
  },
  buffer_radius: 1,
  cutoff_scores: [1000000, 3000000, 10000000]

}

impulse_level_data['HOW TO PLAY 2']  = {
  enemies: {
              stunner: [0, 3, 1, 0, 1]
              
           },
  obstacle_num: 0, 
  get_obstacle_vertices: function (index) {

    return null
  },
  buffer_radius: 1,
  cutoff_scores: [1000000, 3000000, 10000000]

}

impulse_level_data['HOW TO PLAY 3']  = {
  enemies: {
              stunner: [0, 3, 1, 0, 1]
              
           },
  obstacle_num: 2, 
  get_obstacle_vertices: function (index) {

  var first_y = 125
  var second_y = 375

    var ob_v = [[[100, first_y], [700, first_y], [700, first_y + 50], [100, first_y + 50]], [[100, second_y], [700, second_y], [700, second_y + 50], [100, second_y + 50]]]
    

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array

  },
  buffer_radius: 1,
  cutoff_scores: [1000000, 3000000, 10000000]

}

impulse_level_data['HOW TO PLAY 4'] = impulse_level_data['HOW TO PLAY 3']
impulse_level_data['HOW TO PLAY 5'] = impulse_level_data['HOW TO PLAY 3']

impulse_level_data['LEVEL 1-1'] = {
  enemies: {
              stunner: [0, 3, 1, 4, 100]
              
           },
  dominant_enemy: "stunner",
  obstacle_v: [[[103, 104], [343, 104], [343, 275], [104, 275]], [[437, 104], [682, 104], [682, 275], [437, 275]], [[437, 345], [682, 345], [682, 510], [436, 510]], [[103, 345], [343, 345], [343, 510], [103, 510]]],
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [50000, 300000, 1000000]

}

impulse_level_data['LEVEL 1-2'] = {
  enemies: {
              stunner: [20, 3, 1, 2, 50],
              spear: [0, 5, 1, .75, 20],
              
           },
  dominant_enemy: "spear",
  obstacle_v: [[[103,104],[343,104],[104,275]],[[696,275],[457,104],[697,104]],[[104,325],[343,496],[103,496]],[[697,496],[457,496],[696,325]]] , 
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [50000, 200000, 700000]

}

impulse_level_data['LEVEL 1-3'] = {
  enemies: {
              stunner: [0, 3, 5, 5, 50],
              spear: [60, 5, 1, 2, 20],
              
           },
  dominant_enemy: "stunner",
  obstacle_v: [[[103,104],[343,104],[104,275]],[[696,275],[457,104],[697,104]],[[104,325],[343,496],[103,496]],[[697,496],[457,496],[696,325]]] , 
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [200000, 500000, 2000000]

}

impulse_level_data['LEVEL 1-4'] = {
  enemies: {
              spear: [0, 3, 1, 2, 40],
              
           },
  dominant_enemy: "spear",
  obstacle_v: [[[103,104],[343,104],[104,275]],[[696,275],[457,104],[697,104]],[[104,325],[343,496],[103,496]],[[697,496],[457,496],[696,325]],[[399,275],[458,298],[399,325],[343,298]]] , 
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [20000, 75000, 250000]

}

impulse_level_data['LEVEL 1-5'] = {
  enemies: {
              stunner: [0, 3, 1, 2, 40],
              tank: [0, 5, 1, 2, 20]
           },
  dominant_enemy: "tank",
  obstacle_v: [[[150, 50], [650, 50], [650, 100], [150, 100]], [[150, 500], [650, 500], [650, 550], [150, 550]], [[50, 150], [100, 150], [100, 450], [50, 450]], [[700, 150], [750, 150], [750, 450], [700, 450]], [[200, 200], [600, 200], [600, 400], [200, 400]]],
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [100000, 500000, 1500000]

}

impulse_level_data['LEVEL 1-6'] = {
  enemies: {
              stunner: [0, 3, 1, 2, 40],
              tank: [0, 5, 1, 3, 20]
           },
  dominant_enemy: "tank",
  obstacle_v: [[[150, 50], [650, 50], [650, 100], [150, 100]], [[150, 500], [650, 500], [650, 550], [150, 550]], [[50, 150], [100, 150], [100, 450], [50, 450]], [[700, 150], [750, 150], [750, 450], [700, 450]]],
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [500000, 2000000, 5000000]

}

impulse_level_data['LEVEL 1-7'] = {
  enemies: {
              stunner: [0, 3, 1, 2, 40],
              spear: [0, 5, 1, 3, 20],
              tank: [0, 10, 1, 3, 20]
           },
  dominant_enemy: "tank",
  obstacle_v: [[[75, 75], [362.5, 75], [362.5, 175], [75, 175]], [[437.5, 75], [725, 75], [725, 175], [437.5, 175]], [[75, 250], [362.5, 250], [362.5, 350], [75, 350]], [[437.5, 250], [725, 250], [725, 350], [437.5, 350]], [[75, 425], [362.5, 425], [362.5, 525], [75, 525]], [[437.5, 425], [725, 425], [725, 525], [437.5, 525]]],
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [200000, 500000, 2000000]

}

impulse_level_data['BOSS 1'] = {
  enemies: {
              stunner: [0, 3, 8, 2, 100],
              "first boss": [0, 1, 1, 0, 1]
           },
  dominant_enemy: "first boss",
  obstacle_v: [[[0, 0], [375, 0], [375, 50], [50, 50], [50, 275], [0, 275]], [[425, 0], [800, 0], [800, 275], [750, 275], [750, 50], [425, 50]], [[750, 325], [800, 325], [800, 600], [425, 600], [425, 550], [750, 550]], [[0, 325], [50, 325], [50, 550], [375, 550], [375, 600], [0, 600]]],
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [200000, 500000, 2000000]

}

impulse_level_data['LEVEL 2-1'] = {
  enemies: {
              stunner: [2, 3, 1, 3, 40],
              
              mote: [0, 10, 1, 2, 20]
           },
  dominant_enemy: "mote",
  obstacle_v: [[[87,91.5],[152,91.5],[152,460.5],[631,460.5],[631,91.5],[699,91.5],[699,527.5],[87,525.5]],[[242,91.5],[538,91.5],[538,388.5],[465,388.5],[465,262.5],[311,262.5],[311,388.5],[242,388.5]]] ,
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 2,
  cutoff_scores: [300000, 600000, 1000000]

}

impulse_level_data['LEVEL 2-2'] = {
  enemies: {
              stunner: [2, 3, 2, 3, 40],
              spear: [61, 3, 1, 3, 20],
              mote: [0, 5, 1, 2, 20]
           },
  dominant_enemy: "mote",
  obstacle_v: [[[75,75],[181,75],[181,175],[75,175]],[[256,75],[362,75],[362,175],[256,175]],[[437,75],[543,75],[543,175],[437,175]],[[618,75],[725,75],[725,175],[618,175]],[[75,250],[181,250],[181,350],[75,350]],[[618,250],[725,250],[725,350],[618,350]],[[75,425],[181,425],[181,525],[75,525]],[[256,425],[362,425],[362,525],[256,525]],[[437,425],[543,425],[543,525],[437,525]],[[618,425],[725,425],[725,525],[618,525]]],
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [300000, 600000, 1000000]

}

impulse_level_data['LEVEL 2-3'] = {
  enemies: {
              stunner: [5, 3, 1, 3, 50],
              spear: [60, 5, 1, 3, 30],
              goo: [0, 5, 1, 2, 8],
           },
  dominant_enemy: "mote",
  obstacle_v: [[[103,105],[268,105],[320,260],[103,219]],[[697,219],[480,260],[532,105],[697,105]],[[103,382],[320,341],[268,496],[103,496]],[[697,496],[532,496],[480,341],[697,382]]] ,
  get_obstacle_vertices: function (index) {
    var ob_v = this.obstacle_v

    var ans = ob_v[index]
    var ans_array = []
    for(var i = 0; i < ans.length; i++) {
      ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
    }

    return ans_array
  },
  buffer_radius: 1,
  cutoff_scores: [300000, 600000, 1000000]

}

for(i in impulse_level_data) {
  impulse_level_data[i].level_name = i
}

var impulse_level_cutoffs = {}//{'LEVEL 1-1': 0, 'LEVEL 1-2': 1, 'LEVEL 1-3': 3, 'LEVEL 1-4': 5, 'LEVEL 1-5': 7, 'LEVEL 1-6': 9, 'LEVEL 1-7': 11, 'BOSS 1': 15}

for(i in impulse_level_cutoffs) {
  impulse_level_data[i].star_cutoff = impulse_level_cutoffs[i]
}

var world_cutoffs = {} //{'WORLD 1': 0, 'WORLD 2': 16, 'WORLD 3': 32, 'WORLD 4': 48, 'WORLD 5': 64, 'WORLD 6': 80, 'WORLD 7': 96, 'WORLD 8': 112}



var snail_polygons = [[[79, 456.5], [122, 430.5], [174, 410.5], [231, 429.5], [309, 398.5], [386, 393.5], [474, 385.5], [559, 315.5], [614, 232.5], [607, 74.5], [621, 69.5], [636, 218.5], [657, 161.5], [670, 167.5], [661, 243.5], [691, 277.5], [706, 324.5], [678, 362.5], [636, 457.5], [587, 513.5], [553, 528.5], [499, 530.5], [406, 507.5], [313, 511.5], [236, 508.5], [189, 518.5], [143, 495.5], [109, 496.5], [89, 491.5]], [[202, 97.5], [250, 67.5], [325, 67.5], [426, 96.5], [491, 164.5], [524, 231.5], [534, 269.5], [461, 325.5], [380, 345.5], [316, 341.5], [325, 266.5], [310, 193.5], [282, 138.5], [248, 108.5]], [[166, 153.5], [212, 155.5], [249, 194.5], [253, 257.5], [241, 323.5], [184, 366.5], [130, 337.5], [112, 300.5], [161, 323.5], [203, 300.5], [222, 252.5], [215, 201.5], [196, 168.5]], [[134, 201.5], [166, 187.5], [181, 214.5], [173, 247.5], [145, 265.5], [122, 239.5]]]

var solid_snail_polygons = [[[111, 442.5], [147, 420.5], [200, 397.5], [158, 337.5], [151, 245.5], [173, 167.5], [216, 108.5], [277, 70.5], [374, 60.5], [460, 95.5], [516, 161.5], [548, 240.5], [568, 303.5], [630, 222.5], [623, 62.5], [636, 61.5], [654, 211.5], [673, 148.5], [689, 157.5], [675, 237.5], [705, 271.5], [715, 289.5], [718, 317.5], [692, 350.5], [680, 369.5], [655, 438.5], [609, 501.5], [539, 520.5], [452, 499.5], [359, 494.5], [267, 493.5], [220, 506.5], [167, 484.5], [136, 484.5], [115, 476.5]]]

var other_arena = [[[103,104],[354,104],[354,197],[220,197],[220,263],[103,263]],[[697,263],[580,263],[580,197],[446,197],[446,104],[697,104]],[[103,338],[220,338],[220,404],[354,404],[354,496],[103,496]],[[697,496],[446,496],[446,404],[580,404],[580,338],[697,338]],[[354,263],[446,263],[446,338],[354,338]]]
