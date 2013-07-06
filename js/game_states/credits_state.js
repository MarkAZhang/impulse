CreditsState.prototype = new GameState

CreditsState.prototype.constructor = CreditsState

function CreditsState() {
  this.bg_drawn = false
  this.start_clicked = false
  this.buttons = []
  var _this = this
  this.buttons.push(new SmallButton("RETURN", 20, levelWidth/2, levelHeight/2+270, 200, 50, "white", "blue", function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
  this.image = new Image()

  this.image.src = 'impulse_logo.png'
}

CreditsState.prototype.process = function(dt) {

}

CreditsState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "#080808"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }
  /*ctx.globalAlpha = .3
  /*ctx.drawImage(this.image, levelWidth/2 - this.image.width/2, levelHeight/2 - 100 - this.image.height/2 - 15)*/
  //ctx.globalAlpha = 1
  draw_logo(ctx,levelWidth/2, levelHeight/2 - 160, true)
  /*ctx.beginPath()
  ctx.font = '72px Muli'
  ctx.shadowColor = impulse_colors["impulse_blue"]
  ctx.shadowBlur = 20
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", levelWidth/2, levelHeight/2 - 100)*/
  ctx.font = '20px Muli'
  ctx.fillStyle = "white"//impulse_colors["impulse_blue"]
  ctx.shadowColor = ctx.fillStyle
  ctx.globalAlpha *= 0.6
  ctx.fillText("Music by Matt McFarland", levelWidth/2, levelHeight/2 - 20)
  ctx.fillText("Some textures from SubtlePatterns.com", levelWidth/2, levelHeight/2 + 30)
  ctx.fillText("Buzz HTML5 Audio API by Jay Salvat", levelWidth/2, levelHeight/2 + 80)
  ctx.fillText("Based on the Box2dWeb Physics Engine", levelWidth/2, levelHeight/2 + 130)
  ctx.fillText("Game design, UI design, programming, art, and everything else", levelWidth/2, levelHeight/2 + 180)
  ctx.fillText("by Mark Zhang", levelWidth/2, levelHeight/2 + 210)
  ctx.globalAlpha /= 0.6

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
}

CreditsState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
}

CreditsState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

