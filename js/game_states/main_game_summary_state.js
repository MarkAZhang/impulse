MainGameSummaryState.prototype = new GameState

MainGameSummaryState.prototype.constructor = MainGameSummaryState

MainGameSummaryState.prototype.rank_cutoffs = {
    "F": 0,
    "D": 10,
    "D+": 11,
    "C-": 13,
    "C": 14,
    "C+": 15,
    "B-": 16,
    "B": 17,
    "B+": 18,
    "A-": 20,
    "A": 21,
    "A+": 22,
    "S": 24
  }

function MainGameSummaryState(world_num, victory, hive_numbers, level, visibility_graph, save_screen, just_saved) {

  this.just_saved = just_saved
  this.save_screen = save_screen
  this.buttons = []
  this.bg_drawn = false
  this.hive_numbers = hive_numbers
  this.level = level
  this.visibility_graph = visibility_graph
  this.world_num = world_num
  this.victory = victory

  if(save_screen) {
    this.hive_numbers = player_data.save_data[player_data.difficulty_mode]
    this.world_num = this.hive_numbers.world
    this.victory = false
  }

  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.buttons = []

  this.rank = "F"

  this.shift_held = false
  this.ctrl_held = false

  this.rank_color = "red"

  if(victory) {
    this.victory_text = this.hive_numbers.boss_name+" DEFEATED"

    var total_stars = 0
    for(level in hive_numbers.game_numbers) {
      total_stars += hive_numbers.game_numbers[level].stars
    }

    if(!hive_numbers.continues) {
      for(rank in this.rank_cutoffs) {
        if(this.rank_cutoffs[rank] <= total_stars){
          this.rank = rank;
        } else {
          break
        }
      }
      this.rank_color = this.get_rank_color(total_stars, world_num)
    } else {
      this.rank_color = "red"
    }

    if(!this.rank_cutoffs[player_data.world_rankings[player_data.difficulty_mode]["world "+this.world_num]] ||
      this.rank_cutoffs[this.rank] > this.rank_cutoffs[player_data.world_rankings[player_data.difficulty_mode]["world "+this.world_num]]) {
      player_data.world_rankings[player_data.difficulty_mode]["world "+this.world_num] = this.rank
      save_game()
    }
  }



  this.color = impulse_colors["world "+this.world_num]
  this.lite_color = impulse_colors["world "+this.world_num+" lite"]
  this.bright_color = impulse_colors["world "+this.world_num+" bright"]
  this.dark_color = impulse_colors["world "+this.world_num+" dark"]
  var _this = this;

  if(this.save_screen && !this.just_saved) {
    this.resume_button = new SmallButton("RESUME", 20, levelWidth - 115, levelHeight - 30, 200, 50, this.bright_color, this.color, function(_this) { return function() {
      _this.resume_game()
    }}(this))
    this.resume_button.shadow = false
    if(player_data.options.control_hand == "right") {
      this.resume_button.underline_index = 0
    } else {
      this.resume_button.extra_text = "RIGHT ARROW"
      this.resume_button.dim_extra_text = true
    }
    this.buttons.push(this.resume_button)

    this.delete_button = new SmallButton("DELETE", 20, levelWidth/2, levelHeight - 30, 200, 50, this.bright_color, this.color, function(_this) { return function() {
      _this.delete_game()
    }}(this))
    this.buttons.push(this.delete_button)
    this.delete_button.shadow = false
    if(player_data.options.control_hand == "right") {
      this.delete_button.underline_index = 0
    } else {
      this.delete_button.extra_text = "SHIFT + DOWN ARROW"
      this.delete_button.dim_extra_text = true
    }
    this.delete_button.shift_enabled = true

    this.return_to_main_button = new SmallButton("EXIT", 20, 100, levelHeight - 30, 200, 50, this.bright_color, this.color, function(_this) { return function() {
      _this.exit_game()
    }}(this))

    this.buttons.push(this.return_to_main_button)
    this.return_to_main_button.shadow = false
    if(player_data.options.control_hand == "right") {
      this.return_to_main_button.underline_index = 0
    } else {
      this.return_to_main_button.extra_text = "LEFT ARROW"
      this.return_to_main_button.dim_extra_text = true

    }
  }

  impulse_music.stop_bg()
  this.star_colors = ["bronze", "silver", "gold"]
}

MainGameSummaryState.prototype.get_rank_color = function(stars, world_num) {
    if(stars >= this.rank_cutoffs["S"]) {
      return impulse_colors["impulse_blue"]
    }
    if(stars >= this.rank_cutoffs["B-"]) {
      return impulse_colors["world "+world_num+" bright"]
    }

    if(stars >= this.rank_cutoffs["C-"]) {
      return impulse_colors["world "+world_num+" bright"]
    }
    return "red"
}

MainGameSummaryState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "display:none" )
    this.bg_drawn = true
  }

  ctx.save()
  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
    }
    if(this.transition_state == "out") {
      if(this.victory)
        switch_game_state(new TitleState(true))
      else if(this.level) {
        this.hive_numbers.continue()
        switch_game_state(new MainGameTransitionState(this.world_num, this.level, this.victory, null, this.visibility_graph, this.hive_numbers))
      } else {
        switch_game_state(new TitleState(true))
      }
    }
  }



  ctx.fillStyle = this.dark_color
  ctx.fillRect(0, 0, levelWidth, levelHeight)
  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  ctx.globalAlpha *= 0.3
  draw_tessellation_sign(ctx, this.world_num, levelWidth/2, 130, 150)
  ctx.globalAlpha /= 0.3

  ctx.shadowBlur = 20;

  ctx.textAlign = 'center'


  ctx.font = '20px Muli'
  if(this.victory) {
    ctx.fillStyle = impulse_colors["impulse_blue"]
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText(this.victory_text , levelWidth/2, 90)
  }
  else if(this.save_screen) {
    ctx.fillStyle = impulse_colors["impulse_blue"]
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("GAME SAVED" , levelWidth/2, 90)
  } else {
    ctx.fillStyle = 'red'
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("YOU ARE DEFEATED", levelWidth/2, 80)
  }

  ctx.fillStyle = this.bright_color;
  ctx.shadowColor = ctx.fillStyle
  ctx.font = '40px Muli'
  ctx.fillText(this.hive_numbers.hive_name, levelWidth/2, 130)

  if(this.victory && this.hive_numbers.continues) {
    ctx.fillStyle = "red";
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '10px Muli'
    ctx.fillText("CONTINUES: "+this.hive_numbers.continues, levelWidth/2, 255)
  }

  if(this.victory) {

    ctx.fillStyle = this.bright_color
    ctx.font = '18px Muli'
    ctx.shadowColor = ctx.fillStyle
    ctx.fillText("RANK", levelWidth/2, 167)
    ctx.fillStyle = this.rank_color
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '84px Muli'
    ctx.fillText(this.rank, levelWidth/2, 235)
  } else if(this.save_screen) {
    ctx.fillStyle = impulse_colors["impulse_blue"]
    ctx.shadowColor = ctx.fillStyle
    ctx.font = '16px Muli'
    ctx.fillText("LIVES: "+Math.floor(this.hive_numbers.lives), levelWidth/2, 167)
    ctx.fillText("SPARKS: "+Math.floor(this.hive_numbers.sparks), levelWidth/2, 190)
    if(this.hive_numbers.continues) {
      ctx.fillStyle = "red"
      ctx.shadowColor = ctx.fillStyle
      ctx.fillText("CONTINUES: "+Math.floor(this.hive_numbers.continues), levelWidth/2, 213)
    }
  }


  ctx.shadowBlur = 0

  ctx.font = '18px Muli'
  ctx.textAlign = 'center'

  var y = 290
  ctx.fillStyle = this.lite_color;

  ctx.fillText("LEVEL",150, y)
  ctx.fillText("SCORE", 270, y)
  ctx.fillText("TIME", 390, y)
  ctx.fillText("COMBO", 510, y)
  ctx.fillText("DEATHS", 630, y)

  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

    var real_title = title;
    if(i==7) {
      real_title = this.hive_numbers.boss_name;
    }
    if(this.hive_numbers.game_numbers[title]) {
      var gn = this.hive_numbers.game_numbers[title];
    } else {
      var gn = {}
    }
    ctx.fillStyle = gn.visited ? this.lite_color : "#333";
    var y = 320 + 30 * i;
    ctx.fillText(real_title,150, y)

    if(gn.score != undefined) {
      if(gn.stars > 0) {
        ctx.fillStyle = impulse_colors[this.star_colors[gn.stars - 1]]
      }
      ctx.fillText(gn.score, 270, y)
    } else {
      ctx.fillText('---', 270, y)
    }
    ctx.fillStyle = gn.visited ? this.lite_color : "#333";
    if(gn.last_time != undefined)
      ctx.fillText(gn.last_time, 390, y)
    else {
      ctx.fillText('---', 390, y)
    }
    if(gn.combo != undefined)
      ctx.fillText(gn.combo, 510, y)
    else {
      ctx.fillText('---', 510, y)
    }
    if(gn.deaths != undefined)
      ctx.fillText(gn.deaths, 630, y)
    else {
      ctx.fillText('---', 630, y)
    }
  }

  ctx.font = '20px Muli'
  ctx.fillStyle = this.lite_color
  if(this.save_screen) {
    if(this.just_saved)
      ctx.fillText("PRESS ANY KEY FOR MAIN MENU", levelWidth/2, levelHeight - 30)
  } else if(this.victory)
    ctx.fillText("PRESS ANY KEY FOR MAIN MENU", levelWidth/2, levelHeight - 30)
  else if(this.level) {
    ctx.fillText("PRESS ANY KEY TO CONTINUE", levelWidth/2, levelHeight - 30)
  } else {
    ctx.fillText("PRESS ANY KEY FOR MAIN MENU", levelWidth/2, levelHeight - 30)
  }
  ctx.restore()

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }

}

MainGameSummaryState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

MainGameSummaryState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

MainGameSummaryState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

MainGameSummaryState.prototype.on_key_down = function(keyCode) {

  if(this.save_screen && !this.just_saved) {
    if(keyCode == imp_vars.keys.EXIT_GAME_KEY) {
      this.exit_game()
    } else if(keyCode == imp_vars.keys.DELETE_GAME_KEY && this.shift_held) {
      this.delete_game()
    } else if(keyCode == imp_vars.keys.RESUME_GAME_KEY && !this.ctrl_held) {
      this.resume_game()
    }
  } else{
    if(this.transition_state=="none") {
      this.transition_state="out";
      this.transition_timer = this.transition_interval
    }
  }
  if(keyCode == 16) {
    this.shift_held= true
  }
  if(keyCode == 17) {
    this.ctrl_held = true
  }
}
MainGameSummaryState.prototype.on_key_up = function(keyCode) {
  if(keyCode == 16) {
    this.shift_held= false
  }
  if(keyCode == 17) {
    this.ctrl_held = false
  }
}

MainGameSummaryState.prototype.process = function(dt) {

}

MainGameSummaryState.prototype.resume_game = function() {
  player_data.save_data[player_data.difficulty_mode] = {}
  save_game()
  switch_game_state(new MainGameTransitionState(this.world_num, null, false, null, null, this.hive_numbers, true))
}

MainGameSummaryState.prototype.delete_game = function() {
  player_data.save_data[player_data.difficulty_mode] = {}
  save_game()
  switch_game_state(new WorldMapState())
}

MainGameSummaryState.prototype.exit_game = function() {
  switch_game_state( new TitleState(true))
}