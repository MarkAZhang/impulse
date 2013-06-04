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
  ctx.beginPath()

  ctx.fillStyle = "white";
  ctx.textAlign = 'center'

  ctx.font = '42px Muli'
  ctx.shadowBlur = 20;
  ctx.shadowColor = ctx.fillStyle

  ctx.fillText("YES "+ this.slide_num, 400, 400)
  ctx.fill()
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
