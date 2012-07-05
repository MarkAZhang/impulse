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
              stunner: [0, 3, 1, 4, 40]
              
           },
  dominant_enemy: "stunner",
  obstacle_v: [[[103,345],[343,345],[343,510],[103,510]],[[700,510],[457,510],[457,345],[697,345]],[[103,90],[343,90],[343,255],[103,255]],[[700,255],[457,255],[457,90],[697,90]],[[0,90],[13,90],[13,510],[0,510]],[[800,511],[787,511],[787,90],[800,90]],[[103,0],[700,0],[700,15],[103,15]],[[103,586],[700,586],[700,600],[103,600]]], 
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
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
  cutoff_scores: [50000, 300000, 1000000],
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 1-2'] = {
  enemies: {
              stunner: [10, 3, 2, 1, 40],
              spear: [0, 5, 1, .75, 20],
              
           },
  dominant_enemy: "spear",
  //obstacle_v: [[[103,104],[343,104],[103,245]],[[103,356],[343,496],[103,496]],[[697,245],[457,104],[697,104]],[[697,496],[457,496],[697,356]]], 
  obstacle_v: [[[135,127],[355,127],[135,249]],[[135,351],[355,474],[135,474]],[[665,474],[445,474],[665,351]],[[665,249],[445,127],[665,127]],[[1,98],[30,98],[30,507],[1,507]],[[799,507],[770,507],[770,98],[799,98]],[[688,600],[112,600],[112,575],[688,575]],[[112,0],[688,0],[688,26],[112,26]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
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
  cutoff_scores: [70000, 250000, 1000000],
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 1-3'] = {
  enemies: {
              stunner: [0, 1, 1, .75, 50],
              spear: [60, 5, 1, 2, 20],
              
           },
  dominant_enemy: "stunner",
  //obstacle_v: [[[103,104],[343,104],[104,275]],[[696,275],[457,104],[697,104]],[[104,325],[343,496],[103,496]],[[697,496],[457,496],[696,325]]] , 
  obstacle_v: [[[0,0],[328,0],[0,252]],[[0,349],[328,601],[0,600]],[[800,252],[472,0],[800,0]],[[800,600],[472,601],[800,349]],[[401,252],[466,301],[401,349],[335,301]]],
  spawn_points: [[-100, 300], [400, -100], [900, 300], [400, 700]],
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
  cutoff_scores: [75000, 250000, 1500000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['LEVEL 1-4'] = {
  enemies: {
              spear: [0, 3, 1, 3, 40],
              
           },
  dominant_enemy: "spear",
  obstacle_v: [[[92,53],[362,53],[362,213]],[[51,122],[323,269],[51,269]],[[51,331],[323,331],[51,478]],[[749,269],[477,269],[749,122]],[[362,387],[362,547],[92,547]],[[438,213],[438,53],[708,53]],[[749,478],[477,331],[749,331]],[[708,547],[438,547],[438,387]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700], [-100, 300], [400, -100], [900, 300], [400, 700]],
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
  cutoff_scores: [50000, 150000, 500000],
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 1-5'] = {
  enemies: {
              stunner: [0, 3, 1, 1, 40],
              tank: [0, 5, 1, 1, 20]
           },
  dominant_enemy: "tank",
  obstacle_v: [[[150, 50], [650, 50], [650, 100], [150, 100]], [[150, 500], [650, 500], [650, 550], [150, 550]], [[50, 150], [100, 150], [100, 450], [50, 450]], [[700, 150], [750, 150], [750, 450], [700, 450]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
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
  cutoff_scores: [75000, 500000, 2000000],
   player_loc: {x: 400, y: 300}


}

impulse_level_data['LEVEL 1-6'] = {
  enemies: {
              stunner: [0, 3, 1, 1.5, 40],
              tank: [0, 5, 1, 0.7, 20]
           },
  dominant_enemy: "tank",
  obstacle_v: [[[150, 50], [650, 50], [650, 100], [150, 100]], [[150, 500], [650, 500], [650, 550], [150, 550]], [[50, 150], [100, 150], [100, 450], [50, 450]], [[700, 150], [750, 150], [750, 450], [700, 450]], [[200, 200], [600, 200], [600, 400], [200, 400]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
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
  cutoff_scores: [100000, 500000, 1500000],
  player_loc: {x: 400, y: 440}
  

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
              stunner: [0, 3, 5, 2, 50],
              spear: [60, 5, 2, 2, 30],
              tank: [120, 8, 2, 2, 20],
              "first boss": [0, 1, 1, 0, 1]
           },
  dominant_enemy: "first boss",
  //obstacle_v: [[[21,25],[375,25],[375,50],[50,50],[50,275],[21,275]],[[779,275],[750,275],[750,50],[425,50],[425,25],[779,25]],[[21,325],[50,325],[50,550],[375,550],[375,576],[21,576]],[[779,576],[425,576],[425,550],[750,550],[750,325],[779,325]]],
  obstacle_v: [[[0, 0], [375, 0], [375, 50], [50, 50], [50, 275], [0, 275]], [[425, 0], [800, 0], [800, 275], [750, 275], [750, 50], [425, 50]], [[750, 325], [800, 325], [800, 600], [425, 600], [425, 550], [750, 550]], [[0, 325], [50, 325], [50, 550], [375, 550], [375, 600], [0, 600]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
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
  cutoff_scores: [400000, 2000000, 10000000],
  player_loc: {x: 400, y: 400} 

}

impulse_level_data['LEVEL 2-1'] = {
  enemies: {
              stunner: [0, 3, 2, 3, 40],
              tank: [10, 10, 1, 3, 20],
              
              mote: [5, 6, 1, 2, 20]
           },
  dominant_enemy: "mote",
  obstacle_v: [[[87,92],[152,92],[152,461],[631,461],[631,92],[699,92],[699,528],[87,526]],[[242,92],[538,92],[538,389],[507,389],[507,315],[274,315],[274,389],[242,389]]]  ,
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
  cutoff_scores: [200000, 600000, 1500000]

}

impulse_level_data['LEVEL 2-2'] = {
  enemies: {
              stunner: [2, 3, 2, 3, 40],
              spear: [61, 3, 1, 1, 20],
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
              stunner: [5, 3, 1, 2, 50],
              spear: [60, 5, 1, 1, 30],
              goo: [0, 5, 1, .5, 8],
           },
  dominant_enemy: "goo",
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
  cutoff_scores: [300000, 700000, 1500000]

}

impulse_level_data['LEVEL 2-4'] = {
  enemies: {
              spear: [5, 3, 1, 1, 40],
              tank: [2, 5, 3, 1, 30],
              goo: [0, 5, 3, 2, 8],
           },
  dominant_enemy: "goo",
  obstacle_v: [[[150, 50], [650, 50], [650, 100], [150, 100]], [[150, 500], [650, 500], [650, 550], [150, 550]], [[50, 150], [100, 150], [100, 450], [50, 450]], [[700, 150], [750, 150], [750, 450], [700, 450]]] ,
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

impulse_level_data['LEVEL 2-5'] = {
  enemies: {
              stunner: [5, 3, 2, 1, 40],
              harpoon: [0, 5, 1, 2, 20],
           },
  dominant_enemy: "harpoon",
  obstacle_v: [[[29,44],[56,44],[56,260],[29,260]],[[29,340],[56,340],[56,557],[29,557]],[[132,44],[159,44],[159,260],[132,260]],[[132,340],[159,340],[159,557],[132,557]],[[235,44],[262,44],[262,260],[235,260]],[[235,340],[262,340],[262,557],[235,557]],[[338,44],[365,44],[365,260],[338,260]],[[338,340],[365,340],[365,557],[338,557]],[[441,44],[468,44],[468,260],[441,260]],[[441,340],[468,340],[468,557],[441,557]],[[544,44],[571,44],[571,260],[544,260]],[[544,340],[571,340],[571,557],[544,557]],[[647,44],[674,44],[674,260],[647,260]],[[647,340],[674,340],[674,557],[647,557]],[[750,44],[777,44],[777,260],[750,260]],[[750,340],[777,340],[777,557],[750,557]]],
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
  cutoff_scores: [200000, 350000, 700000]

}

impulse_level_data['LEVEL 2-6'] = {
  enemies: {
              stunner: [0, 3, 2, 2, 40],
              mote: [0, 5, 1, 1, 30],
              goo: [0, 3, 1, 1, 10],
              harpoon: [0, 8, 1, 2, 20]
           },
  dominant_enemy: "harpoon",
  obstacle_v: [[[150,50],[650,50],[650,100],[150,100]],[[150,500],[650,500],[650,550],[150,550]],[[50,150],[100,150],[100,450],[50,450]],[[700,150],[750,150],[750,450],[700,450]],[[246,187],[301,187],[301,248],[246,248]],[[246,353],[301,353],[301,414],[246,414]],[[554,248],[499,248],[499,187],[554,187]],[[554,414],[499,414],[499,353],[554,353]]] ,
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
  cutoff_scores: [100000, 500000, 1000000]

}

impulse_level_data['LEVEL 2-7'] = {
  enemies: {
              stunner: [0, 3, 2, 2, 40],
              spear: [2, 8, 2, 2, 30],
              tank: [3, 10, 2, 2, 20],
              mote: [5, 15, 1, 1, 20],
              goo: [7, 8, 1, 1, 10],
              harpoon: [12, 15, 1, 2, 15]
           },
  dominant_enemy: "harpoon",
  obstacle_v: [[[49,36],[748,36],[748,86],[49,86]],[[49,515],[748,515],[748,565],[49,565]],[[49,144],[345,145],[345,201],[105,201],[105,398],[345,398],[345,455],[49,455]],[[751,455],[455,455],[455,398],[695,398],[695,201],[455,201],[455,145],[751,144]],[[176,265],[630,265],[630,330],[176,330]]],
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
  cutoff_scores: [800000, 2000000, 5000000]

}

impulse_level_data['BOSS 2'] = {
  enemies: {
              stunner: [0, 3, 4, 2, 30],
              spear: [2, 8, 2, 1.5, 20],
              tank: [3, 10, 1, 1.5, 15],
              mote: [5, 15, 1, 1, 15],
              goo: [0, 8, 2, 1, 5],
              "second boss": [0, 1, 1, 0, 1]
           },
  dominant_enemy: "second boss",
  obstacle_v: [[[0,50],[50,2],[368,2],[368,50],[100,50],[50,93],[50,275],[0,275]],[[800,275],[750,275],[750,93],[700,50],[432,50],[432,2],[750,2],[800,50]],[[0,325],[50,325],[50,508],[100,551],[368,550],[368,599],[50,599],[0,551]],[[800,551],[750,599],[432,599],[432,550],[700,551],[750,508],[750,325],[800,325]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
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
  cutoff_scores: [400000, 1000000, 3000000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['LEVEL 3-1'] = {
  enemies: {
             tank: [10, 5, 2, 1, 20],
             wisp: [0, 3, 4, 2, 40]
           },
  dominant_enemy: "wisp",
  obstacle_v: [[[50,102],[117,102],[117,165],[50,165]],[[750,165],[683,165],[683,102],[750,102]],[[50,436],[117,436],[117,499],[50,499]],[[750,499],[683,499],[683,436],[750,436]],[[606,84],[539,84],[539,20],[606,20]],[[194,517],[261,517],[261,581],[194,581]],[[194,20],[261,20],[261,84],[194,84]],[[606,581],[539,581],[539,517],[606,517]],[[126,267],[194,267],[194,328],[126,328]],[[674,328],[606,328],[606,267],[674,267]],[[539,233],[472,233],[472,170],[539,170]],[[261,368],[328,368],[328,431],[261,431]],[[261,170],[328,170],[328,233],[261,233]],[[539,431],[472,431],[472,368],[539,368]],[[400,202],[506,302],[400,403],[295,305]],[[400,457],[448,500],[401,544],[355,501]],[[355,100],[401,57],[448,101],[400,144]]],
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
  cutoff_scores: [1500000, 4000000, 10000000]

}

impulse_level_data['LEVEL 3-2'] = {
  enemies: {
              stunner: [10, 3, 3, 2, 40],
              spear: [10, 8, 1, 2, 30],
              harpoon: [10, 8, 1, 2, 30],
              wisp: [0, 5, 1, 1, 10]
           },
  dominant_enemy: "wisp",
  obstacle_v: [[[40,67],[85,67],[85,228],[40,228]],[[201,18],[252,18],[252,209],[201,209]],[[314,47],[489,47],[489,86],[314,86]],[[137,272],[314,272],[314,317],[137,317]],[[760,228],[715,228],[715,67],[760,67]],[[40,373],[85,373],[85,534],[40,534]],[[760,534],[715,534],[715,373],[760,373]],[[663,317],[486,317],[486,272],[663,272]],[[599,209],[548,209],[548,18],[599,18]],[[201,392],[252,392],[252,583],[201,583]],[[599,583],[548,583],[548,392],[599,392]],[[314,515],[489,515],[489,554],[314,554]],[[380,147],[429,147],[429,450],[380,450]]],
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
  cutoff_scores: [300000, 750000, 2000000]

}

impulse_level_data['LEVEL 3-3'] = {
  enemies: {
              spear: [60, 8, 1, 1, 30],
              mote: [5, 5, 1, 1, 30],
              disabler: [0, 5, 2, 1, 10]
           },
  dominant_enemy: "disabler",
  obstacle_v: [[[97,87],[187,87],[187,166],[97,166]],[[97,257],[187,257],[187,340],[96,340]],[[97,435],[187,435],[187,514],[97,514]],[[275,89],[359,91],[359,165],[274,165]],[[274,257],[359,257],[359,340],[274,340]],[[275,435],[359,435],[359,514],[275,514]],[[526,340],[441,340],[441,257],[526,257]],[[525,514],[441,514],[441,435],[525,435]],[[526,165],[441,165],[441,91],[525,89]],[[703,166],[613,166],[613,87],[703,87]],[[704,340],[613,340],[613,257],[703,257]],[[703,514],[613,514],[613,435],[703,435]]]  ,
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
  cutoff_scores: [400000, 1000000, 2500000]

}

impulse_level_data['LEVEL 3-4'] = {
  enemies: {
              tank: [5, 5, 3, 1, 30],
              wisp: [10, 10, 2, 1, 20],
              disabler: [0, 5, 2, 1, 10]
           },
  dominant_enemy: "disabler",
  obstacle_v: [[[-10, -10],[810, -10],[810, 207],[-10,207]],[[-10,394],[810, 394],[810, 610],[-10, 610]]],
  spawn_points: [[-100, 300], [900, 300]],
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
  cutoff_scores: [500000, 2000000, 4000000],
  colored_interface: true

}

impulse_level_data['LEVEL 3-5'] = {
  enemies: {
              mote: [10, 5, 2, 2, 30],
              goo: [10, 10, 2, 1, 10],
              harpoon: [10, 10, 1, 1, 20],
              fighter: [0, 8, 1, 1, 20]
                
           },
  dominant_enemy: "fighter",
  obstacle_v: [[[0,0],[314,1],[314,51],[50,50],[50,244],[0,244]],[[800,244],[750,244],[750,50],[486,51],[486,1],[800,0]],[[0,357],[50,357],[50,550],[314,550],[314,600],[0,600]],[[800,600],[486,600],[486,550],[750,550],[750,357],[800,357]],[[254,138],[545,137],[397,237]],[[145,194],[286,302],[146,407]],[[654,407],[514,302],[655,194]],[[397,364],[545,464],[254,463]]]  ,
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
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
  cutoff_scores: [250000, 750000, 1500000],
  colored_interface: true

}

impulse_level_data['LEVEL 3-6'] = {
  enemies: {

              stunner: [10, 5, 3, 2, 30],
              tank: [5, 8, 2, 2, 30],
              goo: [10, 6, 2, 2, 10],
              fighter: [0, 8, 1, 1, 20]
                
           },
  dominant_enemy: "fighter",
  obstacle_v: [[[50,1],[173,0],[108,257]],[[498,259],[436,2],[564,1]],[[364,301],[399,145],[436,301],[399,455]],[[19,147],[50,301],[19,455],[0,342],[0,266]],[[689,260],[627,0],[750,1]],[[753,600],[638,600],[689,341]],[[564,600],[436,599],[498,342]],[[236,1],[364,2],[302,259]],[[302,342],[364,599],[236,600]],[[111,341],[173,600],[50,600]],[[204,147],[236,300],[204,455],[173,301]],[[627,301],[596,455],[564,300],[596,147]],[[800,266],[800,342],[781,455],[750,301],[781,147]]],
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
  cutoff_scores: [250000, 750000, 1500000],
  colored_interface: true

}

impulse_level_data['LEVEL 3-7'] = {
  enemies: {

              stunner: [0, 3, 2, 2, 15],
              spear: [1, 8, 1, 1, 10],
              tank: [2, 10, 1, 1, 10],
              mote: [3, 6, 1, 2, 10],
              goo: [4, 10, 1, 1, 5],
              harpoon: [2, 10, 1, 1, 6],
              wisp: [4, 6, 1, 1, 10],
              disabler: [8, 10, 1, 1, 5],
              fighter: [3, 15, 1, 1, 6]
                
           },
  dominant_enemy: "fighter",
  obstacle_v: [[[71,62],[281,62],[281,109],[120,109],[120,222],[282,222],[282,269],[71,269]],[[71,332],[120,332],[120,492],[227,492],[227,332],[282,332],[282,539],[71,539]],[[518,330],[729,332],[729,539],[518,539],[518,494],[680,492],[680,379],[518,379]],[[519,268],[518,62],[729,62],[729,269],[680,269],[680,109],[569,109],[569,269]],[[344,109],[457,109],[457,220],[344,220]],[[344,376],[457,376],[457,494],[344,494]]],
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
  cutoff_scores: [150000, 500000, 1000000],
  colored_interface: true

}

impulse_level_data['BOSS 3'] = {
  enemies: {
              stunner: [0, 3, 2, 1, 15],
              spear: [1, 8, 1, 1, 10],
              tank: [2, 10, 1, 1, 10],
              mote: [3, 6, 1, 1, 10],
              goo: [4, 10, 1, 1, 3],
              wisp: [4, 6, 1, 1, 10],
              disabler: [8, 10, 1, 1, 3],
              "third boss": [0, 1, 1, 0, 1]
           },
  dominant_enemy: "third boss",
  //obstacle_v: [[[21,25],[375,25],[375,50],[50,50],[50,275],[21,275]],[[779,275],[750,275],[750,50],[425,50],[425,25],[779,25]],[[21,325],[50,325],[50,550],[375,550],[375,576],[21,576]],[[779,576],[425,576],[425,550],[750,550],[750,325],[779,325]]],
  obstacle_v: [[[0, 0], [375, 0], [375, 50], [50, 50], [50, 275], [0, 275]], [[425, 0], [800, 0], [800, 275], [750, 275], [750, 50], [425, 50]], [[750, 325], [800, 325], [800, 600], [425, 600], [425, 550], [750, 550]], [[0, 325], [50, 325], [50, 550], [375, 550], [375, 600], [0, 600]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
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
  cutoff_scores: [500000, 2000000, 8000000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['LEVEL 4-1'] = {
  enemies: {
             goo: [5, 8, 1, 1, 3],
             disabler: [9, 8, 1, 1, 3],
             fighter: [15, 10, 1, 1, 15],
             slingshot: [0, 5, 2, 1, 20]
                
           },
  dominant_enemy: "slingshot",
  obstacle_v: [[[40,67],[85,67],[85,228],[40,228]],[[201,18],[252,18],[252,209],[201,209]],[[314,47],[489,47],[489,86],[314,86]],[[137,272],[314,272],[314,317],[137,317]],[[760,228],[715,228],[715,67],[760,67]],[[40,373],[85,373],[85,534],[40,534]],[[760,534],[715,534],[715,373],[760,373]],[[663,317],[486,317],[486,272],[663,272]],[[599,209],[548,209],[548,18],[599,18]],[[201,392],[252,392],[252,583],[201,583]],[[599,583],[548,583],[548,392],[599,392]],[[314,515],[489,515],[489,554],[314,554]],[[380,147],[429,147],[429,450],[380,450]]],
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
  cutoff_scores: [150000, 500000, 1000000],
  colored_interface: true

}

impulse_level_data['LEVEL 4-2'] = {
  enemies: {
             spear: [5, 8, 1, 1, 10],
             tank: [8, 8, 1, 1, 10],
             wisp: [11, 8, 1, 1, 10],
             slingshot: [0, 5, 1, 1, 20]
                
           },
  dominant_enemy: "slingshot",
  obstacle_v: [[[-7,472],[61,471],[96,527],[61,581],[-7,581],[-41,526]],[[93,299],[59,354],[-9,354],[-44,300],[-9,244],[59,245]],[[329,74],[363,19],[431,19],[466,73],[431,129],[363,128]],[[621,466],[553,467],[518,411],[553,357],[621,357],[655,412]],[[841,526],[807,581],[739,581],[704,527],[739,471],[807,472]],[[179,135],[247,134],[282,190],[247,244],[179,244],[145,189]],[[145,412],[179,357],[247,357],[282,411],[247,467],[179,466]],[[741,245],[809,244],[844,300],[809,354],[741,354],[707,299]],[[744,20],[812,19],[847,75],[812,129],[744,129],[710,74]],[[330,303],[364,248],[432,248],[467,302],[432,358],[364,357]],[[363,473],[431,472],[466,528],[431,582],[363,582],[329,527]],[[655,189],[621,244],[553,244],[518,190],[553,134],[621,135]],[[90,74],[56,129],[-12,129],[-47,75],[-12,19],[56,20]]] ,
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
  cutoff_scores: [150000, 500000, 1000000],
  colored_interface: true

}

impulse_level_data['LEVEL 4-3'] = {
  enemies: {
             stunner: [5, 3, 2, 1, 40],
             spear: [5, 8, 2, 1, 10],
             fighter: [8, 10, 1, 1, 10],
             harpoon: [8, 10, 1, 1, 10],
             crippler: [0, 20, 1, 1, 2]
           },
  dominant_enemy: "crippler",
  obstacle_v: [[[1,383],[297,600],[1,599]],[[799,599],[503,600],[799,383]],[[1,2],[297,1],[1,218]],[[799,218],[503,1],[799,2]],[[101,255],[348,75],[348,255]],[[348,346],[348,526],[101,346]],[[452,255],[452,75],[699,255]],[[699,346],[452,526],[452,346]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
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
  cutoff_scores: [100000, 300000, 750000],
  colored_interface: true

}

impulse_level_data['LEVEL 4-4'] = {
  enemies: {
             stunner: [0, 3, 2, 2, 30],
             tank: [0, 3, 1, 1, 20],
             mote: [0, 5, 1, 2, 20],
             goo: [0, 1, 1, 0, 2],
             slingshot: [0, 5, 1, 1, 10],
             crippler: [0, 1, 1, 0, 1]
           },
  dominant_enemy: "crippler",
  obstacle_v:[[[110,198],[127,198],[127,115],[271,115],[271,198],[290,198],[290,99],[110,99]],[[0,1],[702,1],[447,173],[352,173],[352,46],[50,46],[50,260],[187,260],[187,160],[209,160],[209,260],[268,260],[268,342],[0,519]],[[799,600],[110,600],[353,428],[448,428],[448,555],[750,555],[750,341],[613,341],[613,441],[591,441],[591,341],[532,341],[532,259],[799,87]],[[690,402],[673,402],[673,485],[529,485],[529,402],[510,402],[510,501],[690,501]]],
  spawn_points: [[-100, 700], [900, -100]],
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
  cutoff_scores: [300000, 1000000, 2500000],
  colored_interface: true

}

impulse_level_data['LEVEL 4-5'] = {
  enemies: {
             stunner: [3, 3, 1, 2, 40],
             spear: [3, 10, 1, 1, 20],
             goo: [5, 5, 1, .5, 6],
             wisp: [3, 5, 1, 2, 20],
             fighter: [3, 12, 1, 1, 10],
             deathray: [0, 30, 1, .4, 2]
           },
  dominant_enemy: "deathray",
  obstacle_v:[[[0,252],[0,0],[800,0],[800,253],[704,252],[704,130],[636,130],[636,212],[526,157],[526,26],[274,26],[274,157],[164,212],[164,130],[96,130],[96,253]],[[96,348],[96,471],[164,471],[164,389],[274,444],[274,575],[526,575],[526,444],[636,389],[636,471],[704,471],[704,349],[800,348],[800,600],[0,600],[0,349]],[[346,93],[454,93],[454,508],[346,508]],[[164,273],[274,252],[274,348],[164,328]],[[636,328],[526,348],[526,252],[636,273]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
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
  cutoff_scores: [500000, 2000000, 6000000],
  colored_interface: true

}

impulse_level_data['LEVEL 4-6'] = {
  enemies: {
             stunner: [0, 3, 1, 1, 20],
             tank: [5, 8, 1, .5, 20],
             harpoon: [4, 8, 1, .5, 10],
             slingshot: [4, 8, 1, 1, 10],
             crippler: [10, 20, 1, 0, 1],
             deathray: [0, 30, 1, .3, 3]
           },
  dominant_enemy: "deathray",
  obstacle_v:[[[800,110],[641,110],[642,77],[605,77],[605,0],[800,0]],[[0,491],[159,491],[158,524],[195,524],[195,600],[0,600]],[[0,0],[195,0],[195,77],[158,77],[159,110],[0,110]],[[800,600],[605,600],[605,524],[642,524],[641,491],[800,491]],[[515,77],[455,77],[455,110],[345,110],[345,77],[286,77],[286,0],[515,0]],[[285,524],[345,524],[345,491],[455,491],[455,524],[514,524],[514,600],[285,600]],[[0,191],[158,191],[158,254],[195,254],[195,347],[158,346],[158,410],[0,410]],[[800,410],[642,410],[642,346],[605,347],[605,254],[642,254],[642,191],[800,191]],[[345,191],[454,191],[400,240]],[[400,361],[454,410],[345,410]],[[466,300],[518,254],[518,347]],[[282,347],[282,254],[334,300]]],
  spawn_points: [[-100, 450], [-100, 150], [900, 450], [900, 150], [240, -100], [560, -100], [240, 700], [560, 700]],
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
  cutoff_scores: [200000, 500000, 1000000],
  colored_interface: true

}

impulse_level_data['LEVEL 4-7'] = {
  enemies: {
             stunner: [0, 6, 2, 2, 10],
             spear: [0, 8, 1, 1, 6],
             tank: [2, 12, 1, 1, 5],
             mote: [0, 12, 1, 1, 10],
             goo: [4, 14, 1, 1, 2],
             harpoon: [4, 12, 1, 1, 6],
             wisp: [0, 10, 1, 1, 5],
             disabler: [6, 12, 1, 1, 2],
             fighter: [6, 8, 1, 1, 4],
             slingshot: [0, 12, 1, 1, 4],
             crippler: [10, 30, 1, 0, 1],         
             deathray: [5, 30, 1, .2, 4]
           },
  dominant_enemy: "deathray",
  obstacle_v: [[[198,229],[355,295],[200,366],[172,295]],[[180,600],[134,505],[1,458],[0,600]],[[0,0],[1,143],[134,96],[180,1]],[[536,67],[445,37],[445,1],[507,2]],[[620,1],[666,96],[799,143],[800,0]],[[800,600],[799,458],[666,505],[620,600]],[[799,366],[701,406],[742,294],[710,191],[799,232]],[[264,534],[355,563],[355,600],[293,599]],[[293,2],[355,1],[355,37],[264,67]],[[507,599],[445,600],[445,563],[536,534]],[[248,154],[354,120],[355,213]],[[552,447],[446,481],[445,387]],[[445,213],[446,120],[552,154]],[[628,295],[600,366],[445,295],[602,229]],[[355,387],[354,481],[248,447]],[[1,232],[90,191],[58,294],[99,406],[1,366]]],
  spawn_points: [[-100, 420], [-100, 180], [900, 420], [900, 180], [240, -100], [560, -100], [240, 700], [560, 700]],
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
  cutoff_scores: [800000, 2500000, 5000000],
  colored_interface: true

}

impulse_level_data['BOSS 4'] = {
  enemies: {
              "fourth boss": [0, 1, 1, 0, 1],
              stunner: [0, 0, 0, 0, 15],
              spear: [0, 0, 0, 0, 15],
              tank: [0, 0, 0, 0, 10],
              mote: [0, 0, 0, 0, 15],
              goo: [0, 0, 0, 0, 2],
              disabler: [0, 0, 0, 0, 2],
              crippler: [0, 0, 0, 0, 1],
              wispdire: [0, 0, 0, 0, 10],
              fighterdire: [0, 0, 0, 0, 8],
              harpoondire: [0, 0, 0, 0, 12],
              slingshot: [0, 0, 0, 0, 12],
              deathraydire: [0, 0, 0, 0, 4],
           },
  dominant_enemy: "fourth boss",
  //obstacle_v: [[[21,25],[375,25],[375,50],[50,50],[50,275],[21,275]],[[779,275],[750,275],[750,50],[425,50],[425,25],[779,25]],[[21,325],[50,325],[50,550],[375,550],[375,576],[21,576]],[[779,576],[425,576],[425,550],[750,550],[750,325],[779,325]]],
  //obstacle_v: [[[800,300],[773,301],[773,26],[26,26],[26,301],[0,300],[0,0],[800,0]],[[0,301],[26,301],[26,575],[773,575],[773,301],[800,301],[800,600],[0,600]]] ,
  //obstacle_v: [[[0, 0], [375, 0], [375, 50], [50, 50], [50, 275], [0, 275]], [[425, 0], [800, 0], [800, 275], [750, 275], [750, 50], [425, 50]], [[750, 325], [800, 325], [800, 600], [425, 600], [425, 550], [750, 550]], [[0, 325], [50, 325], [50, 550], [375, 550], [375, 600], [0, 600]]],
  obstacle_v: [[[0,0],[400,0],[400,50],[50,50],[50,300],[0,300]],[[0,300],[50,300],[50,550],[400,550],[400,600],[0,600]],[[800,300],[750,300],[750,50],[400,50],[400,0],[800,0]],[[800,600],[400,600],[400,550],[750,550],[750,300],[800,300]]],
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
  cutoff_scores: [400000, 1500000, 5000000],
  player_loc: {x: 400, y: 400}

}

for(i in impulse_level_data) {
  impulse_level_data[i].level_name = i
}



var world_cutoffs = {}
var impulse_level_cutoffs = {}


var level_cutoffs = [0, 1, 3, 5, 7, 9, 11, 15]

for(var i = 0; i < 8; i++) {
  world_cutoffs['WORLD '+(i+1)] = i * 16
  for(var j = 0; j < 7; j++) {
    impulse_level_cutoffs['LEVEL '+(i+1)+'-'+(j+1)] = 16 * i + level_cutoffs[j]
  }
  impulse_level_cutoffs['BOSS '+(i+1)] = 16 * i + level_cutoffs[7]
}

if(debug) {
  world_cutoffs = {}
  impulse_level_cutoffs = {}
}

for(i in impulse_level_cutoffs) {
  if(impulse_level_data[i])
    impulse_level_data[i].star_cutoff = impulse_level_cutoffs[i]
}

var snail_polygons = [[[79, 456.5], [122, 430.5], [174, 410.5], [231, 429.5], [309, 398.5], [386, 393.5], [474, 385.5], [559, 315.5], [614, 232.5], [607, 74.5], [621, 69.5], [636, 218.5], [657, 161.5], [670, 167.5], [661, 243.5], [691, 277.5], [706, 324.5], [678, 362.5], [636, 457.5], [587, 513.5], [553, 528.5], [499, 530.5], [406, 507.5], [313, 511.5], [236, 508.5], [189, 518.5], [143, 495.5], [109, 496.5], [89, 491.5]], [[202, 97.5], [250, 67.5], [325, 67.5], [426, 96.5], [491, 164.5], [524, 231.5], [534, 269.5], [461, 325.5], [380, 345.5], [316, 341.5], [325, 266.5], [310, 193.5], [282, 138.5], [248, 108.5]], [[166, 153.5], [212, 155.5], [249, 194.5], [253, 257.5], [241, 323.5], [184, 366.5], [130, 337.5], [112, 300.5], [161, 323.5], [203, 300.5], [222, 252.5], [215, 201.5], [196, 168.5]], [[134, 201.5], [166, 187.5], [181, 214.5], [173, 247.5], [145, 265.5], [122, 239.5]]]

var solid_snail_polygons = [[[111, 442.5], [147, 420.5], [200, 397.5], [158, 337.5], [151, 245.5], [173, 167.5], [216, 108.5], [277, 70.5], [374, 60.5], [460, 95.5], [516, 161.5], [548, 240.5], [568, 303.5], [630, 222.5], [623, 62.5], [636, 61.5], [654, 211.5], [673, 148.5], [689, 157.5], [675, 237.5], [705, 271.5], [715, 289.5], [718, 317.5], [692, 350.5], [680, 369.5], [655, 438.5], [609, 501.5], [539, 520.5], [452, 499.5], [359, 494.5], [267, 493.5], [220, 506.5], [167, 484.5], [136, 484.5], [115, 476.5]]]

var other_arena = [[[103,104],[354,104],[354,197],[220,197],[220,263],[103,263]],[[697,263],[580,263],[580,197],[446,197],[446,104],[697,104]],[[103,338],[220,338],[220,404],[354,404],[354,496],[103,496]],[[697,496],[446,496],[446,404],[580,404],[580,338],[697,338]],[[354,263],[446,263],[446,338],[354,338]]]
