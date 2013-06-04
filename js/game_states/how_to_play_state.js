HowToPlayState.prototype = new ImpulseGameState

HowToPlayState.prototype.constructor = HowToPlayState

function HowToPlayState() {

  this.init(0, null, null, true, null, true)
  this.ready = false
  this.level = this.load_level(impulse_level_data["HOW TO PLAY"])

  this.slide_num = 0

}

HowToPlayState.prototype.load_level = LoaderGameState.prototype.load_level

HowToPlayState.prototype.load_complete = function() {
  this.ready = true
  this.level.impulse_game_state = this
  this.level.reset() //we re-use the level
  this.level_name = this.level.level_name
  this.is_boss_level = false
  this.make_player()
  bg_canvas.setAttribute("style", "display:none")
  bg_ctx.translate(sidebarWidth, 0)//allows us to have a topbar
  this.level.draw_bg(bg_ctx)
  bg_ctx.translate(-sidebarWidth, 0)
  impulse_music.play_bg(imp_vars.songs["Interlude"])

  this.color = "white"
  this.dark_color = "black"
}

HowToPlayState.prototype.additional_draw = function(ctx, bg_ctx) {
  ctx.save()
  ctx.translate(sidebarWidth, 0)//allows us to have a topbar

  if(this.slide_num == 0) {
    ctx.shadowColor = "white"
    ctx.shadowBlur = 10
    drawSprite(ctx, 400, 430, 0, 60, 60, "key")
    drawSprite(ctx, 340, 430, 0, 60, 60, "key")
    drawSprite(ctx, 460, 430, 0, 60, 60, "key")
    drawSprite(ctx, 400, 370, 0, 60, 60, "key")
    ctx.fillStyle = "white";
    ctx.font = '20px Muli'
    ctx.textAlign = "center"
    ctx.fillText("W", 400, 390)
    ctx.fillText("A", 340, 450)
    ctx.fillText("S", 400, 450)
    ctx.fillText("D", 460, 450)
    draw_arrow(ctx, 400, 362, 20, "up", "white")
    draw_arrow(ctx, 340, 422, 20, "left", "white")
    draw_arrow(ctx, 400, 420, 20, "down", "white")
    draw_arrow(ctx, 460, 422, 20, "right", "white")

    ctx.fillText("MOVE", 400, 500)


    ctx.globalAlpha = 0.5
    ctx.font = '12px Muli'
    ctx.fillText("ALTERNATE CONTROLS AVAILABLE IN PAUSE MENU", 400, 550)
    //ctx.rect(390, 420, 20, 20)
    //ctx.fill()

  }


  ctx.restore()
}

HowToPlayState.prototype.on_key_down = function(keyCode) {
  if(!this.ready) return

  if(keyCode == 81) {
    this.pause = !this.pause
    if(this.pause) {
      set_dialog_box(new PauseMenu(this.level, this.world_num, this.game_numbers, this, this.visibility_graph))
    }
  } else if(keyCode == 32 && this.hive_numbers && this.gateway_unlocked && p_dist(this.level.gateway_loc, this.player.body.GetPosition()) < this.level.gateway_size) {
    this.victory = true
  } else if(keyCode == 67) {
    this.slide_num += 1
  } else if(keyCode == 66) {
    if(this.slide_num > 0)
      this.slide_num -= 1
  } else {
    this.player.keyDown(keyCode)  //even if paused, must still process
  }
}
