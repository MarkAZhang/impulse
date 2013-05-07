WorldMapState.prototype = new GameState

WorldMapState.prototype.constructor = WorldMapState

function WorldMapState(world) {
  this.bg_drawn = false
  this.color = impulse_colors["impulse_blue"]


  this.buttons = []
  var _this = this
  this.buttons.push(new SmallButton("MAIN MENU", 20, levelWidth/2, levelHeight/2+270, 200, 50, this.color, "blue", function(){
    if(_this.fade_out_duration == null) {setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}}))

  this.set_up_world_map()


  impulse_music.play_bg(imp_vars.songs["Menu"])

  this.fade_out_interval = 1000
  this.fade_out_duration = null
}

WorldMapState.prototype.set_up_world_map = function() {
    var _this = this;
    this.world_one_button = new SmallButton("I. HIVE IMMUNITAS", 20, levelWidth/2 - 150, levelHeight/2-100, 200, 200, impulse_colors["boss 1"], impulse_colors["boss 1"],
     function(){_this.fade_out_duration = _this.fade_out_interval; _this.fade_out_color = impulse_colors["world 1 dark"];
      setTimeout(function(){

        switch_game_state(new MainGameTransitionState(1, null, null, null, null))
      }, 1000)})
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
    bg_ctx.fillStyle = "black"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }

  if(this.fade_out_duration != null) {
    ctx.globalAlpha = Math.max((this.fade_out_duration/this.fade_out_interval), 0)
  }

  draw_immunitas_sign(ctx,this.world_one_button.x, this.world_one_button.y, 100)
  this.world_one_button.draw(ctx)

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
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
  this.world_one_button.on_mouse_move(x,y)
}

WorldMapState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
  this.world_one_button.on_click(x,y)
}