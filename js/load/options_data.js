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
  this.effects_volume = 100;
  this.effects_mute = false;
  this.bg_music_volume = 100;
  this.bg_music_mute = false;
  this.explosions = true;
  this.score_labels = true;
  this.progress_circle = false;
  this.multiplier_display = false;
  this.impulse_shadow = true;
  this.speed_run_countdown = false;
  this.control_hand = 'right';
  this.control_scheme = 'mouse';
};

OptionsData.prototype.loadOptionsFromObj = function (saveObj) {

  if (!saveObj) {
    saveObj = {};
  }

  if (this.isValidOptionValue(saveObj, 'effects_volume')) {
    this.effects_volume = saveObj['effects_volume'];
  }
  if (this.isValidOptionValue(saveObj, 'effects_mute')) {
    this.effects_mute = saveObj['effects_mute'];
  }
  if (this.isValidOptionValue(saveObj, 'bg_music_volume')) {
    this.bg_music_volume = saveObj['bg_music_volume'];
  }
  if (this.isValidOptionValue(saveObj, 'bg_music_mute')) {
    this.bg_music_mute = saveObj['bg_music_mute'];
  }
  if (this.isValidOptionValue(saveObj, 'explosions')) {
    this.explosions = saveObj['explosions'];
  }
  if (this.isValidOptionValue(saveObj, 'score_labels')) {
    this.score_labels = saveObj['score_labels'];
  }
  if (this.isValidOptionValue(saveObj, 'progress_circle')) {
    this.progress_circle = saveObj['progress_circle'];
  }
  if (this.isValidOptionValue(saveObj, 'multiplier_display')) {
    this.multiplier_display = saveObj['multiplier_display'];
  }
  if (this.isValidOptionValue(saveObj, 'impulse_shadow')) {
    this.impulse_shadow = saveObj['impulse_shadow'];
  }
  if (this.isValidOptionValue(saveObj, 'speed_run_countdown')) {
    this.speed_run_countdown = saveObj['speed_run_countdown'];
  }
  if (this.isValidOptionValue(saveObj, 'control_hand')) {
    this.control_hand = saveObj['control_hand'];
  }
  if (this.isValidOptionValue(saveObj, 'control_scheme')) {
    this.control_scheme = saveObj['control_scheme'];
  }
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

OptionsData.prototype.isValidOptionValue = function (obj, optionName) {
  var optionValue = obj[optionName];
  if (optionValue === undefined) {
    return false;
  }
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

module.exports = OptionsData;
