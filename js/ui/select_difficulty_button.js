SelectDifficultyButton.prototype = new ImpulseButton()

SelectDifficultyButton.prototype.constructor = SelectDifficultyButton

function SelectDifficultyButton(size, x, y, w, h, color, hcolor) {

  this.size = size
  this.real_size = size
  this.init(x, y, w, h, this.on_adjust_difficulty, false, color)
  
  this.hover_color = hcolor
  this.shadow = false;
  this.active = true
  this.bg_color = null//"black"

  this.checkbox = new CheckBox(this.x, this.y - this.h/8, 20, 20, this.color);
  this.recalculate_state();
}

SelectDifficultyButton.prototype.on_adjust_difficulty = function() {
  imp_vars.player_data.difficulty_mode = imp_vars.player_data.difficulty_mode == "easy" ? "normal" : "easy";
  save_game();

  this.recalculate_state();
}

SelectDifficultyButton.prototype.recalculate_state = function() {
  this.checkbox.checked = imp_vars.player_data.difficulty_mode == "normal";
}

SelectDifficultyButton.prototype.additional_draw = function(ctx) {
  this.checkbox.draw(ctx);
  ctx.textAlign = 'center'
  ctx.font = this.size+'px Muli';
  ctx.fillStyle = this.color
  ctx.fillText("HARD MODE", this.x, this.y + this.h/3)
}