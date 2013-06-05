var imp_vars = {
  songs : {
    "Menu": "kreepor",
    "Interlude": "hall",
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
    "pdeath": "effects/pdeath"

  },
  multisounds: {
    "sdeath": {
      file: "effects/sdeath",
      maxnum: 4
    }
  },
  bg: {
    "Hive 1": "bg/hive1",
    "Hive 2": "bg/hive2",
    "Hive 3": "bg/hive3",
    "Hive 4": "bg/hive4"
  },
  keys: {

  }
}

for(var multisounds in imp_vars.multisounds) {
  imp_vars.sounds[multisounds] = imp_vars.multisounds[multisounds].file
}

impulse_colors = {}
impulse_colors['bronze'] = "#cc8032"
impulse_colors['silver'] = "#b0b0b0"
//impulse_colors['impulse_silver'] = "rgba(175, 175, 175, 0.4)"
impulse_colors['impulse_target_blue'] = "rgba(0, 128, 255, 0.2)"
impulse_colors['impulse_blue'] = "rgb(0, 128, 255)"
impulse_colors['impulse_blue_dark'] = "#13527e"
impulse_colors['gold'] = "#edb900"

impulse_colors['world 0'] = "#333"
impulse_colors['world 0 lite'] = "#555"
impulse_colors['world 0 bright'] = "#ccc"
impulse_colors['world 0 dark'] = "#080808"
impulse_colors['world 1'] = "#034903"
impulse_colors['world 1 lite'] = "#046a04"
impulse_colors['world 1 bright'] = "#21f721"
impulse_colors['world 1 dark'] = "#001100"
impulse_colors['world 2'] = "#0e1c5b"//"rgb(0, 206, 209)"
impulse_colors['world 2 lite'] = "#132578"//"rgb(0, 206, 209)"
impulse_colors['world 2 bright'] = "#2140d0"
impulse_colors['world 2 dark'] = "#010310"//"rgb(0, 206, 209)"
impulse_colors['world 3'] = "#450555"
impulse_colors['world 3 lite'] = "#5f0775"
impulse_colors['world 3 dark'] = "#0f0013"
impulse_colors['world 4'] = "600"
impulse_colors['world 4 lite'] = "#800"
impulse_colors['world 4 dark'] = "#200"
impulse_colors["player_color"] = "rgb(32, 140, 231)"
impulse_colors["boss"] = "red"
impulse_colors["boss dark"] = "#900"
impulse_colors["boss 1"] = "#05c205"
impulse_colors["boss 2"] = "#002eff"

function set_key_bindings() {

  var type = player_data.options.control_hand +" "+player_data.options.control_scheme

  if(type == "left mouse") {
    imp_vars.keys = {
      "LEFT_KEY": 37,
      "UP_KEY": 38,
      "RIGHT_KEY": 39,
      "DOWN_KEY": 40,
      "PAUSE": 17,
      "GATEWAY_KEY": 13,
      "MUTE_KEY": 77
    }
  } else if(type == "right mouse") {
    imp_vars.keys = {
      "LEFT_KEY": 65,
      "UP_KEY": 87,
      "RIGHT_KEY": 68,
      "DOWN_KEY": 83,
      "PAUSE": 81,
      "GATEWAY_KEY": 32,
      "MUTE_KEY": 88
    }
  } else if(type == "right keyboard") {
    imp_vars.keys = {
      "LEFT_KEY": 65,
      "UP_KEY": 87,
      "RIGHT_KEY": 68,
      "DOWN_KEY": 83,
      "PAUSE": 81,
      "ILEFT_KEY": 37,
      "IUP_KEY": 38,
      "IRIGHT_KEY": 39,
      "IDOWN_KEY": 40,
      "GATEWAY_KEY": 32,
      "MUTE_KEY": 88
    }
  }
}

