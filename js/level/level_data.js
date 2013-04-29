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
  buffer_radius: 1,
  cutoff_scores: [30000, 250000, 1500000],
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
  buffer_radius: 1,
  cutoff_scores: [75000, 250000, 1500000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['LEVEL 1-4'] = {
  enemies: {
              spear: [0, 3, 1, 3, 40],

           },
  dominant_enemy: "spear",
  obstacle_v: [[[0,0],[361,0],[362,213]],[[-1,88],[323,269],[0,269]],[[362,387],[361,600],[0,600]],[[0,331],[323,331],[-1,512]],[[438,213],[439,0],[800,0]],[[800,269],[477,269],[801,88]],[[800,600],[439,600],[438,387]],[[801,512],[477,331],[800,331]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700], [-100, 300], [400, -100], [900, 300], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [50000, 150000, 600000],
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 1-5'] = {
  enemies: {
              stunner: [0, 3, 1, 1.5, 40],
              tank: [0, 4, 1, 1, 20]
           },
  dominant_enemy: "tank",
  //obstacle_v: [[[150, 50], [650, 50], [650, 100], [150, 100]], [[150, 500], [650, 500], [650, 550], [150, 550]], [[50, 150], [100, 150], [100, 450], [50, 450]], [[700, 150], [750, 150], [750, 450], [700, 450]]],
  obstacle_v: [[[103,1],[688,1],[688,27],[103,27]],[[799,483],[770,483],[770,116],[799,116]],[[103,573],[688,573],[688,599],[103,599]],[[1,116],[30,116],[30,483],[1,483]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
  buffer_radius: 1,
  cutoff_scores: [75000, 400000, 1750000],
   player_loc: {x: 400, y: 300}


}

impulse_level_data['LEVEL 1-6'] = {
  enemies: {
              stunner: [0, 3, 1, 1.5, 40],
              tank: [0, 5, 1, 0.7, 20]
           },
  dominant_enemy: "tank",
  //obstacle_v: [[[150, 50], [650, 50], [650, 100], [150, 100]], [[150, 500], [650, 500], [650, 550], [150, 550]], [[50, 150], [100, 150], [100, 450], [50, 450]], [[700, 150], [750, 150], [750, 450], [700, 450]], [[200, 200], [600, 200], [600, 400], [200, 400]]],
  obstacle_v: [[[126,2],[668,2],[668,19],[126,19]],[[1,116],[19,116],[19,483],[1,483]],[[799,483],[781,483],[781,116],[799,116]],[[126,581],[668,581],[668,598],[126,598]],[[152,143],[643,143],[643,440],[152,440]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
  buffer_radius: 1,
  cutoff_scores: [90000, 500000, 2000000],
  player_loc: {x: 400, y: 510}


}

impulse_level_data['LEVEL 1-7'] = {
  enemies: {
              stunner: [0, 3, 1, 1.5, 40],
              spear: [0, 5, 1, 2, 20],
              tank: [0, 10, 1, 1, 20]
           },
  dominant_enemy: "tank",
  //obstacle_v: [[[75, 75], [362.5, 75], [362.5, 175], [75, 175]], [[437.5, 75], [725, 75], [725, 175], [437.5, 175]], [[75, 250], [362.5, 250], [362.5, 350], [75, 350]], [[437.5, 250], [725, 250], [725, 350], [437.5, 350]], [[75, 425], [362.5, 425], [362.5, 525], [75, 525]], [[437.5, 425], [725, 425], [725, 525], [437.5, 525]]],
  obstacle_v: [[[148,110],[327,110],[327,179],[148,179]],[[148,276],[327,276],[327,324],[148,324]],[[148,421],[327,421],[327,490],[148,490]],[[652,179],[473,179],[473,110],[652,110]],[[652,490],[473,490],[473,421],[652,421]],[[652,324],[473,324],[473,276],[652,276]],[[148,0],[327,0],[327,18],[148,18]],[[148,582],[327,582],[327,600],[148,600]],[[652,18],[473,18],[473,0],[652,0]],[[652,600],[473,600],[473,582],[652,582]],[[0,110],[22,110],[22,240],[0,240]],[[0,360],[22,360],[22,490],[0,490]],[[800,240],[778,240],[778,110],[800,110]],[[800,490],[778,490],[778,360],[800,360]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700], [-100, 300], [400, -100], [900, 300], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [100000, 600000, 2000000],
  player_loc: {x: 400, y: 300}

}

impulse_level_data['BOSS 1'] = {
  enemies: {
              "first boss": [0, 1, 1, 0, 1],
              stunner: [0, 5, 1, 1, 40],
              spear: [0, 8, 1, .75, 20],
              tank: [0, 12, 1, .75, 20],
           },
  dominant_enemy: "first boss",
  //obstacle_v: [[[21,25],[375,25],[375,50],[50,50],[50,275],[21,275]],[[779,275],[750,275],[750,50],[425,50],[425,25],[779,25]],[[21,325],[50,325],[50,550],[375,550],[375,576],[21,576]],[[779,576],[425,576],[425,550],[750,550],[750,325],[779,325]]],
  obstacle_v: [[[103,1],[688,1],[688,27],[103,27]],[[799,483],[770,483],[770,116],[799,116]],[[103,573],[688,573],[688,599],[103,599]],[[1,116],[30,116],[30,483],[1,483]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
  buffer_radius: 1,
  cutoff_scores: [400000, 1300000, 6500000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['LEVEL 2-1'] = {
  enemies: {
              stunner: [0, 3, 1, 1.5, 40],
              tank: [0, 10, 1, 1, 20],

              mote: [5, 6, 1, 1.5, 20]
           },
  dominant_enemy: "mote",
  obstacle_v: [[[0,0],[802,0],[802,600],[704,600],[704,85],[89,85],[89,600],[0,600]],[[256,212],[277,212],[277,286],[510,286],[510,212],[529,212],[529,600],[256,600]]],
  spawn_points: [[100, 700], [700, 700]],
  buffer_radius: 2,
  cutoff_scores: [50000, 200000, 900000],
  player_loc: {x: 400, y: 200}

}

impulse_level_data['LEVEL 2-2'] = {
  enemies: {
              stunner: [2, 3, 2, 1, 30],
              spear: [1, 5, 1, 1, 20],
              mote: [0, 5, 1, 1, 20]
           },
  dominant_enemy: "mote",
  //obstacle_v: [[[75,75],[181,75],[181,175],[75,175]],[[256,75],[362,75],[362,175],[256,175]],[[437,75],[543,75],[543,175],[437,175]],[[618,75],[725,75],[725,175],[618,175]],[[75,250],[181,250],[181,350],[75,350]],[[618,250],[725,250],[725,350],[618,350]],[[75,425],[181,425],[181,525],[75,525]],[[256,425],[362,425],[362,525],[256,525]],[[437,425],[543,425],[543,525],[437,525]],[[618,425],[725,425],[725,525],[618,525]]],
  obstacle_v: [[[0,0],[310,0],[160,83]],[[246,128],[348,69],[349,188]],[[0,93],[86,142],[0,232]],[[98,254],[169,188],[287,254]],[[160,517],[310,600],[0,600]],[[349,412],[348,531],[246,472]],[[0,368],[86,458],[0,507]],[[287,346],[169,412],[98,346]],[[640,83],[490,0],[800,0]],[[451,188],[452,69],[554,128]],[[800,232],[714,142],[800,93]],[[513,254],[631,188],[702,254]],[[800,600],[490,600],[640,517]],[[554,472],[452,531],[451,412]],[[800,507],[714,458],[800,368]],[[702,346],[631,412],[513,346]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700], [-100, 300], [400, -100], [900, 300], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [60000, 250000, 1000000],
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 2-3'] = {
  enemies: {
              stunner: [0, 4, 1, 1, 20],
              spear: [5, 3, 1, 1, 15],
              mote: [0, 8, 1, 1, 10],
              goo: [0, 5, 1, 1, 2],
           },
  dominant_enemy: "goo",
  //obstacle_v: [[[126,2],[668,2],[668,19],[126,19]],[[1,116],[19,116],[19,483],[1,483]],[[799,483],[781,483],[781,116],[799,116]],[[126,581],[668,581],[668,598],[126,598]],[[124,350],[235,365],[339,349],[326,412],[339,484],[126,484]],[[676,250],[565,235],[461,251],[474,188],[461,116],[674,116]],[[126,116],[339,116],[326,188],[339,251],[235,235],[124,250]],[[674,484],[461,484],[474,412],[461,349],[565,365],[676,350]]],
  //obstacle_v: [[[126,2],[668,2],[668,19],[126,19]],[[1,116],[19,116],[19,483],[1,483]],[[799,483],[781,483],[781,116],[799,116]],[[126,581],[668,581],[668,598],[126,598]],[[228,395],[293,456],[274,473],[211,413]],[[572,205],[507,144],[526,127],[589,187]],[[211,187],[274,127],[293,144],[228,205]],[[589,413],[526,473],[507,456],[572,395]]],
  obstacle_v: [[[0,238],[101,238],[101,338],[0,338]],[[799,340],[698,340],[698,240],[799,240]],[[565,340],[464,338],[464,238],[565,238]],[[799,100],[698,100],[698,0],[799,0]],[[1,0],[102,0],[102,100],[1,100]],[[565,101],[464,101],[464,1],[565,1]],[[235,1],[336,1],[336,101],[235,101]],[[799,600],[698,600],[698,500],[799,500]],[[1,500],[102,500],[102,600],[1,600]],[[565,599],[464,599],[464,499],[565,499]],[[235,499],[336,499],[336,599],[235,599]],[[235,238],[336,238],[336,338],[235,340]]],
  buffer_radius: 1,
  cutoff_scores: [40000, 150000, 750000],
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 2-4'] = {
  enemies: {
              spear: [0, 10, 2, 1, 20],
              tank: [0, 6, 2, 1, 25],
              goo: [0, 5, 1, 1, 3],
           },
  dominant_enemy: "goo",
  obstacle_v: [[[103,1],[688,1],[688,27],[103,27]],[[799,483],[770,483],[770,116],[799,116]],[[103,573],[688,573],[688,599],[103,599]],[[1,116],[30,116],[30,483],[1,483]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
  buffer_radius: 1,
  cutoff_scores: [80000, 500000, 2500000],
  player_loc: {x:400, y:300}

}

impulse_level_data['LEVEL 2-5'] = {
  enemies: {
              stunner: [5, 3, 2, 1, 20],
              spear: [0, 10, 1, 1, 15],
              harpoon: [0, 5, 1, 2, 20],
           },
  dominant_enemy: "harpoon",
  obstacle_v: [[[509,43],[537,43],[537,260],[509,260]],[[771,556],[744,556],[744,340],[771,340]],[[771,260],[744,260],[744,43],[771,43]],[[656,408],[629,408],[629,191],[656,191]],[[537,556],[509,556],[509,340],[537,340]],[[415,408],[388,408],[388,191],[415,191]],[[291,260],[263,260],[263,43],[291,43]],[[145,191],[172,191],[172,408],[145,408]],[[263,340],[291,340],[291,556],[263,556]],[[29,43],[56,43],[56,260],[29,260]],[[29,340],[56,340],[56,556],[29,556]]],
  buffer_radius: 1,
  cutoff_scores: [50000, 400000, 1500000],
  player_loc: {x:400, y: 450}

}

impulse_level_data['LEVEL 2-6'] = {
  enemies: {
              mote: [0, 8, 1, 1, 10],
              tank: [0, 6, 1, 1, 12],
              goo: [0, 10, 1, 1, 2],
              harpoon: [0, 4, 1, 1, 12]
           },
  dominant_enemy: "harpoon",
  //obstacle_v: [[[246,187],[301,187],[301,248],[246,248]],[[246,353],[301,353],[301,414],[246,414]],[[554,248],[499,248],[499,187],[554,187]],[[554,414],[499,414],[499,353],[554,353]],[[103,1],[688,1],[688,27],[103,27]],[[799,483],[770,483],[770,116],[799,116]],[[103,573],[688,573],[688,599],[103,599]],[[1,116],[30,116],[30,483],[1,483]]],
  obstacle_v: [[[103,1],[688,1],[688,27],[103,27]],[[799,483],[770,483],[770,116],[799,116]],[[103,573],[688,573],[688,599],[103,599]],[[1,116],[30,116],[30,483],[1,483]],[[151,347],[178,347],[178,457],[330,457],[330,483],[151,483]],[[151,117],[330,117],[330,143],[178,143],[178,253],[151,253]],[[649,483],[470,483],[470,457],[622,457],[622,347],[649,347]],[[649,253],[622,253],[622,143],[470,143],[470,117],[649,117]],[[293,286],[385,286],[385,210],[413,210],[413,286],[508,286],[508,311],[413,311],[413,392],[385,392],[385,311],[293,311]]],
  buffer_radius: 1,
  cutoff_scores: [60000, 300000, 1000000],
  player_loc: {x: 400, y: 450}

}

impulse_level_data['LEVEL 2-7'] = {
  enemies: {
              stunner: [0, 3, 2, 2, 15],
              spear: [0, 8, 2, 2, 10],
              tank: [0, 10, 2, 2, 8],
              mote: [0, 10, 1, 1, 10],
              goo: [0, 8, 1, 1, 2],
              harpoon: [0, 10, 1, 2, 10]
           },
  dominant_enemy: "harpoon",
  obstacle_v: [[[47,32],[752,32],[752,58],[48,58]],[[48,158],[328,157],[328,184],[73,184],[73,413],[328,413],[328,440],[47,440]],[[627,312],[174,312],[174,286],[627,286]],[[48,542],[752,542],[752,568],[47,568]],[[753,440],[472,440],[472,413],[727,413],[727,184],[472,184],[472,157],[752,158]]],
  spawn_points: [[-100, -100], [900, -100], [900, 700], [-100, 700]],
  buffer_radius: 1,
  cutoff_scores: [100000, 1000000, 4000000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['BOSS 2'] = {
  enemies: {
              "second boss": [0, 1, 1, 0, 1],
              stunner: [0, 18, 4, 1, 15],
              spear: [0, 18, 3, 1, 15],
              tank: [5, 18, 1, 0.5, 15],
              mote: [0, 18, 1, 1, 15],
              goo: [0, 1, 1, 0, 1],
           },
  dominant_enemy: "second boss",
  obstacle_v: [[[134,599],[50,599],[0,550],[-1,52],[50,2],[749,2],[800,49],[800,551],[750,599],[666,599],[666,552],[700,550],[750,508],[750,93],[700,49],[100,49],[50,93],[49,508],[100,550],[134,552]],[[237,550],[560,550],[560,599],[237,599]]],
  spawn_points: [[100, 700], [700, 700]],
  buffer_radius: 1,
  cutoff_scores: [100000, 1250000, 6400000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['LEVEL 3-1'] = {
  enemies: {
              spear: [0, 8, 1, 1, 15],
              tank: [0, 5, 1, 1, 15],
              disabler: [0, 10, 1, 1, 2],
              fighter: [0, 10, 1, 1, 8]

           },
  dominant_enemy: "fighter",
  obstacle_v: [[[0,356],[50,356],[49,485],[116,550],[314,550],[314,599],[0,600]],[[217,127],[586,125],[400,234]],[[583,473],[214,475],[400,366]],[[655,406],[487,298],[654,193]],[[145,194],[313,302],[146,407]],[[0,0],[314,1],[314,50],[116,50],[49,115],[50,244],[0,244]],[[800,600],[486,599],[486,550],[684,550],[751,485],[750,356],[800,356]],[[800,244],[750,244],[751,115],[684,50],[486,50],[486,1],[800,0]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [50000, 250000, 1500000],
  colored_interface: true,
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 3-2'] = {
  enemies: {

              stunner: [0, 3, 1, 1, 20],
              goo: [0, 10, 1, 0, 2],
              mote: [0, 5, 1, 2, 15],
              harpoon: [0, 8, 1, 1, 10],
              fighter: [0, 8, 1, 1, 10]

           },
  dominant_enemy: "fighter",
  obstacle_v: [[[50,1],[173,0],[108,257]],[[498,259],[436,2],[564,1]],[[364,301],[399,145],[436,301],[399,455]],[[19,147],[50,301],[19,455],[0,342],[0,266]],[[689,260],[627,0],[750,1]],[[753,600],[638,600],[689,341]],[[564,600],[436,599],[498,342]],[[236,1],[364,2],[302,259]],[[302,342],[364,599],[236,600]],[[111,341],[173,600],[50,600]],[[204,147],[236,300],[204,455],[173,301]],[[627,301],[596,455],[564,300],[596,147]],[[800,266],[800,342],[781,455],[750,301],[781,147]]],
  buffer_radius: 1,
  cutoff_scores: [40000, 300000, 1200000],
  colored_interface: true,
  player_loc: {x: 400, y: 50}

}



impulse_level_data['LEVEL 3-3'] = {
  enemies: {
              spear: [0, 4, 1, 1, 20],
              mote: [0, 5, 1, 1, 20],
              harpoon: [0, 6, 1, 1, 10],
              disabler: [0, 10, 1, 0, 1]
           },
  dominant_enemy: "disabler",
  obstacle_v: [[[0,0],[480,0],[480,40],[65,40],[64,412],[244,412],[244,600],[0,600]],[[800,600],[320,600],[320,560],[735,560],[736,188],[556,188],[556,0],[800,0]],[[134,101],[480,101],[480,188],[320,188],[320,150],[189,150],[189,259],[244,259],[244,341],[133,341]],[[666,499],[320,499],[320,412],[480,412],[480,450],[611,450],[611,341],[556,341],[556,259],[667,259]],[[320,259],[480,259],[480,341],[320,341]]],
  spawn_points: [[520, -100], [280, 700]],
  buffer_radius: 1,
  cutoff_scores: [40000, 150000, 1000000],
  player_loc: {x: 250, y:200}

}

impulse_level_data['LEVEL 3-4'] = {
  enemies: {
              tank: [0, 5, 2, 1, 30],
              harpoon: [0, 6, 1, 1, 10],
              disabler: [0, 5, 1, 1, 2]
           },
  dominant_enemy: "disabler",
  obstacle_v: [[[0,-9],[799,-9],[800,287],[395,92],[0,285]],[[1,505],[395,310],[800,505],[800,616],[1,616]],[[84,335],[344,207],[345,236],[85,365]],[[715,365],[455,236],[456,207],[716,335]]],
  spawn_points: [[-100, 385], [900, 385]],
  buffer_radius: 1,
  cutoff_scores: [60000, 400000, 2000000],
  colored_interface: true,
  player_loc: {x: 400, y: 200}


}

impulse_level_data['LEVEL 3-5'] = {
  enemies: {
             tank: [0, 5, 1, 1, 20],
             mote: [0, 5, 1, 1, 20],
             troll: [0, 3, 1, 2, 20],

           },
  dominant_enemy: "troll",
  //obstacle_v: [[[50,102],[117,102],[117,165],[50,165]],[[750,165],[683,165],[683,102],[750,102]],[[50,436],[117,436],[117,499],[50,499]],[[750,499],[683,499],[683,436],[750,436]],[[606,84],[539,84],[539,20],[606,20]],[[194,517],[261,517],[261,581],[194,581]],[[194,20],[261,20],[261,84],[194,84]],[[606,581],[539,581],[539,517],[606,517]],[[126,267],[194,267],[194,328],[126,328]],[[674,328],[606,328],[606,267],[674,267]],[[539,233],[472,233],[472,170],[539,170]],[[261,368],[328,368],[328,431],[261,431]],[[261,170],[328,170],[328,233],[261,233]],[[539,431],[472,431],[472,368],[539,368]],[[400,202],[506,302],[400,403],[295,305]],[[400,457],[448,500],[401,544],[355,501]],[[355,100],[401,57],[448,101],[400,144]]],
  obstacle_v: [[[270,341],[400,264],[535,338],[402,418]],[[22,273],[61,199],[132,385],[92,462]],[[600,561],[521,429],[586,384],[656,520]],[[104,115],[193,169],[313,142],[335,207],[178,306]],[[799,152],[709,23],[593,91],[439,69],[401,169],[359,66],[211,95],[91,19],[1,157],[1,0],[800,1]],[[622,306],[465,207],[487,142],[607,169],[696,115]],[[144,520],[214,384],[279,429],[200,561]],[[279,600],[344,473],[401,509],[455,473],[521,599]],[[0,423],[42,532],[120,600],[0,599]],[[800,599],[680,600],[758,532],[800,423]],[[708,462],[668,385],[739,199],[778,273]]],
  spawn_points: [[-100, 300], [900, 300], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [75000, 300000, 1000000],
  player_loc: {x: 400, y: 450}

}

impulse_level_data['LEVEL 3-6'] = {
  enemies: {
              stunner: [0, 3, 2, 2, 20],
              spear: [0, 8, 1, 1, 20],
              harpoon: [0, 8, 1, 1, 10],
              troll: [0, 3, 1, 2, 10]
           },
  dominant_enemy: "troll",
  //obstacle_v: [[[40,67],[85,67],[85,228],[40,228]],[[201,18],[252,18],[252,209],[201,209]],[[314,47],[489,47],[489,86],[314,86]],[[137,272],[314,272],[314,317],[137,317]],[[760,228],[715,228],[715,67],[760,67]],[[40,373],[85,373],[85,534],[40,534]],[[760,534],[715,534],[715,373],[760,373]],[[663,317],[486,317],[486,272],[663,272]],[[599,209],[548,209],[548,18],[599,18]],[[201,392],[252,392],[252,583],[201,583]],[[599,583],[548,583],[548,392],[599,392]],[[314,515],[489,515],[489,554],[314,554]],[[380,147],[429,147],[429,450],[380,450]]],
  obstacle_v: [[[0,1],[224,1],[59,55],[260,102],[59,160],[211,204],[47,259],[167,301],[47,342],[213,395],[59,440],[260,499],[54,543],[224,600],[0,598]],[[371,130],[427,130],[542,167],[430,204],[573,259],[430,301],[573,347],[427,395],[543,432],[430,467],[371,467],[265,433],[371,395],[224,346],[369,301],[227,259],[371,204],[261,167]],[[402,1],[502,30],[403,63],[297,30]],[[297,570],[403,537],[502,570],[402,599]],[[800,598],[576,600],[746,543],[540,499],[741,440],[587,395],[753,342],[633,301],[753,259],[589,204],[741,160],[540,102],[741,55],[576,1],[800,1]]],
  spawn_points: [[400, -100], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [50000, 400000, 2000000],
  player_loc: {x: 400, y: 100}

}

impulse_level_data['LEVEL 3-7'] = {
  enemies: {

              stunner: [0, 6, 1, .5, 15],
              spear: [0, 12, 1, .5, 10],
              tank: [0, 14, 1, .5, 10],
              troll: [0, 10, 1, .5, 10],
              goo: [0, 14, 1, .5, 2],
              harpoon: [0, 12, 1, .5, 6],
              mote: [0, 10, 1, .5, 10],
              disabler: [0, 12, 1, .5, 2],
              fighter: [0, 15, 1, .5, 6],

           },
  dominant_enemy: "troll",
  obstacle_v: [[[211,207],[0,207],[0,0],[800,0],[800,207],[750,207],[750,48],[639,48],[639,207],[588,207],[589,48],[48,48],[48,161],[212,161]],[[589,393],[800,393],[800,600],[0,600],[0,393],[50,393],[50,552],[161,552],[161,393],[212,393],[211,552],[752,552],[752,439],[588,439]],[[336,161],[462,161],[462,439],[336,439]]],
  spawn_points: [[-100, 300], [900, 300]],
  buffer_radius: 1,
  cutoff_scores: [60000, 300000, 1000000],
  colored_interface: true,
  player_loc: {x: 400, y: 105}

}

impulse_level_data['BOSS 3'] = {
  enemies: {
              "third boss": [0, 1, 1, 0, 1],
              stunner: [0, 6, 1, 1, 15],
              spear: [0, 10, 1, 1, 10],
              tank: [0, 12, 1, 1, 10],
              troll: [0, 8, 1, 1, 10],
              goo: [0, 12, 1, 1, 2],
              mote: [0, 8, 1, 1, 10],
              disabler: [0, 10, 1, 1, 2],
              harpoondire: [0, 15, 1, 0, 10],

           },
  dominant_enemy: "third boss",
  //obstacle_v: [[[21,25],[375,25],[375,50],[50,50],[50,275],[21,275]],[[779,275],[750,275],[750,50],[425,50],[425,25],[779,25]],[[21,325],[50,325],[50,550],[375,550],[375,576],[21,576]],[[779,576],[425,576],[425,550],[750,550],[750,325],[779,325]]],
  obstacle_v: [[[0,0],[352,0],[352,21],[23,21],[23,254],[0,254]],[[0,346],[23,346],[23,579],[352,579],[352,600],[0,600]],[[800,254],[777,254],[777,21],[448,21],[448,0],[800,0]],[[800,600],[448,600],[448,579],[777,579],[777,346],[800,346]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [100000, 1350000, 6750000],
  player_loc: {x: 400, y: 400}

}

impulse_level_data['LEVEL 4-1'] = {
  enemies: {

             goo: [2, 10, 1, 1, 1],
             mote: [0, 15, 1, 1, 5],
             disabler: [7, 10, 1, 1, 1],
             harpoon: [0, 8, 1, 1, 10],
             fighter: [0, 10, 1, 1, 12],
             slingshot: [0, 5, 1, 1, 15]

           },
  dominant_enemy: "slingshot",
  obstacle_v: [[[117,243],[117,148],[159,103],[335,102],[335,127],[176,127],[145,162],[145,243]],[[145,357],[145,438],[176,473],[335,473],[335,498],[159,497],[117,452],[117,357]],[[655,243],[655,162],[624,127],[465,127],[465,102],[641,103],[683,148],[683,243]],[[683,357],[683,452],[641,497],[465,498],[465,473],[624,473],[655,438],[655,357]],[[234,198],[335,198],[335,243],[234,243]],[[234,357],[335,357],[335,402],[234,402]],[[566,243],[465,243],[465,198],[566,198]],[[566,402],[465,402],[465,357],[566,357]],[[0,243],[0,0],[800,1],[800,243],[767,243],[767,110],[690,31],[110,31],[33,110],[34,243]],[[34,357],[33,490],[110,569],[690,569],[767,490],[767,357],[800,357],[800,599],[0,600],[0,357]]],
  spawn_points: [[-100, 300], [900, 300]],
  buffer_radius: 1,
  cutoff_scores: [60000, 500000, 2000000],
  colored_interface: true,
  player_loc: {x: 400, y: 100}

}

impulse_level_data['LEVEL 4-2'] = {
  enemies: {
             spear: [5, 8, 1, 1, 10],
             tank: [8, 8, 1, 1, 10],
             troll: [11, 8, 1, 1, 10],
             slingshot: [0, 5, 1, 1, 20]

           },
  dominant_enemy: "slingshot",
  obstacle_v: [[[-7,472],[61,471],[96,527],[61,581],[-7,581],[-41,526]],[[93,299],[59,354],[-9,354],[-44,300],[-9,244],[59,245]],[[329,74],[363,19],[431,19],[466,73],[431,129],[363,128]],[[621,466],[553,467],[518,411],[553,357],[621,357],[655,412]],[[841,526],[807,581],[739,581],[704,527],[739,471],[807,472]],[[179,135],[247,134],[282,190],[247,244],[179,244],[145,189]],[[145,412],[179,357],[247,357],[282,411],[247,467],[179,466]],[[741,245],[809,244],[844,300],[809,354],[741,354],[707,299]],[[744,20],[812,19],[847,75],[812,129],[744,129],[710,74]],[[330,303],[364,248],[432,248],[467,302],[432,358],[364,357]],[[363,473],[431,472],[466,528],[431,582],[363,582],[329,527]],[[655,189],[621,244],[553,244],[518,190],[553,134],[621,135]],[[90,74],[56,129],[-12,129],[-47,75],[-12,19],[56,20]]] ,
  buffer_radius: 1,
  cutoff_scores: [40000, 250000, 1000000],
  colored_interface: true

}

impulse_level_data['LEVEL 4-3'] = {
  enemies: {
             stunner: [0, 3, 3, 1, 40],
             tank: [0, 6, 1, 1, 20],
             mote: [0, 8, 1, 1, 20],
             orbiter: [0, 10, 2, 1, 15]
           },
  dominant_enemy: "orbiter",
  obstacle_v:[[[103,1],[688,1],[688,27],[103,27]],[[799,483],[770,483],[770,116],[799,116]],[[103,573],[688,573],[688,599],[103,599]],[[1,116],[30,116],[30,483],[1,483]],[[600,245],[545,245],[545,355],[600,355],[600,375],[524,375],[524,225],[600,225]],[[321,116],[476,116],[476,184],[455,184],[455,136],[342,136],[342,184],[321,184]],[[321,416],[342,416],[342,466],[455,466],[455,416],[476,416],[476,484],[321,484]],[[103,117],[243,117],[243,138],[126,138],[126,465],[243,465],[243,484],[103,484]],[[697,484],[557,484],[557,465],[674,465],[674,138],[557,138],[557,117],[697,117]],[[200,225],[276,225],[276,375],[200,375],[200,355],[255,355],[255,245],[200,245]]],
  spawn_points: [[-100, 700], [900, -100]],
  buffer_radius: 1,
  cutoff_scores: [60000, 300000, 1250000],
  colored_interface: true,
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 4-4'] = {
  enemies: {
            harpoon: [0, 10, 1, 1, 10],
            disabler: [0, 10, 1, 1, 1],
            goo: [7, 10, 1, 1, 1],
            troll: [0, 8, 1, 0, 1],
            orbiter: [0, 8, 2, 1, 15]
           },
  dominant_enemy: "orbiter",
  obstacle_v: [[[40,67],[85,67],[85,228],[40,228]],[[201,18],[252,18],[252,209],[201,209]],[[314,47],[489,47],[489,86],[314,86]],[[137,272],[314,272],[314,317],[137,317]],[[760,228],[715,228],[715,67],[760,67]],[[40,373],[85,373],[85,534],[40,534]],[[760,534],[715,534],[715,373],[760,373]],[[663,317],[486,317],[486,272],[663,272]],[[599,209],[548,209],[548,18],[599,18]],[[201,392],[252,392],[252,583],[201,583]],[[599,583],[548,583],[548,392],[599,392]],[[314,515],[489,515],[489,554],[314,554]],[[380,147],[429,147],[429,450],[380,450]]],
  //obstacle_v: [[[1,383],[297,600],[1,599]],[[799,599],[503,600],[799,383]],[[1,2],[297,1],[1,218]],[[799,218],[503,1],[799,2]],[[101,255],[348,75],[348,255]],[[348,346],[348,526],[101,346]],[[452,255],[452,75],[699,255]],[[699,346],[452,526],[452,346]]],
  spawn_points: [[-100, 300], [900, 300], [400, -100], [400, 700]],
  buffer_radius: 1,
  cutoff_scores: [40000, 200000, 800000],
  colored_interface: true,
  player_loc: {x: 400, y: 120}

}

impulse_level_data['LEVEL 4-5'] = {
  enemies: {
             stunner: [3, 3, 1, 2, 40],
             spear: [3, 10, 1, 1, 20],
             tank: [3, 5, 1, 1, 20],
             goo: [5, 8, 1, .5, 3],
             slingshot: [4, 8, 1, 1, 10],
             fighter: [3, 12, 1, 1, 10],
             deathray: [0, 30, 1, .4, 2]
           },
  dominant_enemy: "deathray",
  obstacle_v:[[[0,252],[0,0],[800,0],[800,253],[704,252],[704,130],[636,130],[636,212],[526,157],[526,26],[274,26],[274,157],[164,212],[164,130],[96,130],[96,253]],[[96,348],[96,471],[164,471],[164,389],[274,444],[274,575],[526,575],[526,444],[636,389],[636,471],[704,471],[704,349],[800,348],[800,600],[0,600],[0,349]],[[164,273],[274,252],[274,348],[164,328]],[[636,328],[526,348],[526,252],[636,273]],[[346,93],[454,93],[453,281],[346,281]],[[346,319],[453,319],[454,507],[346,507]]],
  spawn_points: [[-100, 300], [900, 300]],
  buffer_radius: 1,
  cutoff_scores: [50000, 200000, 1250000],
  colored_interface: true,
  player_loc: {x: 400, y: 55}

}

impulse_level_data['LEVEL 4-6'] = {
  enemies: {
             stunner: [0, 3, 1, 1, 20],
             tank: [5, 8, 1, .5, 20],
             mote: [0, 10, 1, 1, 10],
             harpoon: [4, 8, 1, .5, 10],
             disabler: [6, 12, 1, 1, 2],
             orbiter: [4, 8, 1, 1, 10],
             troll: [0, 8, 1, 0, 1],
             deathray: [0, 20, 1, .3, 3],

           },
  dominant_enemy: "deathray",
  obstacle_v:[[[800,110],[641,110],[642,77],[605,77],[605,0],[800,0]],[[0,491],[159,491],[158,524],[195,524],[195,600],[0,600]],[[0,0],[195,0],[195,77],[158,77],[159,110],[0,110]],[[800,600],[605,600],[605,524],[642,524],[641,491],[800,491]],[[515,77],[455,77],[455,110],[345,110],[345,77],[286,77],[286,0],[515,0]],[[285,524],[345,524],[345,491],[455,491],[455,524],[514,524],[514,600],[285,600]],[[0,191],[158,191],[158,254],[195,254],[195,347],[158,346],[158,410],[0,410]],[[800,410],[642,410],[642,346],[605,347],[605,254],[642,254],[642,191],[800,191]],[[345,191],[454,191],[400,240]],[[400,361],[454,410],[345,410]],[[466,300],[518,254],[518,347]],[[282,347],[282,254],[334,300]]],
  spawn_points: [[-100, 450], [-100, 150], [900, 450], [900, 150], [240, -100], [560, -100], [240, 700], [560, 700]],
  buffer_radius: 1,
  cutoff_scores: [100000, 500000, 2000000],
  colored_interface: true,
  player_loc: {x: 400, y: 300}

}

impulse_level_data['LEVEL 4-7'] = {
  enemies: {
             stunner: [0, 8, 2, 2, 10],
             spear: [0, 10, 1, 1, 6],
             tank: [0, 12, 1, 1, 5],
             mote: [0, 12, 1, 1, 10],
             goo: [0, 14, 1, 1, 2],
             harpoon: [0, 12, 1, 1, 6],
             orbiter: [0, 10, 1, 1, 5],
             disabler: [0, 12, 1, 1, 2],
             fighter: [0, 12, 1, 1, 4],
             slingshot: [0, 12, 1, 1, 4],
             troll: [0, 10, 1, 0, 1],
             deathray: [0, 20, 1, .2, 4]
           },
  dominant_enemy: "deathray",
  obstacle_v: [[[198,229],[355,295],[200,366],[172,295]],[[180,600],[134,505],[1,458],[0,600]],[[0,0],[1,143],[134,96],[180,1]],[[536,67],[445,37],[445,1],[507,2]],[[620,1],[666,96],[799,143],[800,0]],[[800,600],[799,458],[666,505],[620,600]],[[799,366],[701,406],[742,294],[710,191],[799,232]],[[264,534],[355,563],[355,600],[293,599]],[[293,2],[355,1],[355,37],[264,67]],[[507,599],[445,600],[445,563],[536,534]],[[248,154],[354,120],[355,213]],[[552,447],[446,481],[445,387]],[[445,213],[446,120],[552,154]],[[628,295],[600,366],[445,295],[602,229]],[[355,387],[354,481],[248,447]],[[1,232],[90,191],[58,294],[99,406],[1,366]]],
  spawn_points: [[-100, 420], [-100, 180], [900, 420], [900, 180], [240, -100], [560, -100], [240, 700], [560, 700]],
  buffer_radius: 1,
  cutoff_scores: [100000, 500000, 2500000],
  colored_interface: true,
  player_loc: {x: 400, y: 300}

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
              troll: [0, 0, 0, 0, 12],
              orbiter: [0, 0, 0, 0, 10],
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
  buffer_radius: 1,
  cutoff_scores: [500000, 2000000, 8000000],
  player_loc: {x: 400, y: 400}

}

for(i in impulse_level_data) {
  impulse_level_data[i].level_name = i

  // provide a get_obstacle_vertices method if none provided
  if(!(impulse_level_data.hasOwnProperty("get_obstacle_vertices"))) {
    impulse_level_data[i].get_obstacle_vertices = function (index) {
      var ob_v = this.obstacle_v

      var ans = ob_v[index]
      var ans_array = []
      for(var i = 0; i < ans.length; i++) {
        ans_array.push(new b2Vec2(ans[i][0]/draw_factor, ans[i][1]/draw_factor))
      }

      return ans_array
    };
  }
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

if(unlockall) {
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
