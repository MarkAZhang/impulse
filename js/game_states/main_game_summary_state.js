MainGameSummaryState.prototype = new GameState

MainGameSummaryState.prototype.constructor = MainGameSummaryState

// Kept for the purpose of converting old ranks to the new victory type.
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
    "S": 24,
    "S+": 25 //special
  }

MainGameSummaryState.prototype.victory_types = [
  "half",
  "basic",
  "silver",
  "gold",
];


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
  this.has_ult = has_ult()

  if(save_screen) {
    this.hive_numbers = HiveNumbers.prototype.clone(imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode])
    this.hive_numbers.adjust_values()
    save_game()
    this.world_num = this.hive_numbers.world
    this.victory = null
  }

  this.transition_interval = 250
  this.transition_timer = this.transition_interval
  this.transition_state = "in"
  this.buttons = []

  this.victory_type = "half"

  this.shift_down_time = 0
  this.ctrl_down_time = 0

  this.victory_color = "red"

  this.color = impulse_colors["world "+this.world_num]
  this.lite_color = impulse_colors["world "+this.world_num+" lite"]
  this.bright_color = impulse_colors["world "+this.world_num+" bright"]
  this.dark_color = impulse_colors["world "+this.world_num+" dark"]

  if (this.world_num > 0) {
    this.total_time = Math.ceil((imp_params.quest_data["blitz_hive" + this.world_num].time_cutoff * 1000 - this.hive_numbers.speed_run_countdown) / 1000);
    this.total_deaths = 0;
  }

  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)
    if(this.hive_numbers.game_numbers[title]) {
      this.total_deaths += this.hive_numbers.game_numbers[title].deaths
    }
  }

  if(victory) {
    this.calculate_deaths()
    this.send_logging();
    this.victory_text = imp_params.hive_names[this.world_num]+" DEFEATED";

    var min_star = 3
    for(level in hive_numbers.game_numbers) {
      if (hive_numbers.game_numbers[level].stars < min_star) {
        min_star = hive_numbers.game_numbers[level].stars;
      }
    }

    if(!hive_numbers.continues) {
      this.victory_type = this.victory_types[min_star]
      this.hive_numbers.victory_type = this.victory_type
    }

    this.victory_color = this.get_victory_color(this.victory_type, world_num, this.total_deaths)

    var victory_data = imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.world_num]

    // don't  make the player feel bad if this is their first play-through
    if (victory_data === undefined && this.victory_type == "half") {
      this.victory_color = impulse_colors["world "+world_num+" bright"]
    }

    if (victory_data && victory_data["rank"]) {
      var victory_type = MainGameSummaryState.prototype.convert_rank_to_victory_type(victory_data["rank"]);
      MainGameSummaryState.prototype.overwrite_rank_data_with_victory_type(difficulty, world, victory_type);
    }

    if(!victory_data ||
      this.victory_types.indexOf(this.victory_type) > this.victory_types.indexOf(victory_data["victory_type"]) ||
      (this.victory_type == victory_data["victory_type"] &&
      ((this.victory_type == "half" && hive_numbers.continues < victory_data["continues"]) ||
       (this.victory_type == "gold" && this.total_deaths < victory_data["deaths"])))) {
        imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.world_num] =
          {
            "victory_type": this.victory_type,
            "continues": hive_numbers.continues,
            "deaths": this.total_deaths,
            "first_victory": victory_data === undefined
          }
        save_game()
    }
  }

  var _this = this;

  if(this.save_screen && !this.just_saved) {
    this.resume_button = new IconButton("RESUME", 16, 730, imp_vars.levelHeight/2+260, 100, 65, this.bright_color, this.bright_color, function(_this){return function(){
      _this.resume_game()
    }}(this), "start")
    this.resume_button.shadow = false
    /*if(imp_vars.player_data.options.control_hand == "right") {
      this.resume_button.underline_index = 0
    } else {
      this.resume_button.extra_text = "RIGHT ARROW"
      this.resume_button.dim_extra_text = true
    }*/
    this.buttons.push(this.resume_button)

    this.delete_button = new IconButton("DELETE", 16, imp_vars.levelWidth/2, imp_vars.levelHeight/2+260, 100, 65, this.bright_color, this.bright_color, function(_this){return function(){
      _this.delete_game()
    }}(this), "delete_small")
    this.buttons.push(this.delete_button)
    this.delete_button.shadow = false
    /*if(imp_vars.player_data.options.control_hand == "right") {
      this.delete_button.underline_index = 0
    this.delete_button.extra_text= "SHIFT+"
    } else {
      this.delete_button.extra_text = "SHIFT + DOWN ARROW"
      this.delete_button.dim_extra_text = true
    }
    this.delete_button.shift_enabled = true*/

    this.return_to_main_button = new IconButton("EXIT", 16, 70, imp_vars.levelHeight/2 + 260, 60, 65, this.bright_color, this.bright_color, function(_this) { return function() {
      _this.exit_game()
    }}(this), "back")

    this.buttons.push(this.return_to_main_button)
    /*this.return_to_main_button.shadow = false
    if(imp_vars.player_data.options.control_hand == "right") {
      this.return_to_main_button.underline_index = 0
    } else {
      this.return_to_main_button.extra_text = "LEFT ARROW"
      this.return_to_main_button.dim_extra_text = true

    }*/
  }


  if (this.world_num != 0) {
    imp_vars.impulse_music.stop_bg()
  }
  this.star_colors = ["bronze", "silver", "gold"]


  if (!this.save_screen && this.victory)
    this.check_quests();
}

MainGameSummaryState.prototype.send_logging = function () {
  // Logging for world 0 occurs in Reward Game State, since user can quit tutorial with pause menu.
  if (this.world_num === 0) return;
  // Determine first-victory by checking world_rankings.
  var first_victory =
    imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.world_num] === undefined;

  send_logging_to_server('BEAT WORLD ' + this.world_num, {
    first_victory: first_victory,
    difficulty_mode: imp_vars.player_data.difficulty_mode,
    hive_numbers: this.hive_numbers
  });
};

MainGameSummaryState.prototype.convert_rank_to_victory_type = function(rank) {
  var stars = MainGameSummaryState.prototype.rank_cutoffs[rank];
  var victory_type = "half"
  if (stars > 0) {
    victory_type = "basic"
  }
  if (stars >= 16) {
    victory_type = "silver"
  }
  if (stars >= 24) {
    victory_type = "gold"
  }
  return victory_type
}

MainGameSummaryState.prototype.overwrite_rank_data_with_victory_type = function(difficulty, world, victory_type) {
  imp_vars.player_data.world_rankings[difficulty][world] = {
    "victory_type": victory_type,
    "continues": victory_type == "half" ? 1 : 0,
    "deaths": 9,
    "first_victory": true
  }
  save_game()
}

MainGameSummaryState.prototype.get_victory_color = function(victory_type, world_num, total_deaths) {

  /*var victory_colors = [
    impulse_colors["world "+world_num+" bright"],
    impulse_colors["world "+world_num+" bright"],
    impulse_colors["silver"],
    impulse_colors["gold"]
  ];*/

  // Special color if no deaths and gold clear.

  return impulse_colors["world "+world_num+" bright"]
  //return victory_colors[this.victory_types.indexOf(victory_type)];
}

MainGameSummaryState.prototype.calculate_deaths = function() {
  var deaths = 0;
  for(var i = 0; i < 8; i++) {
    var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

    if(this.hive_numbers.game_numbers[title]) {
      deaths += this.hive_numbers.game_numbers[title].deaths;
    }
  }
  this.total_deaths = deaths
}

MainGameSummaryState.prototype.draw = function(ctx, bg_ctx) {
  if (this.world_num == 0 && !this.save_screen) {
    return;
  }
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "display:none")
    this.bg_drawn = true
    draw_bg(imp_vars.world_menu_bg_canvas.getContext('2d'), 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive "+this.world_num)
  }

  ctx.save()
  this.transition_timer -= dt;
  if(this.transition_timer < 0) {
    if(this.transition_state == "in") {
      this.transition_state = "none"
    }
    if(this.transition_state == "out") {
      this.go_to_next_state();
    }
  }

  ctx.fillStyle = this.dark_color
  ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)

  if(this.transition_state == "in") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = 1 - prog
  } else if(this.transition_state == "out") {
    var prog = (this.transition_timer/this.transition_interval);
    ctx.globalAlpha = Math.max(0, prog)
  }

  ctx.save()
  ctx.globalAlpha *= get_bg_opacity(this.world_num);

  ctx.drawImage(imp_vars.world_menu_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight)

  ctx.restore();
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }



  ctx.shadowBlur = 0;

  ctx.textAlign = 'center'


  ctx.font = '20px Muli'
  if(this.victory) {
    ctx.globalAlpha *= 0.3
    draw_tessellation_sign(ctx, this.world_num, imp_vars.levelWidth/2, 100, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = this.bright_color
    ctx.font = '40px Muli'
    ctx.fillText(this.victory_text, imp_vars.levelWidth/2, 130)
  }
  else if(this.save_screen) {
    ctx.globalAlpha *= 0.3
    draw_tessellation_sign(ctx, this.world_num, imp_vars.levelWidth/2, 220, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = "white"
    ctx.fillText("GAME SAVED" , imp_vars.levelWidth/2, 210)
    ctx.fillStyle = this.bright_color;
    ctx.font = '40px Muli'
    ctx.fillText(this.hive_numbers.hive_name, imp_vars.levelWidth/2, 250)
    ctx.font = '24px Muli'
    ctx.fillText(this.hive_numbers.current_level, imp_vars.levelWidth/2, 280);

    ctx.textAlign = 'center'

    var score_y = 380;
    var score_label_y = 420;

    ctx.fillStyle = this.bright_color
    ctx.font = '20px Muli'
    ctx.fillText("TOTAL TIME ", imp_vars.levelWidth/2 - 100, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(convert_seconds_to_time_string(this.total_time), imp_vars.levelWidth/2 - 100, score_label_y)
    ctx.fillStyle = this.bright_color
    ctx.font = '20px Muli'
    ctx.fillText("DEATHS", imp_vars.levelWidth/2 + 100, score_y)
    ctx.font = '42px Muli'
    ctx.fillText(this.total_deaths, imp_vars.levelWidth/2 + 100, score_label_y)

  } else {
    ctx.globalAlpha *= 0.3
    draw_tessellation_sign(ctx, this.world_num, imp_vars.levelWidth/2, 100, 80)
    ctx.globalAlpha /= 0.3
    ctx.fillStyle = 'red'
    ctx.fillText("GAME OVER", imp_vars.levelWidth/2, 80)
    ctx.fillStyle = this.bright_color
    if(this.hive_numbers.continues > 0) {
      ctx.font = '18px Muli'
      ctx.fillText("CONTINUES: "+this.hive_numbers.continues, imp_vars.levelWidth/2, 175)
    }
    ctx.font = '40px Muli'
    ctx.fillText(this.hive_numbers.hive_name, imp_vars.levelWidth/2, 130)
  }

  if(this.victory && this.hive_numbers.continues) {
    ctx.fillStyle = this.bright_color
    ctx.font = '18px Muli'
    ctx.fillText("CONTINUES: "+this.hive_numbers.continues, imp_vars.levelWidth/2, 250)
  }

  if(this.victory) {
    ctx.fillStyle = this.bright_color
    ctx.font = '14px Muli'
    ctx.fillText("TOTAL TIME", imp_vars.levelWidth/2, 167)
    ctx.font = '24px Muli'
    ctx.fillText(convert_seconds_to_time_string(this.total_time), imp_vars.levelWidth/2, 190)

  } else if(this.save_screen) {
    /*draw_lives_and_sparks(ctx,
      this.hive_numbers.lives, this.hive_numbers.sparks, this.hive_numbers.ultimates,
      imp_vars.levelWidth/2, 170, 24, {
        labels: true,
        ult: this.has_ult,
        sparks: false, //imp_vars.player_data.difficulty_mode == "normal",
        lives: false //imp_vars.player_data.difficulty_mode == "normal",
      });
    ctx.font = '16px Muli'
    if(this.hive_numbers.continues) {
      ctx.fillStyle = "red"
      ctx.fillText("CONTINUES: "+Math.floor(this.hive_numbers.continues), imp_vars.levelWidth/2, 240)
    }*/
  }

  /*if(calculate_current_rating() > this.hive_numbers.original_rating || true) {
      ctx.font = '12px Muli'
      ctx.fillText("RATING", imp_vars.levelWidth/2, 240)
      ctx.font = '36px Muli'
      ctx.fillText("+300", imp_vars.levelWidth/2, 280)
  }*/

  if(!this.save_screen) {
    ctx.shadowBlur = 0

    ctx.font = '18px Muli'
    ctx.textAlign = 'center'

    var start_y = 250
    ctx.fillStyle = this.bright_color;

    ctx.fillText("LEVEL",260, start_y)
    //ctx.fillText("SCORE", 270, start_y)
    ctx.fillText("TIME", 400, start_y)
    //ctx.fillText("COMBO", 510, start_y)
    ctx.fillText("DEATHS", 540, start_y)

    for(var i = 0; i < 8; i++) {
      var title = i == 7 ? "BOSS "+(this.world_num) : "HIVE "+this.world_num+"-"+(i+1)

      var real_title = title;
      if(i==7) {
        real_title = this.hive_numbers.boss_name;
      }
      var gn;
      if(this.hive_numbers.game_numbers[title]) {
        gn = this.hive_numbers.game_numbers[title];
      } else {
        gn = {}
      }
      ctx.fillStyle = gn.visited ? this.bright_color : "#666";
      var y = start_y + 30 + 27 * i;
      ctx.fillText(real_title,260, y)

      /*if(gn.score != undefined) {
        if(gn.stars > 0) {
          ctx.fillStyle = impulse_colors[this.star_colors[gn.stars - 1]]
        }
        ctx.fillText(gn.score, 270, y)
      } else {
        ctx.fillText('---', 270, y)
      }*/
      ctx.fillStyle = gn.visited ? this.bright_color : "#666";
      if(this.hive_numbers.total_time[title] != undefined)
        ctx.fillText(convert_seconds_to_time_string(Math.floor(this.hive_numbers.total_time[title] / 1000)), 400, y)
      else {
        ctx.fillText('---', 400, y)
      }
      /*if(gn.combo != undefined)
        ctx.fillText(gn.combo, 510, y)
      else {
        ctx.fillText('---', 510, y)
      }*/
      if(gn.deaths != undefined)
        ctx.fillText(gn.deaths, 540, y)
      else {
        ctx.fillText('---', 540, y)
      }
    }
  }

  ctx.font = '16px Muli'
  ctx.fillStyle = this.lite_color
  if(this.save_screen) {
    if(this.just_saved)
      ctx.fillText("PRESS ANY KEY FOR MAIN MENU", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
  } else if(this.victory) {
    ctx.fillText("PRESS ANY KEY FOR MAIN MENU", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
  /* else if(this.level) {
    ctx.fillText("PRESS ANY KEY TO CONTINUE", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)*/
  } else {
    ctx.fillText("PRESS ANY KEY FOR MAIN MENU", imp_vars.levelWidth/2, imp_vars.levelHeight - 30)
  }

  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].draw(ctx)
  }
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].post_draw(ctx)
  }
  ctx.restore()

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
  /*if(this.transition_state=="none" && (!this.save_screen || this.just_saved)) {
      this.transition_state="out";
      this.transition_timer = this.transition_interval
    }*/
}

MainGameSummaryState.prototype.on_key_down = function(keyCode) {

  /*if(this.save_screen && !this.just_saved) {
    if(keyCode == imp_params.keys.EXIT_GAME_KEY) {
      this.exit_game()
    } else if(keyCode == imp_params.keys.DELETE_GAME_KEY && this.shift_down()) {
      this.delete_game()
    } else if(keyCode == imp_params.keys.RESUME_GAME_KEY && !this.ctrl_down()) {
      this.resume_game()
    }
  } else{*/
  if(this.transition_state=="none" && (!this.save_screen || this.just_saved)) {
    this.transition_state="out";
    this.transition_timer = this.transition_interval
  }
  /*}
  if(keyCode == 16) {
    this.shift_down_time = (new Date()).getTime()
  }
  if(keyCode == 17) {
    this.ctrl_down_time = (new Date()).getTime()
  }*/
}
MainGameSummaryState.prototype.on_key_up = function(keyCode) {
  if(keyCode == 16) {
    this.shift_held= false
  }
  if(keyCode == 17) {
    this.ctrl_held = false
  }
}

MainGameSummaryState.prototype.shift_down = function() {
  return (new Date()).getTime() - this.shift_down_time < 1000
}

MainGameSummaryState.prototype.ctrl_down = function() {
  return (new Date()).getTime() - this.ctrl_down_time < 1000
}

MainGameSummaryState.prototype.process = function(dt) {
  if (this.world_num == 0 && !this.save_screen) {
    this.go_to_next_state();
  }
}

MainGameSummaryState.prototype.resume_game = function() {
  imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode] = {}
  save_game()
  this.hive_numbers.original_rating = calculate_current_rating() // set to current rating when restarting game
  switch_game_state(new MainGameTransitionState(this.world_num, null, null, this.hive_numbers, true))
}

MainGameSummaryState.prototype.delete_game = function() {
  imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode] = {}
  save_game()
  switch_game_state(new WorldMapState(this.world_num))
}

MainGameSummaryState.prototype.check_quests = function() {
  if (this.world_num <= 0) return;

  // Check if this game_number is a gold score. Bosses don't count.
  if (imp_vars.player_data.difficulty_mode == "normal") {
    var min_victory_type = 3;
    var victory_types =  ["half", "basic", "silver", "gold"];
    for (var i = 1; i <= 4; i++) {
      if (imp_vars.player_data.world_rankings["normal"]["world " + i]) {
        var victory_type = imp_vars.player_data.world_rankings["normal"]["world " + i].victory_type;
        if (victory_types.indexOf(victory_type) < min_victory_type) {
          min_victory_type = victory_types.indexOf(victory_type)
        }
      } else {
        // If a world is missing, then there is no min_victory_type;
        min_victory_type = -1;
      }
    }
  }

  if (imp_vars.player_data.difficulty_mode == "normal" && this.hive_numbers.speed_run_countdown > 0) {
    set_quest_completed("blitz_hive" + this.world_num);
  }

  if (!this.hive_numbers.hit) {
    set_quest_completed("untouchable");
  }

  if(imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world]
    && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+this.hive_numbers.world]["first_victory"]) {
    if (this.hive_numbers.world < 4) {
      set_quest_completed("beat_hive")

      /*this.rewards.push({
        type: "world_victory",
        data: this.hive_numbers.world
      })*/
      // Completed the quest for beating this world.
    }

    if (this.hive_numbers.world == 4) {
      set_quest_completed("final_boss")
    }

    /*if (this.hive_numbers.world == 4 || (this.hive_numbers.world == 1 && imp_vars.player_data.difficulty_mode == "easy")) {
      this.rewards.push({
        type: "share"
      });
    }*/
  }
}

MainGameSummaryState.prototype.exit_game = function() {
  switch_game_state(new TitleState(true))
}

MainGameSummaryState.prototype.go_to_next_state = function() {
  if(this.victory) {
    if (this.world_num === 4 &&
        imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 4"] &&
        imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 4"]["first_victory"]) {
      switch_game_state(new CreditsState(true, this.hive_numbers,
        {victory: true,
          is_tutorial: this.world_num == 0,
          first_time_tutorial: imp_vars.player_data.first_time,
          skipped: false,
          just_saved: this.just_saved}))
    } else {
      switch_game_state(new RewardGameState(this.hive_numbers, true,
        {victory: true,
          is_tutorial: this.world_num == 0,
          first_time_tutorial: imp_vars.player_data.first_time,
          skipped: false,
          just_saved: this.just_saved}))
    }
  } else {
    switch_game_state(new RewardGameState(this.hive_numbers, true,
      {victory: false,
        is_tutorial: this.world_num == 0,
        first_time_tutorial: imp_vars.player_data.first_time,
        skipped: false,
        just_saved: this.just_saved}))
  }
}
