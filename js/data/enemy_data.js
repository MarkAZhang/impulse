var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');

var enemyData = {};

enemyData["dumb_stunner"] = {
  color: "#00ffff",///"#999",
  density: 2.2,
  lin_damp: 6,
  effective_radius: .5,
  force: 0, // does not move
  score_value: 100,
  attack_rating: 1,
  batch_enemy_image: true,
  true_name: "stunner",
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
    [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]]}],
  draw_polygons: [{type: "polygon", x: -0.1, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
    [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]]}],
  enemy_info: [
    "On collision, stuns you for a short period",
  ],
  snippet: "stuns on collision",
}

enemyData["stunner"] = {
  color: "#00ffff",///"#999",
  density: 1.5,
  lin_damp: 4,
  effective_radius: .5,
  force: .42,
  score_value: 100,
  attack_rating: 1,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
    [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]]}],
  draw_polygons: [{type: "polygon", x: -0.1, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
    [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]]}],
  enemy_info: [
    "On collision, stuns you for a short period",
  ],
  true_name: "shocker",
  snippet: "stuns on collision",
}

enemyData["spear"] = {
  color: "#f86003",
  density: 0.7,
  lin_damp: 4,
  effective_radius: .7,
  force: .24,
  score_value: 500,
  attack_rating: 7,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .7, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 5/6), Math.sin(Math.PI * 5/6)],
    [Math.cos(Math.PI * 7/6), Math.sin(Math.PI * 7/6)]]}],
  enemy_info: [
    "Will dive at you if it has line of sight",
  ],
  snippet: "charges on sight",
}

enemyData["tank"] = {
  color: "#6f27cf",
  density: 2.5,
  lin_damp: 3,
  effective_radius: 1,
  force: 1.5,
  score_value: 1000,
  attack_rating: 8,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}],
  extra_rendering_lines: [{"x1": 0.5, "y1": 0.5, "x2": -0.5, "y2": -0.5},
    {"x1": 0.5, "y1": -0.5, "x2": -0.5, "y2": 0.5},
  ],
  enemy_info: [
    "Explodes on death or collision with player",
    "Will explode on collision with another Tank if recently Impulsed",
    "The explosion radius is outlined around the tank",
  ],
  snippet: "explodes on death",
}

enemyData["mote"] = {
  color: "#ee42ae",
  density: .5,
  lin_damp: 3,
  effective_radius: .5,
  force: .15,
  score_value: 1000,
  attack_rating: .5,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}],
  enemy_info: [
    "Cannot be Impulsed # # On collision, disarms you for a few moments",
    "Other enemies can be impulsed into the mote"
  ],
  snippet: "unaffected by impulse",
}

enemyData["goo"] = {
  color: "#e6c43c",
  density: 7,
  lin_damp: 9,
  effective_radius: .5,
  force: 3.5,
  score_value: 3000,
  attack_rating: .25,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}],
  extra_rendering_polygons: [{type: "circle", x: 0, y: 0, r: 1.3, colored: true}],
  enemy_info: [
    "All units within its radius are slowed",
    "When Impulsed, expands its radius for a few moments",
  ],
  snippet: "slows all nearby units",
}

enemyData["harpoon"] = {
  color: "#00aa00",
  density: 4.5,
  lin_damp: 6,
  effective_radius: 0.7,
  force: 4.5,
  score_value: 5000,
  attack_rating: 6,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .7, vertices:
  [[Math.cos(Math.PI * 1/4) - 0.4, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 7/8) - 0.4, Math.sin(Math.PI * 7/8)],
  [Math.cos(Math.PI * 9/8) - 0.4, Math.sin(Math.PI * 9/8)],
  [Math.cos(Math.PI * 7/4) - 0.4, Math.sin(Math.PI * 7/4)],
  ]}],
  extra_rendering_polygons: [{type: "polygon", x: -0.1, y: 0, r: .7, colored: false, vertices:
  [[Math.cos(Math.PI * 7/4) - 0.4, Math.sin(Math.PI * 7/4)],
  [((Math.sqrt(2)+Math.sqrt(6))/2 - 0.4)*Math.cos(Math.PI * 0), Math.sin(Math.PI * 0)],
  [Math.cos(Math.PI * 1/4)  - 0.4, Math.sin(Math.PI * 1/4)]]},
    {type: "polygon", x: -0.1, y: 0, r: .7, vertices:
  [[Math.cos(Math.PI * 1/4) - 0.4, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 7/8) - 0.4, Math.sin(Math.PI * 7/8)],
  [Math.cos(Math.PI * 9/8) - 0.4, Math.sin(Math.PI * 9/8)],
  [Math.cos(Math.PI * 7/4) - 0.4, Math.sin(Math.PI * 7/4)],
  ]}],
  draw_polygons: [],
  enemy_info: [
    "Fires its hook at you and # attempts to yank you in # # Can only fire through the void",
    "The hook range is outlined # around the Harpoon",
    "If you are hooked, # impulse the harpoon to get free",
    "While the hook is detached from the Harpoon, it cannot move",
    "During boss battles, will fire at any time",
  ],
  snippet: "hooks through walls",
}

enemyData["harpoonhead"] = {
  color: "#00dd00",
  density: 1.2,
  lin_damp: 6,
  effective_radius: enemyData["harpoon"].effective_radius * Math.sqrt(6)/3,
  force: 1.5,
  score_value: 1000,
  attack_rating: 6,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: enemyData["harpoon"].effective_radius * Math.sqrt(6)/3, vertices:
  [[Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 0), Math.sin(Math.PI * 0)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)]]
  }],
}

enemyData["fighter"] = {
  color: "#0000ff",
  density: 3,
  lin_damp: 6,
  effective_radius: 0.75,
  force: 2.5,
  score_value: 7500,
  attack_rating: 9,
  true_name: "hunter",
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 0.75, vertices:
  [[Math.cos(Math.PI * 1/4) + 0.3, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4) + 0.3, Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4) + 0.3, Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4) + 0.3, Math.sin(Math.PI * 7/4)]]},
  {type: "polygon", x: 0, y: 0, r: 0.75, vertices:
  [[Math.cos(Math.PI * 3/4)  + 0.3, Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 1/4)  + 0.3, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4) - Math.sqrt(6)/4  + 0.3, Math.sqrt(2)]]},
  {type: "polygon", x: 0, y: 0, r: 0.75, vertices:
  [[Math.cos(Math.PI * 7/4)  + 0.3, Math.sin(Math.PI * 7/4)],
  [Math.cos(Math.PI * 5/4)  + 0.3, Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 3/4) - Math.sqrt(6)/4  + 0.3, -Math.sqrt(2)]]}
  ],
  enemy_info: [
    "Fires projectiles at you on sight # # Is weak to its own projectiles",
    "When its rage meter is full, # the hunter moves faster and its bullets cannot be impulsed",
    "Impulse the hunter to lower its rage meter"
  ],
  snippet: "weak to projectiles",
}

enemyData["fighter_bullet"] = {
  color: "#0000ec",
  density: 1,
  lin_damp: 3,
  effective_radius: .3,
  force: 0.5,
  score_value: 0,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],
}

enemyData["piercing_fighter_bullet"] = {
  color: "#ff0000",
  density: 1,
  lin_damp: 3,
  effective_radius: .3,
  force: 1,
  score_value: 0,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],
}


enemyData["disabler"] = {
  color: "#cccccc",
  density: 8,
  lin_damp: 9,
  effective_radius: .5,
  force: 5,
  score_value: 5000,
  attack_rating: .25,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/3), Math.sin(Math.PI * 1/3)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 3/3), Math.sin(Math.PI * 3/3)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 5/3), Math.sin(Math.PI * 5/3)]]}
    ],
  extra_rendering_polygons: [{type: "circle", x: 0, y: 0, r: 1.3, colored: true}],
  enemy_info: [
    "Disables all units within its radius. # # Touching disabled units will not reset your multiplier.",
    "When Impulsed, expands its radius for a few moments",
  ],
  true_name: "equalizer",
  snippet: "disables all nearby units",
}

enemyData["troll"] = {
  color: "#159d31",
  density: 1.2,
  lin_damp: 3,
  effective_radius: 0.7,
  force: 0.38,
  score_value: 4000,
  attack_rating: 2,
  true_name: "pinwheel",
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices:
  [[0, 0],
  [0.25 * Math.cos(Math.PI * 5/3), 0.25 * Math.sin(Math.PI * 5/3)],
  [Math.sqrt(52)/8 * Math.cos(-0.408), Math.sqrt(52)/8 * Math.sin(-0.408)],
  [0.25 * Math.cos(Math.PI * 1/3), 0.25 * Math.sin(Math.PI * 1/3)]]},
  {type: "polygon", x: 0, y: 0, r: 1, vertices:
  [[0, 0],
  [0.25 * Math.cos(Math.PI * 1/3), 0.25 * Math.sin(Math.PI * 1/3)],
  [Math.sqrt(52)/8 * Math.cos(-0.408 + Math.PI*2/3), Math.sqrt(52)/8 * Math.sin(-0.408 + Math.PI*2/3)],
  [0.25 * Math.cos(Math.PI * 3/3), 0.25 * Math.sin(Math.PI * 3/3)]]},
  {type: "polygon", x: 0, y: 0, r: 1, vertices:
  [[0, 0],
  [0.25 * Math.cos(Math.PI * 3/3), 0.25 * Math.sin(Math.PI * 3/3)],
  [Math.sqrt(52)/8 * Math.cos(-0.408 + Math.PI*4/3), Math.sqrt(52)/8 * Math.sin(-0.408 + Math.PI*4/3)],
  [0.25 * Math.cos(Math.PI * 5/3), 0.25 * Math.sin(Math.PI * 5/3)]]},
  ],
  draw_polygons: [{type: "polygon", x: -0.2, y: 0, r: 1, vertices:
  [[0, 0],
  [0.25 * Math.cos(Math.PI * 5/3 + 0.36), 0.25 * Math.sin(Math.PI * 5/3+ 0.36)],
  [Math.sqrt(52)/8 * Math.cos(-0.408+ 0.36), Math.sqrt(52)/8 * Math.sin(-0.408+ 0.36)],
  [0.25 * Math.cos(Math.PI * 1/3+ 0.36), 0.25 * Math.sin(Math.PI * 1/3+ 0.36)]]},
  {type: "polygon", x: -0.2, y: 0, r: 1, vertices:
  [[0, 0],
  [0.25 * Math.cos(Math.PI * 1/3+ 0.36), 0.25 * Math.sin(Math.PI * 1/3+ 0.36)],
  [Math.sqrt(52)/8 * Math.cos(-0.408 + Math.PI*2/3+ 0.36), Math.sqrt(52)/8 * Math.sin(-0.408 + Math.PI*2/3+ 0.36)],
  [0.25 * Math.cos(Math.PI * 3/3+ 0.36), 0.25 * Math.sin(Math.PI * 3/3+ 0.36)]]},
  {type: "polygon", x: -0.2, y: 0, r: 1, vertices:
  [[0, 0],
  [0.25 * Math.cos(Math.PI * 3/3+ 0.36), 0.25 * Math.sin(Math.PI * 3/3+ 0.36)],
  [Math.sqrt(52)/8 * Math.cos(-0.408 + Math.PI*4/3+ 0.36), Math.sqrt(52)/8 * Math.sin(-0.408 + Math.PI*4/3+ 0.36)],
  [0.25 * Math.cos(Math.PI * 5/3+ 0.22), 0.25 * Math.sin(Math.PI * 5/3+ 0.22)]]},
  ],
  enemy_info: [
    "On collision or if impulsed while spinning, # reverses your controls",
  ],
  snippet: "reverses your controls",
}


enemyData["slingshot"] = {
  color: "#a0522d",
  density: .2,
  lin_damp: 7,
  effective_radius: 1,
  force: .65,
  score_value: 5000,
  attack_rating: 10,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: -0.25, y: 0, r: 1, vertices:
    [[Math.cos(Math.PI * 0) * 1/4, Math.sin(Math.PI*0) * 1/4],
  [Math.cos(Math.PI * 2/3)  * 1/2, Math.sin(Math.PI * 2/3) * 1/2],
  [Math.cos(Math.PI * 4/3) * 1/2, Math.sin(Math.PI * 4/3) * 1/2]]},
    {type: "polygon", x: -0.25, y: 0, r: 1, vertices:
    [[Math.cos(Math.PI * 0) * 1, Math.sin(Math.PI*0) * 1],
  [Math.cos(Math.PI * 2/3)  * 1, Math.sin(Math.PI * 2/3) * 1],
  [Math.cos(Math.PI * 2/3)  * 1, Math.sin(Math.PI * 2/3) * 1/2],
  [Math.cos(Math.PI * 0)  * 1/4, Math.sin(Math.PI * 0) * 1/4]]},
    {type: "polygon", x: -0.25, y: 0, r: 1, vertices:
    [[Math.cos(Math.PI * 0) * 1, Math.sin(Math.PI*0) * 1],
  [Math.cos(Math.PI * 0)  * 1/4, Math.sin(Math.PI * 0) * 1/4],
  [Math.cos(Math.PI * 4/3)  * 1, Math.sin(Math.PI * 4/3) * 1/2],
  [Math.cos(Math.PI * 4/3)  * 1, Math.sin(Math.PI * 4/3) * 1]]}],
  erase_lines: [
    [[Math.cos(Math.PI * 0) * 1/4-0.25, Math.sin(Math.PI*0) * 1/4], [Math.cos(Math.PI * 0) * .75-0.25, Math.sin(Math.PI*0) * 3/4]],
  ],
  true_name: "boomerang",
  enemy_info: [
    "When Impulsed, latches onto its current position # and slingshots back at you",
    "cannot be impulsed while latched",
  ],
  snippet: "slingshots when impulsed",
}

enemyData["orbiter"] = {
  color: "red",
  density: .3,
  lin_damp: 15,
  effective_radius: 0.5,
  force: .96,
  score_value: 5000,
  attack_rating: 10,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 0.5, vertices:
    [[Math.cos(Math.PI * 0) + 0.4, Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/3) + 0.4, Math.sin(Math.PI * 2/3)],
  [0.4, 0]]},
   {type: "polygon", x: 0, y: 0, r: 0.5, vertices:
    [[Math.cos(Math.PI * 4/3) + 0.4, Math.sin(Math.PI*4/3)],
  [Math.cos(Math.PI * 0) + 0.4, Math.sin(Math.PI * 0)],
  [0.4, 0]]},
  {type: "polygon", x: 0, y: 0, r: 0.5, vertices:
    [[0.4, 0],
    [-0.6, 0.3],
    [-1.6, 0],
    [-0.6, -0.3]]},
  ],
  erase_lines: [
    [[0.5, 0], [0.2, 0]]
  ],
  enemy_info: [
    "Intelligently avoids your Impulse # # Will charge at you opportunistically",
  ],
  snippet: "intelligent and dangerous",
}

enemyData["deathray"] = {
  color: "#dddddd",//"#169f95",
  interior_color: "black",
  density: 6,
  lin_damp: 6,
  effective_radius: 1,
  force: 7.2,
  score_value: 10000,
  attack_rating: 10,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1.5, vertices:
    [[0.5 * Math.cos(Math.PI * 3/4) + 0.2, 0.5 * Math.sin(Math.PI*3/4)],
    [Math.cos(Math.PI * 3/4)+ 0.2, Math.sin(Math.PI*3/4)],
    [Math.cos(Math.PI * 5/4)+ 0.2, Math.sin(Math.PI*5/4)],
    [0.5 * Math.cos(Math.PI * 5/4)+ 0.2, 0.5 * Math.sin(Math.PI*5/4)]]},
  {type: "polygon", x: 0, y: 0, r: 1.5, vertices:
    [[0.6 * Math.cos(Math.PI * 1/3)+ 0.2, 0.6 * Math.sin(Math.PI*1/3)],
    [Math.cos(Math.PI * 3/4)+ 0.2, Math.sin(Math.PI*3/4)],
    [0.5 * Math.cos(Math.PI * 3/4)+ 0.2, 0.5 * Math.sin(Math.PI*3/4)],
    [0.8 * Math.cos(Math.PI * 1/3)+ 0.2, 0.3 * Math.sin(Math.PI*1/3)]]},
  {type: "polygon", x: 0, y: 0, r: 1.5, vertices:
    [[0.8 * Math.cos(Math.PI * 5/3)+ 0.2, 0.3 * Math.sin(Math.PI*5/3)],
    [0.5 * Math.cos(Math.PI * 5/4)+ 0.2, 0.5 * Math.sin(Math.PI*5/4)],
    [Math.cos(Math.PI * 5/4)+ 0.2, Math.sin(Math.PI*5/4)],
    [0.6 * Math.cos(Math.PI * 5/3)+ 0.2, 0.6 * Math.sin(Math.PI*5/3)]]}
  ],

  enemy_info: [
    "After firing, must recharge for a short period # # During this time, the deathray cannot move",
  ],
  snippet: "giant death ray",
}

enemyData["boss_one"] = {
  color: constants.colors["boss 1"],
  density: 4.5,
  lin_damp: 8,
  effective_radius: 3,
  force: 0,
  score_value: [1000000, 5000000, 15000000],
  attack_rating: 10,
  is_boss: true,
  categoryBits: box_2d.BOSS_ONE_BIT,
  maskBits: box_2d.PLAYER_BIT | box_2d.ENEMY_BIT,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 2/2), Math.sin(Math.PI * 2/2)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]},
  ],
  death_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 2/2), Math.sin(Math.PI * 2/2)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]},
  ],
  upper_arm_polygon: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 2/2), Math.sin(Math.PI * 2/2)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}
  ],
  lower_arm_polygon: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 2/2), Math.sin(Math.PI * 2/2)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}
  ],
  hand_polygon: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 2/2), Math.sin(Math.PI * 2/2)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}
  ],
}

enemyData["boss_two"] = {
  color: constants.colors["boss 2"],
  //color: "gray",//"rgb(244, 164, 96)",
  density: 4.5,
  lin_damp: 8,
  effective_radius: 3,
  force: 0,
  score_value: [1000000, 5000000, 15000000],
  attack_rating: 10,
  is_boss: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],
  death_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [0.5 * Math.cos(Math.PI * 2/4), 0.5 * Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [0.5 * Math.cos(Math.PI * 6/4), 0.5 * Math.sin(Math.PI * 6/4)]]}],
}

enemyData["boss_three"] = {
  color: "#C000FF",//"rgb(244, 164, 96)",
  density: 2,
  lin_damp: 8,
  effective_radius: 4.5,
  force: 0,
  attack_rating: 10,
  score_value: [1000000, 5000000, 15000000],
  is_boss: true,
  categoryBits: box_2d.BOSS_THREE_BIT,
  maskBits: box_2d.PLAYER_BIT | box_2d.ENEMY_BIT,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 4.5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/8), Math.sin(Math.PI * 1/8)],
  [Math.cos(Math.PI * 2/8), Math.sin(Math.PI * 2/8)],
  [Math.cos(Math.PI * 3/8), Math.sin(Math.PI * 3/8)],
  [Math.cos(Math.PI * 4/8), Math.sin(Math.PI * 4/8)],
  [Math.cos(Math.PI * 5/8), Math.sin(Math.PI * 5/8)],
  [Math.cos(Math.PI * 6/8), Math.sin(Math.PI * 6/8)],
  [Math.cos(Math.PI * 7/8), Math.sin(Math.PI * 7/8)],
  [Math.cos(Math.PI * 8/8), Math.sin(Math.PI * 8/8)],
  [Math.cos(Math.PI * 9/8), Math.sin(Math.PI * 9/8)],
  [Math.cos(Math.PI * 10/8), Math.sin(Math.PI * 10/8)],
  [Math.cos(Math.PI * 11/8), Math.sin(Math.PI * 11/8)],
  [Math.cos(Math.PI * 12/8), Math.sin(Math.PI * 12/8)],
  [Math.cos(Math.PI * 13/8), Math.sin(Math.PI * 13/8)],
  [Math.cos(Math.PI * 14/8), Math.sin(Math.PI * 14/8)],
  [Math.cos(Math.PI * 15/8), Math.sin(Math.PI * 15/8)]
  ]}],
  death_polygons: [{type: "polygon", x: 0, y: 0, r: 4.5, vertices:
    [[0.8 * Math.cos(Math.PI * 1/3), 0.8 * Math.sin(Math.PI*1/3)],
    [0.6 * Math.cos(Math.PI * 2/3), 0.6 * Math.sin(Math.PI*2/3)],
    [0.6 * Math.cos(Math.PI * 4/3), 0.6 * Math.sin(Math.PI*4/3)],
    [0.8 * Math.cos(Math.PI * 5/3), 0.8 * Math.sin(Math.PI * 5/3)]]}
  ],
  arm_polygon: [{type: "polygon", x: 0, y: 0, r: 2, vertices:
    [[0, 0],
  [Math.cos(Math.PI * 0/8), Math.sin(Math.PI * 0/8)],
  [Math.cos(Math.PI * 1/8), Math.sin(Math.PI * 1/8)]]}
  ],
};

enemyData["boss_four"] = {
  color: "#ff0000",
  density: 3,
  lin_damp: 10,
  effective_radius: 4,
  force: 0,
  attack_rating: 10,
  score_value: [1000000, 5000000, 15000000],
  is_boss: true,
  categoryBits: box_2d.BOSS_FOUR_BIT,
  maskBits: box_2d.PLAYER_BIT | box_2d.ENEMY_BIT,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 4, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}
  ],
  body_bud_radius: 2,
  bud_polygon: [{type: "polygon", x: 0, y: 0, r: 2, vertices:
    [[Math.cos(Math.PI * 0) , Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 2/5) , Math.sin(Math.PI * 2/5)],
    [Math.cos(Math.PI * 4/5) , Math.sin(Math.PI * 4/5)],
    [Math.cos(Math.PI * 6/5) , Math.sin(Math.PI * 6/5)],
    [Math.cos(Math.PI * 8/5) , Math.sin(Math.PI * 8/5)]]}
  ],
  death_polygons: [{type: "polygon", x: 0, y: 0, r: 2, vertices:
    [[Math.cos(Math.PI * 0) , Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 2/5) , Math.sin(Math.PI * 2/5)],
    [Math.cos(Math.PI * 4/5) , Math.sin(Math.PI * 4/5)],
    [Math.cos(Math.PI * 6/5) , Math.sin(Math.PI * 6/5)],
    [Math.cos(Math.PI * 8/5) , Math.sin(Math.PI * 8/5)]]}
  ],
}

enemyData["boss_four_attacker"] = {
  color: "white",
  density: 1.5,
  lin_damp: 1,
  initial_radius: 0.1,
  effective_radius: 2.2,
  force: 360,
  attack_rating: 10,
  score_value: [1000000, 5000000, 15000000],
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 0.1, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}
  ],
}

enemyData["boss_four_spawner"] = {
  color: "rgb(0, 255, 0)",
  density: 4,
  lin_damp: 12,
  initial_radius: 0.1,
  effective_radius: 1,
  force: 0,
  score_value: 5000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 0.1, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}
  ],
}

module.exports = enemyData;
