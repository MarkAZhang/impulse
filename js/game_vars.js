var imp_params = {
  songs : {
    "Menu": "complex",
    "Interlude": "complex",
    "Hive 1": "kickit",
    "Hive 2": "breakthru",
    "Hive 3": "emergence",
    "Hive 4": "fire",
    "Tessellation": "driven",
    "Final Tessellation": "wicked"
  },
  song_repeats: {
    "driven": 27.460,
    "wicked": 2.922
  },
  sounds: {
    "impulse": "effects/impulse",
    "pdeath": "effects/pdeath",
    "ffrenzy": "effects/ffrenzy",
    "sparks": "effects/sparks",
    "ult": "effects/ult",
    "pwheel": "effects/pwheel",
    "goo": "effects/goo",
    "sshot": "effects/sshot",
    "deathray": "effects/deathray",
    "b1hit": "effects/b1hit",
    "b1shrink": "effects/b1shrink",
    "b1grow": "effects/b1grow",
    "b2bhole": "effects/b2bhole",
    "b3strike": "effects/b3strike",
    "b3select": "effects/b3select",
    "b4spawner": "effects/b4spawner",
    "b4attacker": "effects/b4attacker",
    "b4darkness": "effects/b4darkness",
  },
  multisounds: {
    "b3tick": {
      file: "effects/b3tick",
      maxnum: 2
    },
    "sdeath": {
      file: "effects/sdeath",
      maxnum: 4
    },
    "tdeath": {
      file: "effects/tdeath",
      maxnum: 4
    },
    "hfire": {
      file: "effects/hfire",
      maxnum: 2
    },
    "hhit": {
      file: "effects/hhit",
      maxnum: 2
    },
    "fbullet": {
      file: "effects/fbullet",
      maxnum: 4
    },
    "fbullethit": {
      file: "effects/fbullethit",
      maxnum: 4
    },
    "b2eat": {
      file: "effects/b2eat",
      maxnum: 4
    },
    "b4spawneract": {
      file: "effects/b4spawneract",
      maxnum: 2
    }
  },
  bg: {
    "Hive 0": "bg/hive0",
    "Title Alt1": "bg/titlebg_alt1",
    "Title Alt2": "bg/titlebg_alt2",
    "Title Alt3": "bg/titlebg_alt3",
    "Title Alt4": "bg/titlebg_alt4",
    "Hive 1": "bg/hive1",
    "Hive 2": "bg/hive2",
    "Hive 3": "bg/hive3",
    "Hive 4": "bg/hive4",
  },
  tessellation_names: {
    1: "IGNAVIAM",
    2: "CONSUMENDI",
    3: "NEGLIGENTIA",
    4: "ADROGANTIA"
  },
  life_upgrades: [
    {life: 4, rating: 500},
    {life: 5, rating: 1000},
    {life: 6, rating: 2000},
    {life: 7, rating: 5000},
    {life: 8, rating: 7000},
    {life: 9, rating: 10000}
  ],
  ult_upgrades: [
    {ult: 1, rating: 50},
    {ult: 2, rating: 3000},
    {ult: 3, rating: 8000},
  ],
  spark_upgrades: [
    {spark_val: 11, rating: 200},
    {spark_val: 12, rating: 750},
    {spark_val: 13, rating: 1500},
    {spark_val: 14, rating: 4000},
    {spark_val: 15, rating: 6000},
    {spark_val: 16, rating: 9000},
  ],
  
  keys: {

  },

  WALL_BIT: 0x0001,
  PLAYER_BIT: 0x0002,
  ENEMY_BIT: 0x0004,
  BOSS_ONE_BIT: 0x0008,
  BOSS_THREE_BIT: 0x0010,
  BOSS_FOUR_BIT: 0x0011,
  BOSS_BITS: 0x0018
}

for(var multisounds in imp_params.multisounds) {
  imp_params.sounds[multisounds] = imp_params.multisounds[multisounds].file
}

var impulse_colors = {}
impulse_colors['bronze'] = "#cc8032"
impulse_colors['silver'] = "#c0c0c0"
//impulse_colors['impulse_silver'] = "rgba(175, 175, 175, 0.4)"
impulse_colors['impulse_target_blue'] = "rgba(0, 128, 255, 0.2)"
impulse_colors['impulse_blue'] = "rgb(0, 128, 255)"
impulse_colors['impulse_blue_dark'] = "#13527e"
impulse_colors['gold'] = "#edb900"


impulse_colors['world 0'] = "#333"
impulse_colors['world 0 lite'] = "#999"
impulse_colors['world 0 bright'] = "#fff"
impulse_colors['world 0 dark'] = "#080808"
impulse_colors['world 1'] = "#034903"
impulse_colors['world 1 lite'] = "#046a04"
impulse_colors['world 1 bright'] = "#00ff00"
impulse_colors['world 1 dark'] = "#000d00"
impulse_colors['world 2'] = "#0020b0"//"rgb(0, 206, 209)"
impulse_colors['world 2 lite'] = "#0028dd"//"rgb(0, 206, 209)"
impulse_colors['world 2 bright'] = "#003DFF" //"#2474fe"
impulse_colors['world 2 dark'] = "#010310"//"rgb(0, 206, 209)"
impulse_colors['world 3'] = "#450555"
impulse_colors['world 3 lite'] = "#5f0775"
impulse_colors['world 3 dark'] = "#0f0013"
impulse_colors['world 3 bright'] = "#C000FF"//"#a00cc5"
impulse_colors['world 4'] = "#600"
impulse_colors['world 4 lite'] = "#a00"
impulse_colors['world 4 dark'] = "#180000"
impulse_colors['world 4 bright'] = "#f00"
impulse_colors["player_color"] = "rgb(32, 140, 231)"
impulse_colors["boss"] = "red"
impulse_colors["boss dark"] = "#900"
impulse_colors["boss 1"] = "#05c205"
impulse_colors["boss 2"] = "#002eff"
impulse_colors["boss 3"] = "#C000FF"
impulse_colors["boss 4"] = "#f00"

function set_key_bindings() {

  var type = imp_vars.player_data.options.control_hand +" "+imp_vars.player_data.options.control_scheme
  if(type == "left mouse") {
    imp_params.keys = {
      LEFT_KEY: 37,
      UP_KEY: 38,
      RIGHT_KEY: 39,
      DOWN_KEY: 40,
      PAUSE: 13,
      GOD_MODE_KEY: 71,
      SECONDARY_PAUSE: 27,
      GATEWAY_KEY: 16,
      MUTE_KEY: 88,
      FULLSCREEN_KEY: 67,
      EXIT_KEY: 39,
      SAVE_AND_QUIT_KEY: 37,
      RESTART_KEY: 16,
      QUIT_KEY: 39,
      EXIT_GAME_KEY: 37,
      RESUME_GAME_KEY: 39,
      DELETE_GAME_KEY: 40,
      NEXT_KEY: 13
    }
  } else if(type == "right mouse") {
    imp_params.keys = {
      LEFT_KEY: 65,
      UP_KEY: 87,
      RIGHT_KEY: 68,
      DOWN_KEY: 83,
      PAUSE: 81,
      GOD_MODE_KEY: 71,
      SECONDARY_PAUSE: 27,
      GATEWAY_KEY: 32,
      MUTE_KEY: 88,
      FULLSCREEN_KEY: 67,
      EXIT_KEY: 69,
      RESTART_KEY: 82,
      SAVE_AND_QUIT_KEY: 83,
      QUIT_KEY: 81,
      EXIT_GAME_KEY: 69,
      RESUME_GAME_KEY: 82,
      DELETE_GAME_KEY: 68,
      NEXT_KEY: 32
    }
  } else if(type == "right keyboard") {
    imp_params.keys = {
      LEFT_KEY: 37,
      UP_KEY: 38,
      RIGHT_KEY: 39,
      DOWN_KEY: 40,
      PAUSE: 81,
      GOD_MODE_KEY: 71,
      SECONDARY_PAUSE: 27,
      ILEFT_KEY: 65,
      IUP_KEY: 87,
      IRIGHT_KEY: 68,
      IDOWN_KEY: 83,
      GATEWAY_KEY: 32,
      MUTE_KEY: 88,
      FULLSCREEN_KEY: 67,
      EXIT_KEY: 69,
      RESTART_KEY: 82,
      SAVE_AND_QUIT_KEY: 83,
      QUIT_KEY: 81,
      EXIT_GAME_KEY: 69,
      RESUME_GAME_KEY: 82,
      DELETE_GAME_KEY: 68,
      NEXT_KEY: 32,
      ULTIMATE_KEY: 69
    }
  }
}

