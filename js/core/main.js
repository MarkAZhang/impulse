var controls = require('./controls.js');
var dom = require('./dom.js');
var EnemyFactory = require('../enemy/enemy_factory.js');
var enemyMap = require('../enemy/enemy_map.js');
var enemyRenderUtils = require('../render/enemy.js');
var game_engine = require('../core/game_engine.js');
var gsKeys = require('../data/constants.js').gsKeys;
var io = require('./io.js');
var graphics = require('../core/graphics.js')
var layers = require('./layers.js');
var music_player = require('../core/music_player.js');
var saveData = require('../load/save_data.js');

var GameStateFactory = require('../game_states/game_state_factory.js');
var IntroState = require('../game_states/intro_state.js');

var main = {};

main.executeGame = function() {
  EnemyFactory.setEnemyMap(enemyMap);
  saveData.loadGame()
  io.set_up_listeners();
  dom.setUpDocument();
  layers.setUpLayers()
  controls.setKeyBindings()
  graphics.generateEnemyBufferImages();
  music_player.setPlayerOptions();
  game_engine.injectGameStateFactory(GameStateFactory);
  game_engine.switch_game_state(gsKeys.INTRO_STATE, {});
  game_engine.step()
}

main.clearMessageAndStartGame = function () {
  dom.clearMessage();
  setTimeout(function() {
    main.executeGame();
  }, 50)
};

module.exports = main;
