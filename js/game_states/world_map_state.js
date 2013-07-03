WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(world) {
  this.bg_drawn = false
  this.color = "white"//impulse_colors["impulse_blue"]


  this.buttons = []
  var _this = this
  this.buttons.push(new SmallButton("MAIN MENU", 20, levelWidth/2, levelHeight/2+270, 200, 50, this.color, "blue", function(){
    if(_this.fade_out_duration == null) {setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}}))
  this.world_buttons = {

  }

  this.requirements = {
    2: "DEFEAT IMMUNITAS",
    3: "DEFEAT CONSUMENDI"
  }

  this.set_up_world_map()


  impulse_music.play_bg(imp_vars.songs["Menu"])

  this.fade_out_interval = 500
  this.fade_out_duration = null
}

WorldMapState.prototype.set_up_world_map = function() {
    var _this = this;
    this.world_buttons[1] = new SmallButton("I. HIVE IMMUNITAS", 20, levelWidth/2 - 150, levelHeight/2-100, 200, 200, impulse_colors["boss 1"], impulse_colors["boss 1"],
     function(){_this.fade_out_duration = _this.fade_out_interval; _this.fade_out_color = impulse_colors["world 1 dark"];
      setTimeout(function(){
        switch_game_state(new MainGameTransitionState(1, null, null, null, null))
      }, 500)})

    this.set_up_world_icon(1, levelWidth/2 - 150, levelHeight/2 - 100, "I. HIVE IMMUNITAS", true)
    this.set_up_world_icon(2, levelWidth/2 + 150, levelHeight/2 - 100, "II. HIVE CONSUMENDI", player_data.world_rankings[player_data.difficulty_mode]["world 1"])
    this.set_up_world_icon(3, levelWidth/2 - 150, levelHeight/2 + 100, "III. HIVE NEGLIGENTIA", player_data.world_rankings[player_data.difficulty_mode]["world 2"])


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
    ctx.fillRect(0, 0, levelWidth, levelHeight)
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

  for(var index in this.world_buttons) {


    if(index > 1 && !player_data.world_rankings[player_data.difficulty_mode]["world "+(index-1)]) {
      ctx.globalAlpha *= 0.2
    }

    draw_tessellation_sign(ctx, index, this.world_buttons[index].x, this.world_buttons[index].y - 10, 100)
    if(index > 1 && !player_data.world_rankings[player_data.difficulty_mode]["world "+(index-1)]) {
      ctx.globalAlpha *= 5
    }

    this.world_buttons[index].draw(ctx)

    if(index > 1 && !player_data.world_rankings[player_data.difficulty_mode]["world "+(index-1)]) {
      ctx.font = '12px Muli'
      ctx.fillStyle = this.world_buttons[index].color
      ctx.textAlign = "center"
      ctx.fillText(this.requirements[index], this.world_buttons[index].x, this.world_buttons[index].y + 20)
    }


    if(player_data.world_rankings[player_data.difficulty_mode].hasOwnProperty("world "+index)) {
      ctx.save()
      ctx.textAlign = "center"
      ctx.fillStyle = impulse_colors["world "+index+" bright"]
      ctx.font = '12px Muli'
      ctx.fillText('RANK', this.world_buttons[index].x, this.world_buttons[index].y + 30)
      ctx.font = '36px Muli'
      ctx.fillStyle = MainGameSummaryState.prototype.get_rank_color(MainGameSummaryState.prototype.rank_cutoffs[player_data.world_rankings[player_data.difficulty_mode]["world "+index]], index)
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 10
      ctx.fillText(player_data.world_rankings[player_data.difficulty_mode]["world "+index], this.world_buttons[index].x, this.world_buttons[index].y + 60)
      ctx.restore()
    }
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }

  if(player_data.difficulty_mode == "easy") {
    ctx.font = '12px Muli'
    ctx.textAlign = 'left'
    ctx.fillStyle = "white"
    ctx.fillText("EASY MODE", 10, levelHeight - 10)
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