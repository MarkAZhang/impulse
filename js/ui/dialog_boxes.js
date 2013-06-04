var DialogBox = function() {

}

DialogBox.prototype.init = function(w, h) {
  this.w = w
  this.h = h
  this.x = canvasWidth/2
  this.y = canvasHeight/2
  this.buttons = []
  this.solid = true;
}
DialogBox.prototype.draw = function(ctx) {
  if(this.solid) {
    ctx.beginPath()
    ctx.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"
    ctx.stroke()
  }
  this.additional_draw(ctx)
}

DialogBox.prototype.additional_draw = function(ctx) {}

DialogBox.prototype.on_mouse_move = function(x, y) {}
DialogBox.prototype.on_mouse_down = function(x, y) {}
DialogBox.prototype.on_mouse_up = function(x, y) {}
DialogBox.prototype.on_click = function(x, y) {}
DialogBox.prototype.on_key_down = function(x, y) {}
DialogBox.prototype.on_key_up = function(x, y) {}

PauseMenu.prototype = new DialogBox()

PauseMenu.prototype.constructor = PauseMenu

function PauseMenu(level, world_num, game_numbers, game_state, visibility_graph) {
  this.level = level
  this.game_numbers = game_numbers
  this.game_state = game_state
  this.world_num = world_num
  this.level_name = this.level.level_name
  this.is_boss_level = this.level_name.slice(0, 4) == "BOSS"
  this.visibility_graph = visibility_graph
  this.init(500, 400)
  this.solid = false;
  this.shift_down = false
  this.bg_color = impulse_colors["world "+this.world_num +" dark"]
  this.lite_color = impulse_colors["world "+this.world_num +" lite"]

  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {

    if(!this.level.main_game) {

      this.restart_button = new SmallButton("RESTART", 25, this.x - 153, this.y - this.h/2 + 270, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
        _this.restart_practice()
      }}(this))
      this.buttons.push(this.restart_button)
      this.restart_button.underline_index = 0

      this.quit_button = new SmallButton("EXIT", 25, this.x + 170, this.y - this.h/2 + 270, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
        _this.quit_practice()
      }}(this))

      this.buttons.push(this.quit_button)
      this.quit_button.underline_index = 0

    } else {
      if(this.game_numbers.seconds < 5) {
        this.save_and_quit_button = new SmallButton("SAVE AND QUIT", 25, this.x - 108, this.y - this.h/2 + 270, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
          _this.save_and_quit_main_game()
        }}(this))
        this.save_and_quit_button.underline_index = 0
      } else {
        this.save_and_quit_button = new SmallButton("SAVE AND QUIT", 25, this.x - 108, this.y - this.h/2 + 270, 200, 50, "gray", "gray", function(_this) { return function() {
        }}(this))
      }

      this.buttons.push(this.save_and_quit_button)

      this.quit_button = new SmallButton("QUIT", 25, this.x + 170, this.y - this.h/2 + 270, 200, 50, this.lite_color, this.level.color, function(_this) { return function() {
        _this.quit_main_game()
      }}(this))
      this.buttons.push(this.quit_button)
      this.quit_button.underline_index = 0
      this.quit_button.shift_enabled = true
    }
  }
}

PauseMenu.prototype.additional_draw = function(ctx) {
  ctx.save()
  ctx.beginPath()
  ctx.textAlign = "center";
  ctx.font = '32px Muli';
  ctx.shadowColor = this.lite_color;
  ctx.shadowBlur = 10;
  ctx.fillStyle = this.lite_color;
  ctx.fillText("PAUSED", this.x, this.y - this.h/2 + 30)

  if(this.level_name.slice(0, 11) != "HOW TO PLAY")
    var temp_colors = ['world '+this.world_num+" lite", 'silver', 'gold']
    var score_names = ['GATEWAY SCORE', "SILVER SCORE", "GOLD SCORE"]
    var score_rewards = ['(OPENS NEXT LEVEL)', "(+1 LIFE)", "(5 LIVES OR +1 LIFE)"]

  if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    if(!this.is_boss_level) {
      for(var i = 0; i < 3; i++) {
        ctx.font = '24px Muli';
        ctx.textAlign = "right"
        ctx.fillStyle = impulse_colors[temp_colors[i]]
        ctx.shadowColor = ctx.fillStyle
        ctx.font = '30px Muli';
        ctx.fillText(impulse_level_data[this.level_name].cutoff_scores[player_data.difficulty_mode][i], this.x + 200, this.y - this.h/2 + 100 + 50 * i + 7)
        ctx.textAlign = "left"
        ctx.font = '24px Muli';
        ctx.fillText(score_names[i], this.x - 200, this.y - this.h/2 + 100 + 50 * i)
        ctx.font = '12px Muli'
        ctx.fillText(score_rewards[i], this.x - 200, this.y - this.h/2 + 100 + 50 * i+15)
      }
    }
    ctx.textAlign = "center";
    var score_color = 0

    if(!this.is_boss_level) {
      while(impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].high_score > impulse_level_data[this.level_name].cutoff_scores[player_data.difficulty_mode][score_color]) {
        score_color+=1
      }
    }

    /*ctx.font = '20px Muli';
    ctx.fillStyle = score_color > 0 ? impulse_colors[temp_colors[score_color - 1]] : "gray"
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("HIGH SCORE "+impulse_level_data[this.level_name].save_state[player_data.difficulty_mode].high_score, this.x, this.y - this.h/2 + 250)*/
  }
  ctx.font = '16px Muli'
  ctx.fillStyle = this.lite_color
  ctx.shadowColor = ctx.fillStyle
  ctx.fillText("'Q' TO RESUME", this.x, this.y - this.h/2 + 350)

  ctx.fill()

  if(this.game_numbers.seconds >= 5 && this.level.main_game) {
    ctx.font = '12px Muli'
    ctx.fillStyle = "gray"
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("ONLY BEFORE 0:05", this.x - 108, this.y - this.h/2 + 290)
  }


  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  ctx.restore()
}

PauseMenu.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    if(this.game_numbers.seconds >= 5 && this.buttons[i] == this.save_and_quit_button)
      continue
    this.buttons[i].on_mouse_move(x,y)
  }
}

PauseMenu.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x,y)
  }
}

PauseMenu.prototype.quit_practice = function() {
  switch_game_state(new GameOverState(this.game_numbers, this.level, this.game_state.world_num, this.visibility_graph))
  clear_dialog_box()
}
PauseMenu.prototype.restart_practice = function() {
  bg_ctx.translate(sidebarWidth, 0)//allows us to have a topbar
  this.level.impulse_game_state.gateway_unlocked = false
  this.level.draw_bg(bg_ctx)
  bg_ctx.translate(-sidebarWidth, 0)

  switch_game_state(new ImpulseGameState(this.game_state.world_num, this.level, this.visibility_graph))
  clear_dialog_box()
}

PauseMenu.prototype.quit_main_game = function() {
  switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, this.game_state.hive_numbers, null, null))
  clear_dialog_box()
}

PauseMenu.prototype.save_and_quit_main_game = function() {

  this.game_state.hive_numbers.sparks = this.game_state.hive_numbers.last_sparks
  this.game_state.hive_numbers.lives = this.game_state.hive_numbers.last_lives
  player_data.save_data[player_data.difficulty_mode] = this.game_state.hive_numbers
  save_game()
  switch_game_state(new MainGameSummaryState(this.game_state.world_num, false, null, null, null, true, true))
  clear_dialog_box()
}

PauseMenu.prototype.on_key_down = function(keyCode) {
   if(this.level_name.slice(0, 11) != "HOW TO PLAY") {
    if(!this.level.main_game) {
      if(keyCode == 69) { //E = EXIT
        this.quit_practice()
      }
      if(keyCode == 82) { //R = RESTART
        this.restart_practice()
      }
    } else {
      if(keyCode == 81 && this.shift_down) { //Q = QUIT
        this.quit_main_game()
      } else if(keyCode == 83) { //S = SAVE AND QUIT
        this.save_and_quit_main_game()
      }
    }
  }

  if(keyCode == 81 && !this.shift_down) { //SPACEBAR = RESUME
    clear_dialog_box()
    this.game_state.pause = false
  }
  if(keyCode == 16) {
    this.shift_down = true
  }

}

PauseMenu.prototype.on_key_up = function(keyCode) {
  if(keyCode == 16) {
    this.shift_down = false
  }
}

EnemyBox.prototype = new DialogBox()

EnemyBox.prototype.constructor = EnemyBox

function EnemyBox(enemy_name) {
  this.enemy_name = enemy_name
  this.max_enemy_d = 50
  this.special_ability = null
  this.other_notes = null

  this.seen = impulse_enemy_stats[this.enemy_name].seen

  this.w = 600
  var gravity = new b2Vec2(000, 000);
  var doSleep = false; //objects in our world will rarely go to sleep
  var world = new b2World(gravity, doSleep);

  var temp_enemy = new (impulse_enemy_stats[this.enemy_name].className)(world, 0, 0, 0, 0)

  this.def_value = Math.min(temp_enemy.body.m_mass/5.5, 1)

  this.atk_value = impulse_enemy_stats[this.enemy_name].attack_rating/10

  this.spd_value = ((impulse_enemy_stats[this.enemy_name].force/temp_enemy.body.m_mass)/impulse_enemy_stats[this.enemy_name].lin_damp)/.35

  if(this.enemy_name == "spear") this.spd_value = 1

}

EnemyBox.prototype.additional_draw = function(ctx) {

  if(this.special_ability == null) {
    this.special_ability = getLines(ctx, impulse_enemy_stats[this.enemy_name].special_ability, this.w - 20, '20px Muli')
  }
  if(this.other_notes == null && impulse_enemy_stats[this.enemy_name].other_notes != "") {
    this.other_notes = getLines(ctx, impulse_enemy_stats[this.enemy_name].other_notes, this.w - 20, '20px Muli')
  }

  if(this.special_ability != null && !this.h) {
    this.w = 600
    this.h = 340 + 25 * this.special_ability.length + this.other_notes.length * 25
    this.x = canvasWidth/2
    this.y = 50 + this.h/2
    this.buttons = []
  }


  ctx.beginPath()
  ctx.textAlign = "center"
  ctx.font = '20px Muli'
  ctx.fillStyle = "black"
  ctx.fillText(this.enemy_name.toUpperCase(), this.x, this.y - this.h/2 + 30)

  draw_enemy(ctx, this.enemy_name, this.x, this.y - this.h/2 + 90, this.max_enemy_d)

  ctx.fillStyle = "black"

  ctx.textAlign = 'left'

  ctx.fillText("ATK", this.x - this.w/4, this.y - this.h/2 + 155)

  draw_progress_bar(ctx, this.x, this.y - this.h/2 + 150, this.x/2, 15, this.atk_value, impulse_enemy_stats[this.enemy_name].color)

  ctx.fillStyle = "black"

  ctx.fillText("DEF", this.x - this.w/4, this.y - this.h/2 + 180)


  draw_progress_bar(ctx, this.x, this.y - this.h/2 + 175, this.x/2, 15, this.def_value, impulse_enemy_stats[this.enemy_name].color)

  ctx.fillStyle = "black"

  ctx.fillText("SPD", this.x - this.w/4, this.y - this.h/2 + 205)


  draw_progress_bar(ctx, this.x, this.y - this.h/2 + 200, this.x/2, 15, this.spd_value, impulse_enemy_stats[this.enemy_name].color)


  ctx.fillStyle = "black"

  ctx.fillText("DIES UPON PLAYER COLLISION", this.x - this.w * .30, this.y - this.h/2 + 245)

  ctx.textAlign = 'center'

  ctx.fillText("SPECIAL ABILITY", this.x, this.y - this.h/2 + 280)

  if (this.other_notes != null)
    ctx.fillText("OTHER NOTES", this.x, this.y - this.h/2 + 315 + 25 * this.special_ability.length)

  ctx.textAlign = 'right'

  ctx.fillText(impulse_enemy_stats[this.enemy_name].dies_on_impact, this.x + this.w * .30, this.y - this.h/2 + 245)


  ctx.beginPath()
  ctx.textAlign = 'center'
  ctx.font = '20px Muli'

  ctx.fillStyle = "black"
  for(var i = 0; i < this.special_ability.length; i++) {
    ctx.fillText(this.special_ability[i], this.x, this.y - this.h/2 + 305 + 25 * i)
  }

  if (this.other_notes != null) {
    for(var i = 0; i < this.other_notes.length; i++) {
      ctx.fillText(this.other_notes[i], this.x, this.y - this.h/2 + 340 + 25 * this.special_ability.length + 25 * i)
    }
  }


  ctx.font = '25px Muli'
  ctx.fillStyle = "white"
  ctx.fillText("CLICK TO CONTINUE", this.x, this.y + this.h/2 + 50 )

  ctx.fill()

}

EnemyBox.prototype.on_mouse_move = function(x, y) {
}

EnemyBox.prototype.on_click = function(x, y) {
  clear_dialog_box()
}

EnemyBox.prototype.on_key_down = function(keyCode) {

}
