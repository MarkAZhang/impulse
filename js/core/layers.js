var constants = require('../data/constants.js');

var layers = {};

layers.setUpLayers = function() {
  var title_bg_canvas = document.createElement('canvas');
  title_bg_canvas.width = constants.levelWidth;
  title_bg_canvas.height = constants.levelHeight;
  layers.titleBgCanvas = title_bg_canvas

  var alt_title_bg_canvas = document.createElement('canvas');
  alt_title_bg_canvas.width = constants.levelWidth;
  alt_title_bg_canvas.height = constants.levelHeight;
  layers.altTitleBgCanvas = alt_title_bg_canvas

  var world_menu_bg_canvas = document.createElement('canvas');
  world_menu_bg_canvas.width = constants.levelWidth;
  world_menu_bg_canvas.height = constants.levelHeight;
  layers.worldMenuBgCanvas = world_menu_bg_canvas

  // screen setup
  layers.mainCanvas = document.getElementById("canvas");
  var canvas_container = document.getElementById("canvas_container");
  layers.mainCanvas.width = constants.canvasWidth;
  layers.mainCanvas.height =  constants.canvasHeight;
  canvas_container.style.width = constants.canvasWidth + 'px'
  canvas_container.style.height = constants.canvasHeight + 'px'

  layers.bgCanvas = document.getElementById("bg_canvas");
  var bg_canvas_container = document.getElementById("bg_canvas_container");
  layers.bgCanvas.width = constants.canvasWidth;
  layers.bgCanvas.height =  constants.canvasHeight;
  bg_canvas_container.style.width = constants.canvasWidth + 'px'
  bg_canvas_container.style.height = constants.canvasHeight + 'px'

  layers.mainCtx = layers.mainCanvas.getContext('2d');
  layers.bgCtx = layers.bgCanvas.getContext('2d');
}

module.exports = layers;
