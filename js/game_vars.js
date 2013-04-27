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
  }
}

for(var multisounds in imp_vars.multisounds) {
  imp_vars.sounds[multisounds] = imp_vars.multisounds[multisounds].file
}
