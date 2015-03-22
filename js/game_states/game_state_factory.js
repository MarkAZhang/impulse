var gsKeys = require('../data/constants.js').gsKeys;

var CreditsState = require('../game_states/credits_state.js');
var GameOverState = require('../game_states/game_over_state.js');
var ImpulseGameState = require('../game_states/impulse_game_state.js');
var IntroState = require('../game_states/intro_state.js');
var LevelEditorState = require('../game_states/level_editor_state.js');
var LevelIntroState = require('../game_states/level_intro_state.js');
var MainGameSummaryState = require('../game_states/main_game_summary_state.js');
var MainGameTransitionState = require('../game_states/main_game_transition_state.js');
var MusicPlayerState = require('../game_states/music_player_state.js');
var QuestGameState = require('../game_states/quest_game_state.js');
var RewardGameState = require('../game_states/reward_game_state.js');
var TitleState = require('../game_states/title_state.js');
var WorldMapState = require('../game_states/world_map_state.js');

var GameStateFactory = {};

var a = gsKeys.CREDITS_STATE;

var gameStateMap = {};
gameStateMap[gsKeys.CREDITS_STATE] = CreditsState;
gameStateMap[gsKeys.GAME_OVER_STATE] = GameOverState;
gameStateMap[gsKeys.IMPULSE_GAME_STATE] = ImpulseGameState;
gameStateMap[gsKeys.INTRO_STATE] = IntroState;
gameStateMap[gsKeys.LEVEL_EDITOR_STATE] = LevelEditorState;
gameStateMap[gsKeys.LEVEL_INTRO_STATE] = LevelIntroState;
gameStateMap[gsKeys.MAIN_GAME_SUMMARY_STATE] = MainGameSummaryState;
gameStateMap[gsKeys.MAIN_GAME_TRANSITION_STATE] = MainGameTransitionState;
gameStateMap[gsKeys.MUSIC_PLAYER_STATE] = MusicPlayerState;
gameStateMap[gsKeys.QUEST_GAME_STATE] = QuestGameState;
gameStateMap[gsKeys.REWARD_GAME_STATE] = RewardGameState;
gameStateMap[gsKeys.TITLE_STATE] = TitleState;
gameStateMap[gsKeys.WORLD_MAP_STATE] = WorldMapState;

GameStateFactory.createGameState = function(gameStateKey, opts) {
  return new (gameStateMap[gameStateKey])(opts);
};

module.exports = GameStateFactory;
