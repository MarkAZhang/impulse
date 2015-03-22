var saveData = require('../load/save_data.js');

var CheckBox = require('../ui/checkbox.js');
var ImpulseButton = require('../ui/impulse_button.js');

SelectDifficultyButton.prototype = new ImpulseButton()

SelectDifficultyButton.prototype.constructor = SelectDifficultyButton

function SelectDifficultyButton(size, x, y, w, h, color, hcolor, world_map_state) {

  this.size = size
  this.real_size = size
  this.init(x, y, w, h, this.on_adjust_difficulty, false, color)

  this.hover_color = hcolor
  this.shadow = false;
  this.active = true
  this.bg_color = null//"black"

  this.checkbox = new CheckBox(this.x, this.y - this.h/8, 20, 20, this.color);
  this.world_map_state = world_map_state;
  this.recalculate_state();
}

SelectDifficultyButton.prototype.on_adjust_difficulty = function() {
  saveData.difficultyMode = saveData.difficultyMode == "easy" ? "normal" : "easy";
  saveData.saveGame();
  this.world_map_state.update_on_difficulty_change(saveData.difficultyMode);
  this.recalculate_state();
}

SelectDifficultyButton.prototype.recalculate_state = function() {
  this.checkbox.checked = saveData.difficultyMode == "normal";
}

SelectDifficultyButton.prototype.additional_draw = function(ctx) {
  this.checkbox.draw(ctx);
  ctx.textAlign = 'center'
  ctx.font = this.size+'px Muli';
  ctx.fillStyle = this.color
  ctx.fillText("HARD MODE", this.x, this.y + this.h/3)
}

module.exports = SelectDifficultyButton;
