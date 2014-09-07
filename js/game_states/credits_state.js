CreditsState.prototype = new GameState

CreditsState.prototype.constructor = CreditsState

function CreditsState() {
  this.bg_drawn = false
  this.start_clicked = false
  this.buttons = []
  var _this = this
  this.buttons.push(new IconButton("BACK", 16, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 260, 60, 65, "white", impulse_colors["impulse_blue"], function(){
    _this.fader.set_animation("fade_out", function() {
      switch_game_state(new TitleState(_this));
    });
  }, "back"))
  this.image = new Image()

  this.image.src = 'impulse_logo.png'
  this.buttons.push(new IconButton("KEVIN MACLEOD", 16, imp_vars.levelWidth/2 - 250, imp_vars.levelHeight/2 + 50, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://incompetech.com")}, "note"))
  this.buttons.push(new IconButton("MATT MCFARLAND", 16, imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 50, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://www.mattmcfarland.com")}, "note"))
  this.buttons.push(new IconButton("SUBTLE PATTERNS", 16, imp_vars.levelWidth/2 + 250, imp_vars.levelHeight/2 + 50, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://www.subtlepatterns.com")}, "texture"))
  this.buttons.push(new IconButton("JAY SALVAT", 16, imp_vars.levelWidth/2 - 150, imp_vars.levelHeight/2+180, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://buzz.jaysalvat.com/")}, "audio"))
  this.buttons.push(new IconButton("ERIN CATTO", 16, imp_vars.levelWidth/2 + 150, imp_vars.levelHeight/2+180, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://box2d.org/")}, "physics_engine"))
  this.buttons[1].extra_text = "MAIN MENU MUSIC"
  this.buttons[2].extra_text = "ALL OTHER MUSIC"
  this.buttons[3].extra_text = "TEXTURES"
  this.buttons[4].extra_text = "AUDIO API"
  this.buttons[5].extra_text = "PHYSICS ENGINE"

  this.fader = new Fader({
    "fade_in": 250,
    "fade_out": 250
  });
  this.fader.set_animation("fade_in");
}

CreditsState.prototype.process = function(dt) {
  this.fader.process(dt);
}

CreditsState.prototype.draw = function(ctx, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    set_bg("Hive 0", imp_vars.bg_opacity)
    this.bg_drawn = true
  }
  /*ctx.globalAlpha = .3
  /*ctx.drawImage(this.image, imp_vars.levelWidth/2 - this.image.width/2, imp_vars.levelHeight/2 - 100 - this.image.height/2 - 15)*/
  //ctx.globalAlpha = 1
  
  ctx.save()

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  draw_logo(ctx,imp_vars.levelWidth/2, 150, "CREDITS")
  
  ctx.font = '20px Muli'
  ctx.fillStyle = "white"//impulse_colors["impulse_blue"]
  ctx.textAlign = "center"
  ctx.shadowColor = ctx.fillStyle
  ctx.globalAlpha *= 1
  /*ctx.fillText("Music by Matt McFarland", imp_vars.levelWidth/2, imp_vars.levelHeight/2 - 20)
  ctx.fillText("Some textures from SubtlePatterns.com", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 30)
  ctx.fillText("Buzz HTML5 Audio API by Jay Salvat", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 80)
  ctx.fillText("Based on the Box2dWeb Physics Engine", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 130)
  ctx.fillText("Game design, UI design, programming, art", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 180)
  ctx.fillText("and everything else by Mark Zhang", imp_vars.levelWidth/2, imp_vars.levelHeight/2 + 210)*/
  ctx.globalAlpha /= 1

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(ctx)
  }
  ctx.restore();
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

