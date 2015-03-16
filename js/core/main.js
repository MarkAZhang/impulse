var main = {};

main.executeGame = function() {
  io.set_up_listeners();
  dom.setUpDocument();
  saveData.loadGame()
  layers.setUpLayers()
  controls.setKeyBindings()
  game_engine.switch_game_state(new IntroState());
  game_engine.step()
}
