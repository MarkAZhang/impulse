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
  }
}

for(var multisounds in imp_vars.multisounds) {
  imp_vars.sounds[multisounds] = imp_vars.multisounds[multisounds].file
}

impulse_colors = {}
impulse_colors['bronze'] = "rgb(205, 127, 50)"
impulse_colors['silver'] = "rgb(175, 175, 175)"
//impulse_colors['impulse_silver'] = "rgba(175, 175, 175, 0.4)"
impulse_colors['impulse_target_blue'] = "rgba(0, 128, 255, 0.2)"
impulse_colors['impulse_blue'] = "rgb(0, 128, 255)"
impulse_colors['gold'] = "rgb(238, 201, 0)"
impulse_colors['world 1'] = "#034903"
impulse_colors['world 1 lite'] = "#046a04"
impulse_colors['world 1 dark'] = "#001100"
impulse_colors['world 2'] = "#0e1c5b"//"rgb(0, 206, 209)"
impulse_colors['world 2 lite'] = "#132578"//"rgb(0, 206, 209)"
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