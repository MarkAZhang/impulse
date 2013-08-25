WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(world) {
  this.bg_drawn = false
  this.color = "white"//impulse_colors["impulse_blue"]

  this.cur_start_lives = calculate_lives()
  this.cur_start_ult = calculate_ult()
  this.cur_start_spark_val = calculate_spark_val()
  this.has_ult = has_ult()

  this.cur_world = 2


  this.buttons = []
  var _this = this
  this.buttons.push(new IconButton("BACK", 16, 70, imp_vars.levelHeight/2+250, 150, 100, this.color, impulse_colors["impulse_blue"], function(){
    if(_this.fade_out_duration == null) {setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}}, "back"))
  this.world_buttons = {

  }
  // the things you select at the bottom
  this.mode_buttons = []

  this.practice_buttons = {}

  this.num_mode_buttons = 4

  this.requirements = {
    2: "DEFEAT "+imp_params.tessellation_names[1],
    3: "DEFEAT "+imp_params.tessellation_names[2],
    4: "DEFEAT "+imp_params.tessellation_names[3]
  }

  this.set_up_world_map()
  this.set_up_mode_buttons()
  this.set_up_practice_buttons()

  imp_vars.impulse_music.play_bg(imp_params.songs["Menu"])

  this.fade_out_interval = 500
  this.fade_out_duration = null

  this.cur_rating = calculate_current_rating()
  this.next_upgrade = calculate_next_upgrade()
}

WorldMapState.prototype.set_up_world_map = function() {
    var _this = this;
    /*this.world_buttons[1] = new SmallButton("I. HIVE IMMUNITAS", 20, imp_vars.levelWidth/2 - 150, imp_vars.levelHeight/2-100, 200, 200, impulse_colors["boss 1"], impulse_colors["boss 1"],
     function(){_this.fade_out_duration = _this.fade_out_interval; _this.fade_out_color = impulse_colors["world 1 dark"];
      setTimeout(function(){
        switch_game_state(new MainGameTransitionState(1, null, null, null, null))
      }, 500)})*/

    this.set_up_world_icon(1, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "ENTER HIVE", true)
    this.set_up_world_icon(2, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "ENTER HIVE", imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 1"])
    this.set_up_world_icon(3, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "ENTER HIVE", imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 2"])
    this.set_up_world_icon(4, imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 125, "ENTER HIVE", imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 3"])


}

WorldMapState.prototype.set_up_mode_buttons = function() {
  var diff = 75
  var cur_x =  imp_vars.levelWidth/2 - ((this.num_mode_buttons - 1) * 0.5) * diff
  var button_color = "white"
  this.mode_buttons.push(new IconButton("", 16, cur_x, imp_vars.levelHeight/2+250, 150, 100, button_color, impulse_colors["impulse_blue"], function(){switch_game_state(new HowToPlayState())}, "world1"))
  this.mode_buttons.push(new IconButton("", 16, cur_x + diff, imp_vars.levelHeight/2+250, 150, 100, button_color, impulse_colors["impulse_blue"], function(){switch_game_state(new HowToPlayState())}, "world2"))
  this.mode_buttons.push(new IconButton("", 16, cur_x + diff * 2, imp_vars.levelHeight/2+250, 150, 100, button_color, impulse_colors["impulse_blue"], function(){switch_game_state(new HowToPlayState())}, "world3"))
  this.mode_buttons.push(new IconButton("", 16, cur_x + diff * 3, imp_vars.levelHeight/2+250, 150, 100, button_color, impulse_colors["impulse_blue"], function(){switch_game_state(new HowToPlayState())}, "world4"))
}

WorldMapState.prototype.set_up_practice_buttons = function() {

  var diff = 75

  for(var i = 0; i < 4; i++) {
    this.practice_buttons[i+1] = []
    var colors = ["world "+(i+1)+" bright", "bronze", "silver", "gold"]
    for(var j = 0; j < 8; j++) {

      var level_name = "HIVE "+(i+1)+"-"+(j+1);
      if(j == 7) {
        level_name = "BOSS "+(i+1)
      }
      var this_color = impulse_colors[colors[imp_params.impulse_level_data[level_name].save_state[imp_vars.player_data.difficulty_mode].stars]]
      var new_button = new IconButton(j == 7 ? "BOSS" : j+1, 20, imp_vars.levelWidth/2 + ((-3.5 + j) * diff), imp_vars.levelHeight/2+150, 150, 100,
       this_color, impulse_colors["impulse_blue"], function(){switch_game_state(new HowToPlayState())}, "practice"+(i+1))
      new_button.level_name = level_name
      this.practice_buttons[i+1].push(new_button)
      new_button.inactive = !imp_params.impulse_level_data[level_name].save_state[imp_vars.player_data.difficulty_mode].seen && !imp_vars.dev
      if(new_button.inactive) {
        new_button.color = "gray"
      }

    }
  }
}

WorldMapState.prototype.set_up_world_icon = function(world_num, x, y, name, unlocked) {
  var _this = this
  if(unlocked) {
      this.world_buttons[world_num] = new SmallButton(name, 20, x, y, 150, 100, impulse_colors["world "+world_num+" bright"], impulse_colors["world "+world_num+" bright"],
       function(){_this.fade_out_duration = _this.fade_out_interval; _this.fade_out_color = impulse_colors["world "+world_num+" dark"];
        setTimeout(function(){

          switch_game_state(new MainGameTransitionState(world_num, null, null, null, null))
        }, 500)})
    } else {
      this.world_buttons[world_num] = new SmallButton(name, 20, x, y, 200, 200, impulse_colors["boss "+world_num], impulse_colors["boss "+world_num],
       function(){})
      this.world_buttons[world_num].active = false
    }
}

WorldMapState.prototype.draw_bg = function(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#080808"
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 0.05
  ctx.drawImage(imp_vars.title_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
  ctx.globalAlpha = 1
}

WorldMapState.prototype.draw = function(ctx, bg_ctx) {

  if(this.fade_out_color) {

    ctx.globalAlpha = 1-(this.fade_out_duration/this.fade_out_interval)
    ctx.fillStyle = this.fade_out_color
    ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  }

  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    this.draw_bg(bg_ctx)
    this.bg_drawn = true
  }

  if(this.fade_out_duration != null) {
    ctx.globalAlpha = Math.max((this.fade_out_duration/this.fade_out_interval), 0)
  }

  ctx.save()
  ctx.fillStyle = impulse_colors["world "+this.cur_world+" bright"]
  ctx.font = "36px Muli"
  ctx.textAlign = "center"
  ctx.fillText("HIVE "+imp_params.tessellation_names[this.cur_world], imp_vars.levelWidth/2, 70)
  ctx.restore()


  var index = this.cur_world


  /*if(index > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(index-1)]) {
    ctx.globalAlpha *= 0.2
  }*/
  ctx.save()
  if(this.world_buttons[this.cur_world].hover) {
    ctx.globalAlpha *= 0.7
  } else {
    ctx.globalAlpha *= 0.4
  }
  draw_tessellation_sign(ctx, index, this.world_buttons[index].x, this.world_buttons[index].y - 10, 100,this.world_buttons[this.cur_world].hover)
  /*if(index > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(index-1)]) {
    ctx.globalAlpha *= 5
  }*/
  ctx.restore()
  this.world_buttons[index].draw(ctx)

  if(index > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(index-1)]) {
    ctx.font = '12px Muli'
    ctx.fillStyle = this.world_buttons[index].color
    ctx.textAlign = "center"
    ctx.fillText(this.requirements[index], this.world_buttons[index].x, this.world_buttons[index].y + 20)
  }


  if(imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode].hasOwnProperty("world "+index)) {
    ctx.save()
    ctx.textAlign = "center"
    ctx.fillStyle = impulse_colors["world "+index+" bright"]
    ctx.font = '12px Muli'
    ctx.fillText('RANK', this.world_buttons[index].x, this.world_buttons[index].y + 30)
    ctx.font = '36px Muli'
    ctx.fillStyle = MainGameSummaryState.prototype.get_rank_color(MainGameSummaryState.prototype.rank_cutoffs[imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["rank"]], index)
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = 10
    var rank = imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["rank"]
    ctx.fillText(rank, this.world_buttons[index].x, this.world_buttons[index].y + 60)
    if(rank == "F") {
      ctx.font = '11px Muli'
      ctx.fillText("CONTINUES: "+imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["continues"]
        , this.world_buttons[index].x, this.world_buttons[index].y + 80)
      
    }
    if(rank == "S" && imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["deaths"] > 0) {
      ctx.font = '11px Muli'
      ctx.fillText("DEATHS: "+imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+index]["deaths"]
        , this.world_buttons[index].x, this.world_buttons[index].y + 80)
    }
    ctx.restore()
  }

  for(var i = 0; i < this.mode_buttons.length; i++) {
    this.mode_buttons[i].draw(ctx)
  }

  for(var i = 0; i < this.practice_buttons[this.cur_world].length; i++) {
    this.practice_buttons[this.cur_world][i].draw(ctx)
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.textAlign = 'center'
  ctx.font = '16px Muli'
  ctx.fillStyle = impulse_colors["world "+this.cur_world+" bright"]
  ctx.fillText("PRACTICE", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 115)

  ctx.textAlign = 'center'
  ctx.font = '12px Muli'
  ctx.fillStyle = 'white'
  ctx.fillText("PLAYER SKILL LEVEL", imp_vars.levelWidth - 90, imp_vars.levelHeight - 85)
  ctx.font = '48px Muli'
  ctx.fillText(this.cur_rating, imp_vars.levelWidth  - 90, imp_vars.levelHeight - 40)
  if(this.next_upgrade != null) {
    ctx.font = '10px Muli'
    ctx.fillText("NEXT UPGRADE AT "+this.next_upgrade, imp_vars.levelWidth  - 90, imp_vars.levelHeight - 20)
  }

  draw_lives_and_sparks(ctx, this.cur_start_lives, this.cur_start_spark_val, this.cur_start_ult, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 25, 24, {labels: true, starting_values: true, ult: this.has_ult})

  if(imp_vars.player_data.difficulty_mode == "easy") {
    ctx.font = '12px Muli'
    ctx.textAlign = 'left'
    ctx.fillStyle = "white"
    ctx.fillText("EASY MODE", 10, imp_vars.levelHeight - 10)
  }
}

WorldMapState.prototype.process = function(dt) {
  if(this.fade_out_duration != null) {
    this.fade_out_duration -= dt
  }
}

WorldMapState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
  this.world_buttons[this.cur_world].on_mouse_move(x, y)
}

WorldMapState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  this.world_buttons[this.cur_world].on_click(x, y)
}