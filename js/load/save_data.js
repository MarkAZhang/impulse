// These need to be explicitly named because the values can change across minifications.
var default_options = {
  'effects_mute': false,
  'bg_music_mute': false,
  'effects_volume': 100,
  'bg_music_volume': 100,
  'explosions': true,
  'score_labels': true,
  'progress_circle': false,
  'multiplier_display': false,
  'impulse_shadow': true,
  'speed_run_countdown': false,
  'control_hand': 'right',
  'control_scheme': 'mouse',
}

function isValidOptionValue (optionName, optionValue) {
  if (['bg_music_volume', 'effects_volume'].indexOf(optionName) !== -1) {
    return typeof optionValue === 'number';
  } else if (['explosions', 'score_labels', 'progress_circle', 'multiplier_display',
    'impulse_shadow', 'speed_run_countdown', 'effects_mute', 'bg_music_mute'].indexOf(optionName) !== -1) {
    return typeof optionValue === 'boolean'
  } else if (optionName === 'control_hand') {
    return ['right', 'left'].indexOf(optionValue) !== -1;
  } else if (optionName === 'control_scheme') {
    return ['mouse', 'keyboard'].indexOf(optionValue) !== -1;
  } else {
    return false;
  }
}

var save_data = {};

save_data.load_game = function() {
  var load_obj = {}
  if(localStorage[imp_params.save_name]===undefined || localStorage[imp_params.save_name] === null) {
    imp_params.player_data.first_time = true
    send_logging_to_server('STARTED GAME', {});
    load_obj["difficulty_mode"] = "easy"
  }
  else {
    load_obj = JSON.parse(localStorage[imp_params.save_name])
    imp_params.player_data.first_time = load_obj['first_time'] == false? false: true
  }

  if (load_obj['hard_mode_unlocked'] !== undefined) {
    imp_params.player_data.hard_mode_unlocked = load_obj['hard_mode_unlocked'];
    if (!imp_params.player_data.hard_mode_unlocked) {
      imp_params.player_data.difficulty_mode = "easy";
    }
  } else {
    // if we don't have a value, but the player has beaten world 4, then it should be unlocked.
    imp_params.player_data.hard_mode_unlocked = false;
    if (imp_params.player_data.world_rankings &&
        imp_params.player_data.world_rankings["easy"] &&
        imp_params.player_data.world_rankings["easy"]["world 4"] !== undefined) {
      imp_params.player_data.hard_mode_unlocked = true;
    }
  }

  if(!load_obj['levels']) {
    load_obj['levels'] = {}
  }

  if(!load_obj['enemies_seen']) {
    load_obj['enemies_seen'] = {}
  }

  if(!load_obj['enemies_killed']) {
    load_obj['enemies_killed'] = {}
  }

  if(!load_obj['world_rankings']) {
    load_obj['world_rankings'] = {
        'easy': {},
        'normal': {}
    }
  }

  if(!load_obj['options']) {
    //default options
    load_obj['options'] = {}
  }

  if(!load_obj['quests']) {
    load_obj['quests'] = []
  }

  for(var option in default_options) {
    if(!load_obj['options'].hasOwnProperty(option)) {
      load_obj['options'][option] = default_options[option]
    }
  }

  for (var option in load_obj['options']) {
    // Remove extraneous or obsolete options from load object.
    if(!default_options.hasOwnProperty(option)) {
      delete default_options[option];
    }
    // Verify load object options are valid. Replace with default if not.
    else if(!isValidOptionValue(option, load_obj['options'][option])) {
      load_obj['options'][option] = default_options[option];
    }
  }

  if(!load_obj['save_data']) {
    load_obj['save_data'] = {
      "easy": {},
      "normal": {}
    }
  }

  imp_params.player_data.save_data = load_obj['save_data']

  imp_params.player_data.difficulty_mode = load_obj['difficulty_mode'] ? load_obj['difficulty_mode'] : "normal";
  imp_params.player_data.total_kills = load_obj['total_kills'] ? load_obj['total_kills'] : 0
  imp_params.player_data.tutorial_shown = load_obj['tutorial_shown'] ? load_obj['tutorial_shown'] : [];
  imp_params.player_data.options = {
    effects_volume: load_obj['options']['effects_volume'],
    effects_mute: load_obj['options']['effects_mute'],
    bg_music_volume: load_obj['options']['bg_music_volume'],
    bg_music_mute: load_obj['options']['bg_music_mute'],
    explosions: load_obj['options']['explosions'],
    score_labels: load_obj['options']['score_labels'],
    progress_circle: load_obj['options']['progress_circle'],
    multiplier_display: load_obj['options']['multiplier_display'],
    impulse_shadow: load_obj['options']['impulse_shadow'],
    speed_run_countdown: load_obj['options']['speed_run_countdown'],
    control_hand: load_obj['options']['control_hand'],
    control_scheme: load_obj['options']['control_scheme']
  };
  imp_params.player_data.quests = load_obj["quests"]
  load_level_data("easy", load_obj)
  load_level_data("normal", load_obj)

  imp_params.player_data.world_rankings = load_obj['world_rankings']

  for(i in imp_params.impulse_enemy_stats) {
    //load if enemies are seen
    imp_params.impulse_enemy_stats[i].seen = load_obj['enemies_seen'][i] ? load_obj['enemies_seen'][i] : 0
    imp_params.impulse_enemy_stats[i].kills = load_obj['enemies_killed'][i] ? load_obj['enemies_killed'][i] : 0
  }
}

function load_level_data(difficulty_level, load_obj) {
  for(i in imp_params.impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(typeof(imp_params.impulse_level_data[i].save_state) === "undefined") {
        imp_params.impulse_level_data[i].save_state = {}
      }
      imp_params.impulse_level_data[i].save_state[difficulty_level] = {}
      if(load_obj['levels'].hasOwnProperty(i) && load_obj['levels'][i]["save_state"] && load_obj['levels'][i]["save_state"][difficulty_level] ) {
        imp_params.impulse_level_data[i].save_state[difficulty_level].high_score = load_obj['levels'][i]["save_state"][difficulty_level]["high_score"]
        imp_params.impulse_level_data[i].save_state[difficulty_level].seen = load_obj['levels'][i]["save_state"][difficulty_level]["seen"]
        imp_params.impulse_level_data[i].save_state[difficulty_level].best_time = load_obj['levels'][i]["save_state"][difficulty_level]["best_time"]
      }
      else {
        imp_params.impulse_level_data[i].save_state[difficulty_level].high_score = 0
        imp_params.impulse_level_data[i].save_state[difficulty_level].seen = false
        imp_params.impulse_level_data[i].save_state[difficulty_level].best_time = 1000
      }
    }
  }
};

save_data.save_game = function () {
  var save_obj = {}
  save_obj['levels'] = {}
  save_data.save_level_data('easy', save_obj)
  save_data.save_level_data('normal', save_obj)
  save_obj['enemies_seen'] = {}
  save_obj['enemies_killed'] = {}
  for(i in imp_params.impulse_enemy_stats) {
    save_obj['enemies_seen'][i] = imp_params.impulse_enemy_stats[i].seen
    save_obj['enemies_killed'][i] = imp_params.impulse_enemy_stats[i].kills
  }
  save_obj['total_kills'] = imp_params.player_data.total_kills
  save_obj['difficulty_mode'] = imp_params.player_data.difficulty_mode
  save_obj['world_rankings'] = imp_params.player_data.world_rankings
  save_obj['save_data'] = imp_params.player_data.save_data
  save_obj['options'] = {
    'effects_volume': imp_params.player_data.options.effects_volume,
    'effects_mute': imp_params.player_data.options.effects_mute,
    'bg_music_volume': imp_params.player_data.options.bg_music_volume,
    'bg_music_mute': imp_params.player_data.options.bg_music_mute,
    'explosions': imp_params.player_data.options.explosions,
    'score_labels': imp_params.player_data.options.score_labels,
    'progress_circle': imp_params.player_data.options.progress_circle,
    'multiplier_display': imp_params.player_data.options.multiplier_display,
    'impulse_shadow': imp_params.player_data.options.impulse_shadow,
    'speed_run_countdown': imp_params.player_data.options.speed_run_countdown,
    'control_hand': imp_params.player_data.options.control_hand,
    'control_scheme': imp_params.player_data.options.control_scheme
  };
  save_obj['first_time'] = imp_params.player_data.first_time
  save_obj['hard_mode_unlocked'] = imp_params.player_data.hard_mode_unlocked;
  save_obj['tutorial_shown'] = imp_params.player_data.tutorial_shown;
  save_obj['quests'] = imp_params.player_data.quests
  localStorage[imp_params.save_name] = JSON.stringify(save_obj)
};


save_data.save_level_data = function(difficulty_level, save_obj) {
  for(i in imp_params.impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(!(save_obj['levels'].hasOwnProperty(i))) {
        save_obj['levels'][i] = {}
        save_obj['levels'][i]["save_state"] = {}
      }

      save_obj['levels'][i]["save_state"][difficulty_level] = {}
      save_obj['levels'][i]["save_state"][difficulty_level]["high_score"] = imp_params.impulse_level_data[i].save_state[difficulty_level].high_score
      save_obj['levels'][i]["save_state"][difficulty_level]["best_time"] = imp_params.impulse_level_data[i].save_state[difficulty_level].best_time
      save_obj['levels'][i]["save_state"][difficulty_level]["seen"] = imp_params.impulse_level_data[i].save_state[difficulty_level].seen
    }
  }
};
