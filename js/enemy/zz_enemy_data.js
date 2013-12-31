imp_params.impulse_enemy_stats = {}

imp_params.impulse_enemy_stats["stunner"] = {
  color: "00ffff",///"#999",
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
  dies_on_impact: "YES",
  enemy_info: [
    "Upon collision, stuns you for 0.5 seconds # (you cannot move or impulse)",
    "If hit directly into another enemy, # may stop moving or bounce back at you # # This property is not unique to Stunners",
    "Like most enemies, will only give points if you directly cause its death # # Accidental self-induced deaths do not give points"
  ],

  className: Stunner
}

imp_params.impulse_enemy_stats["spear"] = {
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
  dies_on_impact: "YES",

  enemy_info: [
    "Charges at you # # Upon collision, causes significant knockback",
    "Will only charge if it has line of sight",
    "Cannot charge for 1 second after entering the screen # # Cannot charge from off-screen",
    "When Impulsed, cannot charge for 5 seconds",
    "Will cause some knockback upon collision even if not charging",
  ],

  special_ability: "Charges you on sight. Hurls you backward on impact.",
  other_notes: "Silenced for two seconds upon entering or re-entering stage. When Impulsed, silenced for five seconds.",
  className: Spear
}

imp_params.impulse_enemy_stats["tank"] = {
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
  /*extra_rendering_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices:
  [[Math.cos(Math.PI * 1/4)/Math.sqrt(2)+Math.cos(Math.PI * 3/4) * 0.05, Math.sin(Math.PI * 1/4)/Math.sqrt(2)+Math.sin(Math.PI * 3/4) * 0.05],
  [Math.cos(Math.PI * 1/4)/Math.sqrt(2)+Math.cos(Math.PI * 7/4) * 0.05, Math.sin(Math.PI * 1/4)/Math.sqrt(2)+Math.sin(Math.PI * 7/4) * 0.05],
  [Math.cos(Math.PI * 5/4)/Math.sqrt(2)+Math.cos(Math.PI * 7/4) * 0.05, Math.sin(Math.PI * 5/4)/Math.sqrt(2)+Math.sin(Math.PI * 7/4) * 0.05],
  [Math.cos(Math.PI * 5/4)/Math.sqrt(2)+Math.cos(Math.PI * 3/4) * 0.05, Math.sin(Math.PI * 5/4)/Math.sqrt(2)+Math.sin(Math.PI * 3/4) * 0.05]]},
  {type: "polygon", x: 0, y: 0, r: 1, vertices:
  [[Math.cos(Math.PI * 3/4)/Math.sqrt(2)+Math.cos(Math.PI * 5/4) * 0.05, Math.sin(Math.PI * 3/4)/Math.sqrt(2)+Math.sin(Math.PI * 5/4) * 0.05],
  [Math.cos(Math.PI * 3/4)/Math.sqrt(2)+Math.cos(Math.PI * 1/4) * 0.05, Math.sin(Math.PI * 3/4)/Math.sqrt(2)+Math.sin(Math.PI * 1/4) * 0.05],
  [Math.cos(Math.PI * 7/4)/Math.sqrt(2)+Math.cos(Math.PI * 1/4) * 0.05, Math.sin(Math.PI * 7/4)/Math.sqrt(2)+Math.sin(Math.PI * 1/4) * 0.05],
  [Math.cos(Math.PI * 7/4)/Math.sqrt(2)+Math.cos(Math.PI * 5/4) * 0.05, Math.sin(Math.PI * 7/4)/Math.sqrt(2)+Math.sin(Math.PI * 5/4) * 0.05]]}],*/

  dies_on_impact: "YES",

  enemy_info: [
    "Explodes upon collision, # causing huge knockback to all nearby units",
    "The blast radius is outlined around the Tank",
    "When Impulsed, becomes volatile for 1 second # # Collision with another Tank will cause a volatile Tank to explode and die",
    "Explodes upon death if volatile # # Therefore Will explode upon death when Impulsed into the Hiveline",
    "Due to its mass, other enemies easily bounce off of the tank # # be wary of hitting smaller enemies directly into tanks"

  ],

  className: Tank
}

imp_params.impulse_enemy_stats["mote"] = {
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
  dies_on_impact: "YES",
  enemy_info: [
    "Cannot be Impulsed # # Upon impact, silences you for 3 seconds # (You cannot impulse)",
    "The Mote is not immune to any other effect, # including collision with other enemies",
  ],
  className: Mote

}

imp_params.impulse_enemy_stats["goo"] = {
  color: "#e6c43c",
  density: 7,
  lin_damp: 9,
  effective_radius: .5,
  force: 3.5,
  score_value: 3000,
  attack_rating: .25,
  batch_enemy_image: true,
  /*shape_polygons: [{type: "polygon", x: 0, y: 0, r: 2, vertices:
    [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]]}],*/
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}],
  /*{type: "circle", x: 2*Math.cos(Math.PI*2/3), y: 2*Math.sin(Math.PI*2/3), r: .2},
  {type: "circle", x: 2*Math.cos(Math.PI*4/3), y: 2*Math.sin(Math.PI*4/3), r: .2},
  {type: "circle", x: 2*Math.cos(Math.PI*6/3), y: 2*Math.sin(Math.PI*6/3), r: .2}*/
  extra_rendering_polygons: [{type: "circle", x: 0, y: 0, r: 1.3, colored: true}],
  dies_on_impact: "YES",
  enemy_info: [
    "All units within its area of influence are slowed",
    "Dies upon collision # # Units immediately regain speed",
    "When Impulsed, dramatically expands its area of influence for 2 seconds",
  ],
  className: Goo

}

imp_params.impulse_enemy_stats["harpoon"] = {
  color: "#00aa00",
  density: 6,
  lin_damp: 6,
  effective_radius: 0.7,
  force: 5.4,
  score_value: 3000,
  attack_rating: 6,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .7, vertices:
  [[Math.cos(Math.PI * 1/4) - 0.4, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 7/8) - 0.4, Math.sin(Math.PI * 7/8)],
  [Math.cos(Math.PI * 9/8) - 0.4, Math.sin(Math.PI * 9/8)],
  [Math.cos(Math.PI * 7/4) - 0.4, Math.sin(Math.PI * 7/4)],
  ]}],
  /*{type: "polygon", x: -0.2, y: 0, r: .7, vertices:
  [[Math.cos(Math.PI * 1/4) - 0.4, Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 7/8) - 0.4, Math.sin(Math.PI * 7/8)],
  [Math.cos(Math.PI * 9/8) - 0.4, Math.sin(Math.PI * 9/8)],
  [Math.cos(Math.PI * 7/4) - 0.4, Math.sin(Math.PI * 7/4)],
  ]}*/
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
  dies_on_impact: "NO",
  enemy_info: [
    "Fires its hook at you # and attempts to yank you in # # Can only fire through walls.",
    "The hook range is outlined around the Harpoon",
    "While the hook is detached from the Harpoon, it cannot move",
    "When Impulsed, the hook is disabled for 2 seconds",
    "Can latch onto other enemies and will yank them in",
    "Will actively try to avoid you # # Does not die on collision",
    "Cannot fire for 1 second after entering the screen # # Cannot fire from off-screen",
    "During boss battles, can fire at any time",

  ],

  className: Harpoon

}

imp_params.impulse_enemy_stats["harpoonhead"] = {
  color: "#00dd00",
  density: 1.2,
  lin_damp: 6,
  effective_radius: imp_params.impulse_enemy_stats["harpoon"].effective_radius * Math.sqrt(6)/3,
  force: 1.5,
  score_value: 1000,
  attack_rating: 6,
  batch_enemy_image: true,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: imp_params.impulse_enemy_stats["harpoon"].effective_radius * Math.sqrt(6)/3, vertices:
  [[Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 0), Math.sin(Math.PI * 0)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)]]
  }],

  dies_on_impact: "NO",
  special_ability: "Shoots a harpoon which can latch onto you. Once you are latched, the Harpoon will attempt to drag you to your death.",
  other_notes: "In normal levels, harpoons can only fire through obstacles and are harmless up close. In boss levels, harpoons can fire at any time. Impulsing a harpoon silences it for 1 second. Harpoons will flee from you.",
  description: "Shoots a harpoon that can latch onto you. Once you are latched, it will attempt to drag you to your death.",
  className: HarpoonHead

}

imp_params.impulse_enemy_stats["fighter"] = {
  color: "#0000ff",
  density: 3,
  lin_damp: 6,
  effective_radius: 0.75,
  force: 2.5,
  score_value: 4000,
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
    "Launches deadly bullets that blow away anything they hit # # Impulse can reflect the bullets",
    "Very resistant to Impulse # # Very weak against the force of its own bullets",
    "If the player is not within line of sight of a bullet, the fighter will not fire the bullet.",
    "Every two seconds, charges up a Frenzy bar # # When the Hunter has five Frenzy bars, it will activate Frenzy mode",
    "During Frenzy mode, the Hunter moves faster and fires more rapidly # # Additionally, its bullets move faster and cannot be Impulsed",
    "While in Frenzy mode, loses a Frenzy bar whenever it fires # # When the Frenzy bars are depleted, the Hunter exits Frenzy mode",
    "Both in and out of Frenzy mode, loses one Frenzy bar each time it is Impulsed",
  ],



  dies_on_impact: "NO",
  special_ability: "Fires bullets at you upon sight. Bullets fling you backwards on impact. For every 2 seconds that the Fighter is idle, it loads up a piercing bullet, which cannot be Impulsed.",
  other_notes: "Normal bullets can be reflected to hit other enemies and even the Fighter itself.",
  className: Fighter
}

imp_params.impulse_enemy_stats["fighter_bullet"] = {
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
  className: FighterBullet
}

imp_params.impulse_enemy_stats["piercing_fighter_bullet"] = {
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
  className: PiercingFighterBullet
}


imp_params.impulse_enemy_stats["disabler"] = {
  color: "#ccc",
  //interior_color: "rgb(205, 201, 201)",
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
  /*shape_polygons: [{type: "polygon", x: 0, y: 0, r: 2, vertices:
    [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [.25 * Math.cos(Math.PI * 1), .25 * Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}], */
  dies_on_impact: "YES",
  enemy_info: [
    "All units within its area of effect (AOE) lose all special powers # # Specifically, you cannot Impulse",
    "Colliding with an enemy within its AOE # (excluding the disabler itself) # does not reset your multiplier # # However you do not score points",
    "Dies upon collision # # Units immediately regain special powers",
    "When Impulsed, dramatically expands its area of influence for 3 seconds"
  ],
  special_ability: "Leaves behind a trail of crippling poison. Everything that passes through the poison is silenced.",
  other_notes: "Passing through goo will instantly slow you down, which may help you survive blasts from other enemies. Goos are not affected by each other.",
  className: Disabler
}

imp_params.impulse_enemy_stats["troll"] = {
  color: "#159d31",
  density: 1,
  lin_damp: 3,
  effective_radius: 0.7,
  force: 0.24,
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
    "If Impulsed while active, # reverses your movement and Impulse controls for 1 second",
    "All Pinwheels become inactive at regular intervals # # Inactive trolls will not reverse you and fly farther when Impulsed",
    "Upon collision, reverses you for 5 seconds",
  ],
  //can potentially have it confuse all enemies around it, but for now, no. Too confusing, and a lot of work to implement.
  dies_on_impact: "YES",
  special_ability: "When active, impulsing the Troll will pull it towards you. Upon impact, reverses your movement and impulse controls.",
  other_notes: "The troll alternates between active and inactive every second.",
  className: Troll

}


imp_params.impulse_enemy_stats["slingshot"] = {
  color: "rgb(160, 82, 45)",
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
    //[[Math.cos(Math.PI * 0) * 1, Math.sin(Math.PI*0) * 1], [Math.cos(Math.PI * 0) * 1.5, Math.sin(Math.PI*0) * 1.5] ]
  ],
  dies_on_impact: "YES",
  special_ability: "When Impulsed, it will hook onto the ground and slingshot back towards you, flinging you away if it hits you.",
  other_notes: "If the slingshot hits you while not slingshoting, it will still push you back a fair way.",
  className: Slingshot,
  enemy_info: [
    "Upon Impulse, latches onto its current position and slingshots.",
    "While in slingshot mode, turns red and cannot be Impulsed.",
    "Upon collision in slingshot mode, hurls you backward.",
    "Upon collision outside of slingshot mode, still knocks you back a significant amount"
  ],
}

imp_params.impulse_enemy_stats["orbiter"] = {
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

  /* {type: "polygon", x: 0, y: 0, r: 0.5, vertices:
    [[Math.cos(Math.PI * 5/3) * 1/2, Math.sin(Math.PI*5/3) * 1/2],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 5/3) * 1/2, Math.sin(Math.PI*5/3) * 1/2 - Math.sqrt(3)/2]]},
  {type: "polygon", x: 0, y: 0, r: 0.5, vertices:
    [[Math.cos(Math.PI * 1/3) * 1/2, Math.sin(Math.PI*1/3) * 1/2],
    [Math.cos(Math.PI * 1/3) * 1/2, Math.sin(Math.PI*1/3) * 1/2 + Math.sqrt(3)/2],
    [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)]*/

  dies_on_impact: "YES",
  special_ability: "Locks onto you. Actively avoids your Impulse. Charges you if you've shot your Impulse the other way.",
  other_notes: "Intelligent and dangerous.",
  className: Orbiter
}

imp_params.impulse_enemy_stats["deathray"] = {
  color: "#ddd",//"#169f95",
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

/*  [{type: "polygon", x: 0, y: 0, r: 1, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],*/
  dies_on_impact: "NO",
  special_ability: "While in turret mode, sends a devastating ray across the level every 2 seconds.",
  other_notes: "Death rays will only enter turret mode after they are a certain distance away from the walls. Death rays take 1 seconds to enter or leave turret mode.",
  className: DeathRay

}

imp_params.impulse_enemy_stats["first boss"] = {
  color: impulse_colors["boss 1"],
  density: 4.5,
  lin_damp: 8,
  effective_radius: 3,
  force: 0,
  score_value: [1000000, 5000000, 15000000],
  attack_rating: 10,
  is_boss: true,
  categoryBits: imp_params.BOSS_ONE_BIT,
  maskBits: imp_params.PLAYER_BIT | imp_params.ENEMY_BIT,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices:
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 2/2), Math.sin(Math.PI * 2/2)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]},
  ],
   /* [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]},
  ],*/
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

  dies_on_impact: "NO",
  special_ability: "Shoots stunners, spears, and tanks at you. Can cast a global lighten, which causes everything to lighter and much easier to push.",
  other_notes: "The color of the boss's guns reflect what it is shooting. During the global lighten, the boss will shoot faster. Use this time to clear the field of enemies.",
  className: BossOne


}

imp_params.impulse_enemy_stats["second boss"] = {
  color: impulse_colors["boss 2"],
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

  dies_on_impact: "NO",
  special_ability: "Exerts a gravity on the field, pulling everything towards it. The closer to the boss, the stronger the pull. The boss has four gravity arms, inside which the gravity is doubled. The boss can also send a massive shockwave through the field.",
  other_notes: "Enemies that collide with the boss will be absorbed, increasing the boss's shockwave range. If you touch the boss, you will be flung away.",
  className: BossTwo

}

imp_params.impulse_enemy_stats["third boss"] = {
  color: "#a260a6",//"rgb(244, 164, 96)",
  density: 1.7,
  lin_damp: 8,
  effective_radius: 4.5,
  force: 0,
  attack_rating: 10,
  score_value: [1000000, 5000000, 15000000],
  is_boss: true,
  categoryBits: imp_params.BOSS_THREE_BIT,
  maskBits: imp_params.PLAYER_BIT | imp_params.ENEMY_BIT,
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
  arm_polygon: [{type: "polygon", x: 0, y: 0, r: 4.5, vertices:
    [[0, 0],
  [Math.cos(Math.PI * 0/8), Math.sin(Math.PI * 0/8)],
  [Math.cos(Math.PI * 1/8), Math.sin(Math.PI * 1/8)]]}
  ],
  dies_on_impact: "NO",
  special_ability: "Has six turrets which fire bullets. Can cast a global silence and enter berserk mode, during which its attack speed is doubled.",
  other_notes: "Turrets which enter an obstacle cannot attack. Bullets can be reflected by Impulse to hit other enemies, including the boss.",
  className: BossThree

}

imp_params.impulse_enemy_stats["fourth boss"] = {
  color: "#ff0000",
  density: 9,
  lin_damp: 10,
  effective_radius: 4,
  force: 0,
  attack_rating: 10,
  score_value: [1000000, 5000000, 15000000],
  is_boss: true,
  categoryBits: imp_params.BOSS_FOUR_BIT,
  maskBits: imp_params.PLAYER_BIT | imp_params.ENEMY_BIT,
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
  dies_on_impact: "NO",
  special_ability: "Periodically spawns capsules. Has a thin laser which sweeps around the field. When the sweep laser hits a capsule, the capsule spawns a large number of enemies. The boss has two additional lasers, one which paralyzes and one which exerts massive force.",
  other_notes: "The sweep laser can be blocked, preventing capsules from spawning enemies.",
  className: BossFour

}

imp_params.impulse_enemy_stats["boss four attacker"] = {
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
  className: BossFourAttacker
}

imp_params.impulse_enemy_stats["boss four spawner"] = {
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
  className: BossFourSpawner
}

var impulse_enemy_kills_star_cutoffs = {
  "stunner": 500,
  "spear": 250,
  "tank": 150,
  "mote": 150,
  "goo": 50,
  "harpoon": 50,
  "disabler": 50,
  "fighter": 50,
  "slingshot": 50,
  "troll": 50,
  "deathray": 25,
  "orbiter": 50
}

function set_up_enemy_images() {
  for(var i in imp_params.impulse_enemy_stats) {
    if(imp_params.impulse_enemy_stats[i].batch_enemy_image) {
      var temp_enemy = new (imp_params.impulse_enemy_stats[i].className)(null, 0, 0, 0, null)
      imp_params.impulse_enemy_stats[i].images = temp_enemy.generate_images()    
    }
  }
}


