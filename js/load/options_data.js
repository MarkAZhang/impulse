// These need to be explicitly named because the values can change across minifications.
var defaultOptions = {
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
};

var OptionsData = function () {

};

OptionsData.prototype.loadOptionsFromObj = function (saveObj) {

  if (!saveObj) {
    saveObj = {};
  }

  // Set default values in loaded options.
  for(var option in defaultOptions) {
    if(!saveObj.hasOwnProperty(option)) {
      saveObj[option] = defaultOptions[option]
    }
  }
  for (var option in saveObj) {
    // Remove extraneous or obsolete options.
    if(!defaultOptions.hasOwnProperty(option)) {
      delete defaultOptions[option];
    }
    // Verify loaded options are valid. Replace with default if not.
    else if(!this.isValidOptionValue(option, saveObj[option])) {
      saveObj[option] = defaultOptions[option];
    }
  }

  this.effects_volume = saveObj['effects_volume'];
  this.effects_mute = saveObj['effects_mute'];
  this.bg_music_volume = saveObj['bg_music_volume'];
  this.bg_music_mute = saveObj['bg_music_mute'];
  this.explosions = saveObj['explosions'];
  this.score_labels = saveObj['score_labels'];
  this.progress_circle = saveObj['progress_circle'];
  this.multiplier_display = saveObj['multiplier_display'];
  this.impulse_shadow = saveObj['impulse_shadow'];
  this.speed_run_countdown = saveObj['speed_run_countdown'];
  this.control_hand = saveObj['control_hand'];
  this.control_scheme = saveObj['control_scheme'];
}

OptionsData.prototype.createSaveObj = function () {
  return {
    'effects_volume': this.effects_volume,
    'effects_mute': this.effects_mute,
    'bg_music_volume': this.bg_music_volume,
    'bg_music_mute': this.bg_music_mute,
    'explosions': this.explosions,
    'score_labels': this.score_labels,
    'progress_circle': this.progress_circle,
    'multiplier_display': this.multiplier_display,
    'impulse_shadow': this.impulse_shadow,
    'speed_run_countdown': this.speed_run_countdown,
    'control_hand': this.control_hand,
    'control_scheme': this.control_scheme
  };
}

OptionsData.prototype.isValidOptionValue = function (optionName, optionValue) {
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
