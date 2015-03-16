var main = {};

main.executeGame = function() {
  io.set_up_listeners();
  dom.setUpDocument();
  saveData.loadGame()
  layers.setUpLayers()
  controls.setKeyBindings()
  imp_params.impulse_music = new MusicPlayer()
  imp_params.last_time = (new Date()).getTime();
  game_engine.switch_game_state(new IntroState());
  game_engine.step()
}
