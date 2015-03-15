var imp_vars = {
  step_id: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  sidebarWidth: 0,
  levelWidth: 0,
  levelHeight: 0,
  ctx: null,
  canvas: null,
  bg_canvas: null,
  bg_ctx: null,
  cur_popup_message: null,
  draw_factor: 15,
  last_time: 0,
  cur_game_state: null,
  cur_dialog_box: null,
  save_name: "impulse_save_data",
  player_data: {},
  impulse_music: null,
  minified: true,
  bg_opacity: 0.3,
  hive0_bg_opacity: 0.6 /* hive0 gets rendered differently, needs to be brighter */,
  switch_bg_duration: null,
  dark_one_speaks: false,
  last_tutorial_level: "HIVE 0-3"
};
imp_vars.debug = {
  god_mode_enabled: true,
  god_mode: false,
  dev: false,
  old_menu: false,
  story_mode: false,
  show_zero_level: false,
  is_beta: false,
  instant_victory_enabled: false,
  hide_pause_menu: false
};

if (window.location.host === 'localhost' && window.location.search.indexOf("dev=1") !== -1) {
  imp_vars.debug.dev = true;
}
if (window.location.pathname.indexOf("beta") !== -1) {
  imp_vars.debug.is_beta = true;
}

var imp_params = {

  tessellation_logo_factor: {
    "0": 1.4,
    "1": 1,
    "2": 1.4,
    "3": 1.4,
    "4": 1.6
  },
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
    "multi": "effects/multi",
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
    "dark_diag": "effects/dark_diag",
    "dark_anger": "effects/dark_anger",
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
  hive_names: {
    1: "HIVE OF HIDING",
    2: "HIVE OF EATING",
    3: "HIVE OF LAUGHING",
    4: "HIVE OF PURGING"
  },

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
impulse_colors['rose'] = "#ff66cc";
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
      MUTE_KEY: 77,
      FULLSCREEN_KEY: 70,
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
      MUTE_KEY: 77,
      FULLSCREEN_KEY: 70,
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
      MUTE_KEY: 77,
      FULLSCREEN_KEY: 70,
      EXIT_KEY: 69,
      RESTART_KEY: 82,
      SAVE_AND_QUIT_KEY: 83,
      QUIT_KEY: 81,
      EXIT_GAME_KEY: 69,
      RESUME_GAME_KEY: 82,
      DELETE_GAME_KEY: 68,
      NEXT_KEY: 32,
    }
  }
}

imp_params.spriteSheetData = {
  //x, y, w, h
  //"player_normal": [60, 0, 60, 60],
  "player_normal": [0, 0, 40, 40],
  // not sure why this offset is necessary...
  "player_red": [40, -1, 40, 40],
  "player_yellow": [80, 0, 41, 41],
  "player_gray": [120, 0, 41, 41],
  "player_green": [160, 0, 41, 41],
  "player_white": [200, 0, 40, 40],
  "spark": [0, 41, 40, 40],
  "multi": [0, 81, 40, 40],
  "white_glow": [40, 40, 100, 100],
  "white_gateway": [148, 41, 150, 150],
  "lives_icon": [0, 0, 40, 40],
  "sparks_icon": [0, 41, 40, 40],
  "white_flower": [0, 155, 42, 42],
  "blue_flower": [43, 155, 42, 42],
  "world1_starblank": [85, 199, 41, 38],
  "world1_starhalf": [127, 199, 19, 38],
  "world1_star": [127, 199, 41, 38],
  "world2_starblank": [85, 237, 41, 38],
  "world2_starhalf": [127, 237, 19, 38],
  "world2_star": [127, 237, 41, 38],
  "world3_starblank": [0, 199, 41, 38],
  "world3_starhalf": [42, 199, 19, 38],
  "world3_star": [42, 199, 41, 38],
  "world4_starblank": [0, 237, 41, 38],
  "world4_starhalf": [42, 237, 19, 38],
  "world4_star": [42, 237, 41, 38],
  "silver_trophy": [0, 277, 90, 78],
  "gold_trophy": [89, 277, 90, 78],
  "world1_timer": [189, 211, 48, 61],
  "world2_timer": [241, 211, 48, 61],
  "world3_timer": [189, 277, 48, 62],
  "world4_timer": [241, 277, 48, 62],
  "spark_powerup": [310, 6, 37, 36],
  "multi_powerup": [310, 58, 37, 36],
  "ult_powerup": [304, 105, 49, 48],
  "pink_one": [300, 201, 40, 40],
  "dark_one": [301, 240, 40, 41],
  "dark_aura": [300, 299, 100, 101],

  "immunitas_arm": [0, 0, 90, 90],
  "immunitas_arm_red": [150, 135, 90, 90],
  "immunitas_hand": [90, 0, 90, 90],
  "immunitas_hand_red": [240, 135, 90, 90],
  "immunitas_logo_gray": [330, 135, 90, 90],
  "immunitas_head": [0, 90, 108, 108],
  "immunitas_head_red": [450, 123, 108, 108],
  "immunitas_glow": [180, 0, 135, 135],
  "immunitas_red_glow": [315, 0, 135, 135],
  "immunitas_aura": [450, 0, 123, 123],
  "immunitas_aura_red": [573, 0, 123, 123],
  "immunitas_arrow": [0, 200, 70, 70],
  "immunitas_lockon" : [573, 123, 120, 120],

  "consumendi_head": [0, 0, 180, 180],
  "consumendi_head_red": [720, 136, 135, 135],
  "consumendi_aura": [181, 0, 269, 269],
  "consumendi_small_diamond": [94, 180, 30, 56],
  "consumendi_small_diamond_filled": [64, 180, 30, 56],
  "consumendi_small_arrow": [124, 180, 30, 16],
  "consumendi_glow": [720, 0, 135, 135],
  "consumendi_logo": [450, 0, 120, 119],
  "consumendi_mini": [450, 119, 120, 120],
  "consumendi_mini_gray": [570, 0, 120, 120],

  "negligentia_head": [0, 0, 180, 180],
  "negligentia_head_red": [0, 180, 180, 180],
  "negligentia_arm_striking": [180, 0, 244, 100],
  "negligentia_arm_striking_red": [180, 100, 244, 100],
  "negligentia_wheel": [424, 0, 134, 134],
  "negligentia_wheel_red": [424, 270, 134, 134],
  "negligentia_wheel_complete": [423, 135, 135, 135],
  "negligentia_glow": [560, 0, 115, 115],
  "negligentia_glow_red": [560, 115, 115, 115],
  "negligentia_aura": [559, 270, 39, 65],
  "negligentia_aura_open": [598, 270, 39, 65],
  "negligentia_arm_ring": [180, 200, 180, 180],
  "negligentia_logo": [680, 0, 120, 120],
  "negligentia_logo_gray": [680, 120, 120, 120],

  "adrogantia_attack_bud": [0, 0, 80, 80],
  "adrogantia_spawner": [0, 80, 80, 80],
  "adrogantia_body_bud": [80, 0, 80, 80],
  "adrogantia_attack_bud_firing": [80, 80, 80, 80],
  "adrogantia_body_bud_red": [80, 160, 80, 80],
  "adrogantia_head": [181, 1, 160, 160],
  "adrogantia_head_red": [181, 161, 160, 160],
  "adrogantia_glow": [340, 0, 135, 135],
  "adrogantia_logo": [476, 0, 125, 125],
  "adrogantia_logo_gray": [476, 125, 125, 125],
}

imp_params.tessellation_glow_map = {
  "0": "white_glow",
  "1": "immunitas_glow",
  "2": "consumendi_glow",
  "3": "negligentia_glow",
  "4": "adrogantia_glow"
}
imp_params.tessellation_logo_map = {
  "0": "white_gateway",
  "1": "immunitas_arm",
  "2": "consumendi_logo",
  "3": "negligentia_logo",
  "4": "adrogantia_logo"
}
imp_params.tessellation_gray_logo_map = {
  "0": "world_logo",
  "1": "immunitas_logo_gray",
  "2": "consumendi_mini_gray",
  "3": "negligentia_logo_gray",
  "4": "adrogantia_logo_gray"
}
