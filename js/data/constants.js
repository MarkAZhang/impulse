var constants = {};

constants.drawFactor = 15;

constants.canvasWidth = 1200;
constants.canvasHeight = 600;

constants.sideBarWidth = 200;
constants.levelWidth = constants.canvasWidth - 2 * constants.sideBarWidth;
constants.levelHeight = constants.canvasHeight;
constants.offsetLeft = 0;
constants.offsetTop = 0;

constants.enemyCanvasFactor = 1.5;

var impulseColors = {};
impulseColors['bronze'] = "#cc8032"
impulseColors['silver'] = "#c0c0c0"
impulseColors['impulse_target_blue'] = "rgba(0, 128, 255, 0.2)"
impulseColors['impulse_blue'] = "rgb(0, 128, 255)"
impulseColors['impulse_blue_dark'] = "#13527e"
impulseColors['rose'] = "#ff66cc";
impulseColors['gold'] = "#edb900"

impulseColors['menuBg'] = '#110f10';
impulseColors['world 0 bg'] = '#080808';
impulseColors['world 1 bg'] = '#000d00';
impulseColors['world 2 bg'] = '#010310';
impulseColors['world 3 bg'] = '#0f0013';
impulseColors['world 4 bg'] = '#180000';

impulseColors['world 0'] = "#333"
impulseColors['world 0 lite'] = "#999"
impulseColors['world 0 bright'] = "#fff"
impulseColors['world 0 dark'] = "#080808"
impulseColors['world 1'] = "#034903"
impulseColors['world 1 lite'] = "#046a04"
impulseColors['world 1 bright'] = "#00ff00"
impulseColors['world 1 dark'] = "#000d00"
impulseColors['world 2'] = "#0020b0"//"rgb(0, 206, 209)"
impulseColors['world 2 lite'] = "#0028dd"//"rgb(0, 206, 209)"
impulseColors['world 2 bright'] = "#003DFF" //"#2474fe"
impulseColors['world 2 dark'] = "#010310"//"rgb(0, 206, 209)"
impulseColors['world 3'] = "#450555"
impulseColors['world 3 lite'] = "#5f0775"
impulseColors['world 3 dark'] = "#0f0013"
impulseColors['world 3 bright'] = "#C000FF"//"#a00cc5"
impulseColors['world 4'] = "#600"
impulseColors['world 4 lite'] = "#a00"
impulseColors['world 4 dark'] = "#180000"
impulseColors['world 4 bright'] = "#f00"
impulseColors["player_color"] = "rgb(32, 140, 231)"
impulseColors["boss"] = "red"
impulseColors["boss dark"] = "#900"
impulseColors["boss 1"] = "#05c205"
impulseColors["boss 2"] = "#002eff"
impulseColors["boss 3"] = "#C000FF"
impulseColors["boss 4"] = "#f00"

constants.colors = impulseColors;

var gsKeys = {};

gsKeys.CREDITS_STATE = 0;
gsKeys.GAME_OVER_STATE = 1;
gsKeys.IMPULSE_GAME_STATE = 2;
gsKeys.INTRO_STATE = 3;
gsKeys.LEVEL_EDITOR_STATE = 4;
gsKeys.LEVEL_INTRO_STATE = 5;
gsKeys.LOADER_GAME_STATE = 6;
gsKeys.MAIN_GAME_SUMMARY_STATE = 7;
gsKeys.MAIN_GAME_TRANSITION_STATE = 8;
gsKeys.MUSIC_PLAYER_STATE = 9;
gsKeys.QUEST_GAME_STATE = 10;
gsKeys.REWARD_GAME_STATE = 11;
gsKeys.TITLE_STATE = 12;
gsKeys.WORLD_MAP_STATE = 13;

constants.gsKeys = gsKeys;

module.exports = constants;
