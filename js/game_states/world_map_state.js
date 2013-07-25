WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(world) {
  this.bg_drawn = false
  this.color = "white"//impulse_colors["impulse_blue"]

  this.cur_start_lives = calculate_lives()
  this.cur_start_ult = calculate_ult()
  this.cur_start_spark_val = calculate_spark_val()


  this.buttons = []
  var _this = this
  this.buttons.push(new SmallButton("MAIN MENU", 20, imp_vars.levelWidth/2, imp_vars.levelHeight/2+270, 200, 50, this.color, "blue", function(){
    if(_this.fade_out_duration == null) {setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}}))
  this.world_buttons = {

  }

  this.requirements = {
    2: "DEFEAT "+imp_params.tessellation_names[1],
    3: "DEFEAT "+imp_params.tessellation_names[2],
    4: "DEFEAT "+imp_params.tessellation_names[3]
  }

  this.set_up_world_map()


  imp_vars.impulse_music.play_bg(imp_params.songs["Menu"])

  this.fade_out_interval = 500
  this.fade_out_duration = null
}

WorldMapState.prototype.set_up_world_map = function() {
    var _this = this;
    /*this.world_buttons[1] = new SmallButton("I. HIVE IMMUNITAS", 20, imp_vars.levelWidth/2 - 150, imp_vars.levelHeight/2-100, 200, 200, impulse_colors["boss 1"], impulse_colors["boss 1"],
     function(){_this.fade_out_duration = _this.fade_out_interval; _this.fade_out_color = impulse_colors["world 1 dark"];
      setTimeout(function(){
        switch_game_state(new MainGameTransitionState(1, null, null, null, null))
      }, 500)})*/

    this.set_up_world_icon(1, imp_vars.levelWidth/2 - 150, imp_vars.levelHeight/2 - 100, "I. HIVE "+imp_params.tessellation_names[1], true)
    this.set_up_world_icon(2, imp_vars.levelWidth/2 + 150, imp_vars.levelHeight/2 - 100, "II. HIVE "+imp_params.tessellation_names[2], imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 1"])
    this.set_up_world_icon(3, imp_vars.levelWidth/2 - 150, imp_vars.levelHeight/2 + 100, "III. HIVE "+imp_params.tessellation_names[3], imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 2"])
    this.set_up_world_icon(4, imp_vars.levelWidth/2 + 150, imp_vars.levelHeight/2 + 100, "IV. HIVE "+imp_params.tessellation_names[4], imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world 3"])


}

WorldMapState.prototype.set_up_world_icon = function(world_num, x, y, name, unlocked) {
  var _this = this
  if(unlocked) {
      this.world_buttons[world_num] = new SmallButton(name, 20, x, y, 200, 200, impulse_colors["boss "+world_num], impulse_colors["boss "+world_num],
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

WorldMapState.prototype.draw = function(ctx, bg_ctx) {

  if(this.fade_out_color) {

    ctx.globalAlpha = 1-(this.fade_out_duration/this.fade_out_interval)
    ctx.fillStyle = this.fade_out_color
    ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight)
  }

  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "#080808"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }

  if(this.fade_out_duration != null) {
    ctx.globalAlpha = Math.max((this.fade_out_duration/this.fade_out_interval), 0)
  }

  ctx.save()
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.font = "36px Muli"
  ctx.shadowBlur = 10
  ctx.shadowColor = ctx.fillStyle
  ctx.textAlign = "center"
  ctx.fillText("SELECT HIVE", imp_vars.levelWidth/2, 70)
  ctx.restore()

  for(var index in this.world_buttons) {


    if(index > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(index-1)]) {
      ctx.globalAlpha *= 0.2
    }

    draw_tessellation_sign(ctx, index, this.world_buttons[index].x, this.world_buttons[index].y - 10, 100)
    if(index > 1 && !imp_vars.player_data.world_rankings[imp_vars.player_data.difficulty_mode]["world "+(index-1)]) {
      ctx.globalAlpha *= 5
    }

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
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  draw_lives_and_sparks(ctx, this.cur_start_lives, this.cur_start_spark_val, this.cur_start_ult, imp_vars.levelWidth/2, imp_vars.levelHeight - 100, 24, true, true)

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
  for(var i in this.world_buttons)
  {
    this.world_buttons[i].on_mouse_move(x, y)
  }
}

WorldMapState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  for(var i in this.world_buttons)
  {
    this.world_buttons[i].on_click(x, y)
  }
}