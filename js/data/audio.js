imp_params.songs = {
  "Menu": "complex",
  "Interlude": "complex",
  "Hive 1": "kickit",
  "Hive 2": "breakthru",
  "Hive 3": "emergence",
  "Hive 4": "fire",
  "Tessellation": "driven",
  "Final Tessellation": "wicked"
};
imp_params.song_repeats = {
  "driven": 27.460,
  "wicked": 2.922
};
imp_params.sounds = {
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
};
imp_params.multisounds = {
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
};

for(var multisounds in imp_params.multisounds) {
  imp_params.sounds[multisounds] = imp_params.multisounds[multisounds].file
}

