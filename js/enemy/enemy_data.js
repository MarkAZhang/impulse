impulse_enemy_stats = {}

impulse_enemy_stats["stunner"] = {
  color: "red",
  density: 1,
  lin_damp: 3,
  effective_radius: .5,
  force: .5,
  score_value: 100,
  shape_type: "circle",
  description: "Basic enemy. No special abilities. Stuns you for a short duration on impact."
}

impulse_enemy_stats["spear"] = {
  color: "green",
  density: 0.7,
  lin_damp: 4,
  effective_radius: .7,
  force: .2,
  score_value: 500,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 5/6), Math.sin(Math.PI * 5/6)],
  [Math.cos(Math.PI * 7/6), Math.sin(Math.PI * 7/6)]],
  description: "Charges at you when it has sight of you and exerts significant impulse on impact. Very light."
}

impulse_enemy_stats["tank"] = {
  color: "purple",
  density: 2, 
  lin_damp: 3,
  effective_radius: 1,
  force: 1,
  score_value: 1000,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]],
  description: "Heavy, slow-moving enemy. When it dies or impacts you, it will explode, exerting massive impulse on all entities within range. There are other ways of making it explode as well..."
}

impulse_enemy_stats["mote"] = {
  color: "pink",
  density: .5,
  lin_damp: 3,
  effective_radius: .5,
  force: .15,
  score_value: 600,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]],
  description: "Cannot be impulsed. The only way to kill it is to push another enemy into it. Upon impact, silences your impulse for a long duration."

}

impulse_enemy_stats["goo"] = {
  color: "yellow",
  density: .5,
  lin_damp: 3,
  effective_radius: 2,
  force: .7,
  score_value: 500,
  shape_type: "polygon",
  shape_vertices: [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]],
  description: "Leaves a sticky trail behind it, slowing all entities that enter the trail. Upon impact, slows you for a long duration."

}

impulse_enemy_stats["disabler"] = {
  color: "rgb(205, 201, 201)",
  density: 1,
  lin_damp: 3,
  effective_radius: 2,
  force: .7,
  score_value: 800,
  shape_type: "polygon",
  shape_vertices: [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [.25 * Math.cos(Math.PI * 1), .25 * Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]],
  description: "Leaves a staticky trail behind it, silencing the special abilties of all entities that enter the trail. Upon impact, silences your impulse for a long duration."
}

impulse_enemy_stats["crippler"] = {
  color: "rgb(255, 20, 147)",
  density: 1.2,
  lin_damp: 3,
  effective_radius: 2,
  force: .8,
  score_value: 1000,
  shape_type: "polygon",
  shape_vertices: [[.25 * Math.cos(Math.PI * 0), .25 * Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [.25 * Math.cos(Math.PI * 1), .25 * Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]],
  description: "Leaves a paralytic trail behind it, causing all entities that enter the trail to be completely stunned (cannot move and no special abilities) until the trail fades. Upon impact, stuns you for a long duration."

}


impulse_enemy_stats["wisp"] = {
  color: "rgb(152, 251, 152)",
  density: 1,
  lin_damp: 3,
  effective_radius: .5,
  force: .2,
  score_value: 400,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/2), Math.sin(Math.PI * 1/2)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 3/2), Math.sin(Math.PI * 3/2)]],
  description: "Fades in and out of visibility. Keep your eyes open! Upon impact, blinds you to the level's Shapes of Death for a long duration."

}


impulse_enemy_stats["fighter"] = {
  color: "rgb(30, 144, 255)",
  density: 3,
  lin_damp: 3,
  effective_radius: 1,
  force: 1.3,
  score_value: 1000,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]],
  description: "Shoots bullets, which exert a significant impulse upon any entities hit. You can reflect the bullets with your impulse."

}

impulse_enemy_stats["fighter_bullet"] = {
  color: "rgb(30, 144, 255)",
  density: 5,
  lin_damp: 3,
  effective_radius: .3,
  force: 1,
  score_value: 0,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]]

}

impulse_enemy_stats["harpoon"] = {
  color: "orange",
  density: 3,
  lin_damp: 3,
  effective_radius: .7,
  force: 1.5,
  score_value: 1000,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/5), Math.sin(Math.PI * 2/5)],
  [Math.cos(Math.PI * 4/5), Math.sin(Math.PI * 4/5)],
  [Math.cos(Math.PI * 6/5), Math.sin(Math.PI * 6/5)],
  [Math.cos(Math.PI * 8/5), Math.sin(Math.PI * 8/5)]],
  description: "Shoots a harpoon that can latch onto you. Once you are latched, it will attempt to drag you to your death."

}

impulse_enemy_stats["slingshot"] = {
  color: "rgb(160, 82, 45)",
  density: .2,
  lin_damp: 6,
  effective_radius: 1,
  force: .4,
  score_value: 1500,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)]],
  description: "When you impulse it, it will hook onto the ground and slingshot back at you. Try to kill it in one shot."

}

impulse_enemy_stats["deathray"] = {
  color: "rgb(0, 229, 238)",
  density: 1,
  lin_damp: 3,
  effective_radius: 1,
  force: .8,
  score_value: 2500,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/3), Math.sin(Math.PI * 1/3)],
  [Math.cos(Math.PI * 2/3), Math.sin(Math.PI * 2/3)],
  [Math.cos(Math.PI * 1), Math.sin(Math.PI * 1)],
  [Math.cos(Math.PI * 4/3), Math.sin(Math.PI * 4/3)],
  [Math.cos(Math.PI * 5/3), Math.sin(Math.PI * 5/3)]],
  description: "After taking time to install itself, continuously shoots death rays at you, exerting a massive impulse on all entities within the ray."

}

impulse_enemy_stats["first boss"] = {
  color: "rgb(208, 32, 144)",
  density: 1,
  lin_damp: 3,
  effective_radius: 3,
  force: 0,
  score_value: 100000,
  shape_type: "polygon",
  shape_vertices: [[Math.cos(Math.PI * 0), Math.sin(Math.PI*0)],
  [Math.cos(Math.PI * 1/4), Math.sin(Math.PI * 1/4)],
  [Math.cos(Math.PI * 2/4), Math.sin(Math.PI * 2/4)],
  [Math.cos(Math.PI * 3/4), Math.sin(Math.PI * 3/4)],
  [Math.cos(Math.PI * 4/4), Math.sin(Math.PI * 4/4)],
  [Math.cos(Math.PI * 5/4), Math.sin(Math.PI * 5/4)],
  [Math.cos(Math.PI * 6/4), Math.sin(Math.PI * 6/4)],
  [Math.cos(Math.PI * 7/4), Math.sin(Math.PI * 7/4)]],

  description: "Lives within a swarm of Stunners. Shoots Stunners, Spears, and Tanks at the player."

}
