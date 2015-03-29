var audioData = require('../data/audio_data.js');
var constants = require('../data/constants.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = constants.gsKeys;
var music_player = require('../core/music_player.js');

var GameState = require('../game_states/game_state.js');
var Slider = require('../ui/slider.js');
var SmallButton = require('../ui/small_button.js');

MusicPlayerState.prototype = new GameState

MusicPlayerState.prototype.constructor = MusicPlayerState

function MusicPlayerState() {
  this.buttons = []

  this.first_column = constants.levelWidth*3/8;
  this.second_column = constants.levelWidth*5/8;
  this.column_top = 300;
  this.column_space = 50;
  this.button_color = constants.colors["impulse_blue"]
  this.setup_ui()

  this.cur_song = null
  music_player.stop_bg()
}

MusicPlayerState.prototype.draw = function(context, bg_ctx) {
  if(!this.bg_drawn) {
    bg_canvas.setAttribute("style", "")
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "black"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }

  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].draw(context)
  }
  this.slider.draw(context)

  if(this.cur_song != null) {
    context.beginPath()
    context.textAlign = "center"
    context.font = "12px Open Sans"
    context.fillStyle = constants.colors["impulse_blue"]
    context.fillText("Currently Playing: " + this.cur_song, constants.levelWidth/2, 175)
    var duration = Math.round(music_player.getCurrentSong().sound.getDuration())
    var curTime = Math.round(music_player.getCurrentSong().sound.getTime())
    var durSecondsString = Math.floor(duration%60)
    if(durSecondsString < 10) durSecondsString = "0"+durSecondsString
    var curSecondsString = Math.floor(curTime%60)
    if(curSecondsString < 10) curSecondsString = "0"+curSecondsString

    context.fillText(Math.floor(curTime/60)+":"+curSecondsString, constants.levelWidth*1/4, 220)
    context.fillText(Math.floor(duration/60)+":"+durSecondsString, constants.levelWidth*3/4, 220)

  }
}

MusicPlayerState.prototype.setup_ui = function() {

  this.slider = new Slider(constants.levelWidth/2, 200, constants.levelWidth/2, 5, this.button_color)
  this.slider.value = 0
  this.slider.active = false


  this.buttons.push(new SmallButton("PLAY", 20, constants.levelWidth/2 - 50, 250, 100, 50, this.button_color, "blue",

        function() {
          music_player.resume_bg();
        }))

  this.buttons.push(new SmallButton("PAUSE", 20, constants.levelWidth/2 + 50, 250, 100, 50, this.button_color, "blue",

        function() {
          music_player.pause_bg();
        }))
  this.setup_music_buttons()

    this.buttons.push(new SmallButton("MAIN MENU", 20, constants.levelWidth/2, constants.levelHeight/2+270, 200, 50, this.button_color, "blue",
      function (){
        setTimeout(function (){
          game_engine.switch_game_state(gsKeys.TITLE_STATE, {});
        }, 20)
      }));
}

MusicPlayerState.prototype.setup_music_buttons = function() {

  var index = 0;
  for(song in audioData.songs) {
    var x = (index%2 == 0) ? this.first_column : this.second_column;
    var _this = this;
    this.buttons.push(new SmallButton(song, 20, x, this.column_top + Math.floor(index/2) * this.column_space, 200, 50, this.button_color, "blue",
          (function(this_song) {
          return function() {
            _this.cur_song = this_song;
            music_player.play_bg(audioData.songs[_this.cur_song])
          }})(song)

          ))

    index++

  }
}

MusicPlayerState.prototype.on_mouse_move = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++)
  {
    this.buttons[i].on_mouse_move(x, y)
  }
  this.slider.on_mouse_move(x,y)
}

MusicPlayerState.prototype.on_click = function(x, y) {
  for(var i = 0; i < this.buttons.length; i++) {
    this.buttons[i].on_click(x, y)
  }
}

MusicPlayerState.prototype.on_mouse_down = function(x,y) {
  this.slider.on_mouse_down(x,y)
}


MusicPlayerState.prototype.on_mouse_up = function(x,y) {
  if(music_player.getCurrentSong().sound != null && this.slider.drag) {
    music_player.skip(music_player.getCurrentSong().sound.getDuration() * this.slider.value)
  }
  this.slider.on_mouse_up(x,y)
}

MusicPlayerState.prototype.process = function(dt) {
  if(this.cur_song != null && !this.slider.drag) {
    var value = music_player.getCurrentPercent()
    this.slider.value = value
  }
}

module.exports = MusicPlayerState;
