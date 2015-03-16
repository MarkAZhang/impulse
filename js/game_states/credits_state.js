CreditsState.prototype = new GameState

CreditsState.prototype.constructor = CreditsState

function CreditsState(after_main_game, main_game_hive_numbers, main_game_args) {
  this.after_main_game = after_main_game;
  this.main_game_hive_numbers = main_game_hive_numbers;
  this.main_game_args = main_game_args;
  this.bg_drawn = false
  this.start_clicked = false
  this.buttons = []
  var _this = this


  this.buttons.push(new IconButton("KEVIN MACLEOD", 16, dom.levelWidth/2 - 250, dom.levelHeight/2 + 50, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://incompetech.com")}, "note"))
  this.buttons.push(new IconButton("MATT MCFARLAND", 16, dom.levelWidth/2, dom.levelHeight/2 + 50, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://www.mattmcfarland.com")}, "note"))
  this.buttons.push(new IconButton("SUBTLE PATTERNS", 16, dom.levelWidth/2 + 250, dom.levelHeight/2 + 50, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://www.subtlepatterns.com")}, "texture"))
  this.buttons.push(new IconButton("JAY SALVAT", 16, dom.levelWidth/2 - 150, dom.levelHeight/2+180, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://buzz.jaysalvat.com/")}, "audio"))
  this.buttons.push(new IconButton("ERIN CATTO", 16, dom.levelWidth/2 + 150, dom.levelHeight/2+180, 150, 70, "white", impulse_colors["impulse_blue"], function(){window.open("http://box2d.org/")}, "physics_engine"))
  this.buttons[0].extra_text = "MAIN MENU MUSIC"
  this.buttons[1].extra_text = "ALL OTHER MUSIC"
  this.buttons[2].extra_text = "TEXTURES"
  this.buttons[3].extra_text = "AUDIO API"
  this.buttons[4].extra_text = "PHYSICS ENGINE"

  if (!this.after_main_game) {
    this.buttons.push(new IconButton("BACK", 16, dom.levelWidth/2, dom.levelHeight/2 + 260, 60, 65, "white", impulse_colors["impulse_blue"], function(){
      _this.fader.set_animation("fade_out", function() {
        game_engine.switch_game_state(new TitleState(_this));
      });
    }, "back"))
  }

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
    game_engine.setBg("Hive 0", imp_params.hive0_bg_opacity)
    this.bg_drawn = true
  }

  ctx.save()

  if (this.fader.get_current_animation() == "fade_in") {
    ctx.globalAlpha *= this.fader.get_animation_progress();
  } else if (this.fader.get_current_animation() == "fade_out") {
    ctx.globalAlpha *= 1 - this.fader.get_animation_progress();
  }

  uiRenderUtils.drawPorcelainLogo(ctx, 400, 180);
  ctx.font = '16px Muli'
  ctx.fillStyle = impulse_colors["impulse_blue"]
  ctx.textAlign = "center"
  ctx.shadowColor = ctx.fillStyle
  ctx.fillText("CREATED BY", dom.levelWidth/2, 60)
  ctx.fillText("WITH CREDIT TO", dom.levelWidth/2, 260)
  /*ctx.fillText("Music by Matt McFarland", dom.levelWidth/2, dom.levelHeight/2 - 20)
  ctx.fillText("Some textures from SubtlePatterns.com", dom.levelWidth/2, dom.levelHeight/2 + 30)
  ctx.fillText("Buzz HTML5 Audio API by Jay Salvat", dom.levelWidth/2, dom.levelHeight/2 + 80)
  ctx.fillText("Based on the Box2dWeb Physics Engine", dom.levelWidth/2, dom.levelHeight/2 + 130)
  ctx.fillText("Game design, UI design, programming, art", dom.levelWidth/2, dom.levelHeight/2 + 180)
  ctx.fillText("and everything else by Mark Zhang", dom.levelWidth/2, dom.levelHeight/2 + 210)*/
  if (this.after_main_game) {
    ctx.save();
    ctx.globalAlpha *= 0.5;
    ctx.font = '16px Muli'
    ctx.fillStyle = impulse_colors["impulse_blue"];
    ctx.fillText("PRESS ANY KEY TO CONTINUE", dom.levelWidth/2, dom.levelHeight - 30);
    ctx.restore();
  }

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

CreditsState.prototype.on_key_down = function (keyCode) {
  if (this.after_main_game) {
    var _this = this;
    this.fader.set_animation("fade_out", function() {
      game_engine.switch_game_state(new RewardGameState(_this.main_game_hive_numbers, true, _this.main_game_args));
    });
  }
}
