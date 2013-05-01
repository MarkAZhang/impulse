CreditsState.prototype = new GameState

CreditsState.prototype.constructor = CreditsState

function CreditsState() {
  this.bg_drawn = false
  this.start_clicked = false
  this.buttons = []
  var _this = this
  this.buttons.push(new SmallButton("RETURN", 20, levelWidth/2, levelHeight/2+270, 200, 50, impulse_colors["impulse_blue"], "blue", function(){setTimeout(function(){switch_game_state(new TitleState(true))}, 20)}))
  this.image = new Image()

  this.image.src = 'impulse_logo.png'
}

CreditsState.prototype.process = function(dt) {

}

CreditsState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "black"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }
  ctx.globalAlpha = .3
  /*ctx.drawImage(this.image, levelWidth/2 - this.image.width/2, levelHeight/2 - 100 - this.image.height/2 - 15)*/
  ctx.globalAlpha = 1
  ctx.beginPath()
  ctx.font = '72px Century Gothic'
  ctx.shadowColor = impulse_colors["impulse_blue"]
  ctx.shadowBlur = 20
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.textAlign = 'center'
  ctx.fillText("IMPULSE", levelWidth/2, levelHeight/2 - 100)
  ctx.font = '20px Century Gothic'
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.fillText("Impulse was conceived, designed, and coded by Mark Zhang", levelWidth/2, levelHeight/2 + 50)
  ctx.fillText("Impulse is based on the Box2D physics engine.", levelWidth/2, levelHeight/2 + 75)

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

