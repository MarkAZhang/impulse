impulse_enemy_stats = {}

impulse_enemy_stats["stunner"] = {
  color: "red",
  density: 1,
  lin_damp: 3,
  effective_radius: .5,
  force: .5,
  score_value: 100,
  shape_polygons: [{type: "circle", x: 0, y: 0, r: .5}],
  description: "Basic enemy. No special abilities. Stuns you for a short duration on impact.",
  className: Stunner
}

impulse_enemy_stats["spear"] = {
  color: "green",
  density: 0.7,
  lin_damp: 4,
  effective_radius: .7,
  force: .2,
  score_value: 500,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .7, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
    [Math.cos(Math.PI * 5/6), Math.sin(Math.PI * 5/6)],
    [Math.cos(Math.PI * 7/6), Math.sin(Math.PI * 7/6)]]}],
  description: "Charges at you when it has sight of you and exerts significant impulse on impact. Very light.",
  className: Spear
}

impulse_enemy_stats["tank"] = {
  color: "purple",
  density: 2, 
  lin_damp: 3,
  effective_radius: 1,
  force: 1,
  score_value: 1000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}], 
  description: "Heavy, slow-moving enemy. When it dies or impacts you, it will explode, exerting massive impulse on all entities within range. There are other ways of making it explode as well...",
  className: Tank
}

impulse_enemy_stats["mote"] = {
  color: "pink",
  density: .5,
  lin_damp: 3,
  effective_radius: .5,
  force: .15,
  score_value: 600,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}], 
  description: "Cannot be impulsed. Can only be killed by pushing other enemies into it. Upon impact, silences your impulse for a long duration.",
  className: Mote

}

impulse_enemy_stats["goo"] = {
  color: "brown",
  density: 8,
  lin_damp: 9,
  effective_radius: 3,
  force: 1,
  score_value: 500,
  /*shape_polygons: [{type: "polygon", x: 0, y: 0, r: 2, vertices: 
    [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]]}],*/
  shape_polygons: [{type: "circle", x: 0, y: 0, r: .2},
  /*{type: "circle", x: 2*Math.cos(Math.PI*2/3), y: 2*Math.sin(Math.PI*2/3), r: .2},
  {type: "circle", x: 2*Math.cos(Math.PI*4/3), y: 2*Math.sin(Math.PI*4/3), r: .2},
  {type: "circle", x: 2*Math.cos(Math.PI*6/3), y: 2*Math.sin(Math.PI*6/3), r: .2}*/
  ],
  description: "Leaves a sticky trail behind it. Enemies that move through the trail will get stuck to the ground, slowing them down significantly. Upon impact, slows you for a long duration.",
  className: Goo

}

impulse_enemy_stats["disabler"] = {
  color: "rgb(205, 201, 201)",
  density: 8,
  lin_damp: 3,
  effective_radius: 3,
  force: .7,
  score_value: 800,
  shape_polygons: [{type: "circle", x: 0, y: 1, r: .2},
    {type: "circle", x: 0, y: -1, r: .2}
    ],
  /*shape_polygons: [{type: "polygon", x: 0, y: 0, r: 2, vertices: 
    [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [.25 * Math.cos(Math.PI * 1), .25 * Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}], */
  description: "Leaves a staticky trail behind it, silencing the special abilties of all entities that enter the trail. Upon impact, silences your impulse for a long duration.",
  className: Disabler
}

impulse_enemy_stats["crippler"] = {
  color: "rgb(255, 20, 147)",
  density: 0.9,
  lin_damp: 4,
  effective_radius: 2.5,
  force: 1.7,
  score_value: 2000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 2.5, vertices: 
    [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [.25 * Math.cos(Math.PI * 1), .25 * Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}], 
  description: "Leaves a paralytic trail behind it, causing all entities that enter the trail to be completely stunned (cannot move and no special abilities) until the trail fades. Upon impact, stuns you for a long duration.",
  className: Crippler

}


impulse_enemy_stats["wisp"] = {
  color: "rgb(152, 251, 152)",
  density: 2,
  lin_damp: 3,
  effective_radius: .5,
  force: .4,
  score_value: 600,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}], 
  description: "Fades in and out of visibility. Keep your eyes open! Upon impact, blinds you to the level's Shapes of Death for a long duration.",
  className: Wisp

}

impulse_enemy_stats["wispdire"] = {
  color: "rgb(152, 251, 152)",
  density: 1,
  lin_damp: 3,
  effective_radius: .5,
  force: .5,
  score_value: 600,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .5, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]]}], 
  description: "Fades in and out of visibility. Keep your eyes open! Upon impact, blinds you to the level's Shapes of Death for a long duration.",
  className: WispDire,
  proxy: "wisp"

}



impulse_enemy_stats["fighter"] = {
  color: "rgb(30, 144, 255)",
  density: 3,
  lin_damp: 3,
  effective_radius: 1,
  force: 1.3,
  score_value: 1000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}], 
  description: "Shoots bullets, which exert a significant impulse upon any entities hit. You can reflect the bullets with your impulse.",
  className: Fighter
}

impulse_enemy_stats["fighterdire"] = {
  color: "rgb(30, 144, 255)",
  density: 3,
  lin_damp: 3,
  effective_radius: 1,
  force: 3,
  score_value: 1000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}], 
  description: "Shoots bullets, which exert a significant impulse upon any entities hit. You can reflect the bullets with your impulse.",
  className: FighterDire,
  proxy: "fighter"
}


impulse_enemy_stats["fighter_bullet"] = {
  color: "rgb(30, 144, 255)",
  density: 5,
  lin_damp: 3,
  effective_radius: .3,
  force: 1,
  score_value: 0,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .3, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],
  className: FighterBullet
}

impulse_enemy_stats["piercing_fighter_bullet"] = {
  color: "rgb(255, 0, 0)",
  density: 5,
  lin_damp: 3,
  effective_radius: .3,
  force: 1,
  score_value: 0,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .3, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],
  className: PiercingFighterBullet
}

impulse_enemy_stats["harpoon"] = {
  color: "orange",
  density: 3,
  lin_damp: 3,
  effective_radius: .7,
  force: 1.5,
  score_value: 1000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .7, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}],
  description: "Shoots a harpoon that can latch onto you. Once you are latched, it will attempt to drag you to your death.",
  className: Harpoon

}

impulse_enemy_stats["harpoondire"] = {
  color: "orange",
  density: 3,
  lin_damp: 3,
  effective_radius: .7,
  force: 1.5,
  score_value: 1000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .7, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}],
  description: "Shoots a harpoon that can latch onto you. Once you are latched, it will attempt to drag you to your death.",
  className: HarpoonDire,
  proxy: "harpoon"

}


impulse_enemy_stats["slingshot"] = {
  color: "rgb(160, 82, 45)",
  density: .2,
  lin_damp: 6,
  effective_radius: 1,
  force: .4,
  score_value: 1500,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]]}],
  description: "When you impulse it, it will hook onto the ground and slingshot back at you. Try to kill it in one shot.",
  className: Slingshot

}

impulse_enemy_stats["deathray"] = {
  color: "rgb(0, 229, 238)",
  density: 1.5,
  lin_damp: 6,
  effective_radius: 1,
  force: 2,
  score_value: 2500,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/3), Math.sin(Math.PI * 1/3)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 5/3), Math.sin(Math.PI * 5/3)]]}],
  description: "After taking time to install itself, continuously shoots death rays at you, exerting a massive impulse on all entities within the ray.",
  className: DeathRay

}

impulse_enemy_stats["deathraydire"] = {
  color: "rgb(0, 229, 238)",
  density: 1.5,
  lin_damp: 6,
  effective_radius: 1,
  force: 4,
  score_value: 2500,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 1, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/3), Math.sin(Math.PI * 1/3)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 5/3), Math.sin(Math.PI * 5/3)]]}],
  description: "After taking time to install itself, continuously shoots death rays at you, exerting a massive impulse on all entities within the ray.",
  className: DeathRayDire,
  proxy: "deathray"

}

impulse_enemy_stats["first boss"] = {
  color: "rgb(208, 32, 144)",
  density: 1,
  lin_damp: 3,
  effective_radius: 3,
  force: 0,
  score_value: [1000000, 5000000, 15000000],
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]},
  ],
  description: "Lives within a swarm of Stunners. Shoots Stunners, Spears, and Tanks at the player.",
  className: BossOne


}

impulse_enemy_stats["second boss"] = {
  color: "gray",//"rgb(244, 164, 96)",
  density: 1.6,
  lin_damp: 3,
  effective_radius: 3,
  force: 0,
  score_value: [1000000, 5000000, 15000000],
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],

  description: "Has four blades that silence the player. Also periodically explodes in a wide radius.",
  className: BossTwo

}

impulse_enemy_stats["fixed_harpoon"] = {
  color: "orange",
  density: 3,
  lin_damp: 3,
  effective_radius: .7,
  force: .5,
  score_value: 1000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .7, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]]}],
  description: "Shoots a harpoon that can latch onto you. Once you are latched, it will attempt to drag you to your death.",
  className: FixedHarpoon,
  proxy: "harpoon"

}

impulse_enemy_stats["third boss"] = {
  color: "rgb(0, 0, 205)",//"rgb(244, 164, 96)",
  density: 1,
  lin_damp: 3,
  effective_radius: 3,
  force: 0,
  score_value: 100000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],
  description: "Has six turrets which shoot at the player. Turrets are disabled when they enter a Shape of Death. Boss occasionally enters Frenzy Mode, silencing everything on the field and acquiring increased firing speed.",
  className: BossThree

}

impulse_enemy_stats["fourth boss"] = {
  color: "rgb(0, 255, 0)",
  interior_color: "#79ff78", 
  density: 1.4,
  lin_damp: 3,
  effective_radius: 3,
  force: 0,
  score_value: 200000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: 3, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]},
  
  ],
  description: "Has a Spawn Laser which sweeps around the boss. More info coming",
  className: BossFour

}

impulse_enemy_stats["boss four spawner"] = {
  color: "rgb(0, 255, 0)",
  density: 5,
  lin_damp: 10,
  effective_radius: .7,
  force: 0,
  score_value: 5000,
  shape_polygons: [{type: "polygon", x: 0, y: 0, r: .6, vertices: 
    [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]}],
  description: "Has a Spawn Laser which sweeps around the boss. More info coming",
  className: BossFourSpawner
}

impulse_enemy_kills_star_cutoffs = {
  "stunner": 500,
  "spear": 250,
  "tank": 150,
  "mote": 150,
  "goo": 50,
  "harpoon": 50,
  "wisp": 150,
  "disabler": 50,
  "fighter": 50,
  "slingshot": 50,
  "crippler": 15,
  "deathray": 15,
}