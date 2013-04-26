MusicPlayerState.prototype = new GameState

MusicPlayerState.prototype.constructor = MusicPlayerState

function MusicPlayerState() {
  this.songs = {
    "Kickit HomeBoy": "kickit",
    "Driven": "driven"
  }
  this.setup_music_buttons()
}

MusicPlayerState.prototype.draw = function(context, bg_ctx) {


}

MusicPlayerStata.prototype.setup_music_buttons = function() {
  this.buttons.push(new SmallButton("CLASSIC", 20, canvasWidth/2, canvasHeight/2+20, 200, 50, function(){switch_game_state(new ClassicSelectState())}))


}