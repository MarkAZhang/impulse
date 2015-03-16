var layers = {};

layers.setUpLayers = function() {
  var title_bg_canvas = document.createElement('canvas');
  title_bg_canvas.width = dom.levelWidth;
  title_bg_canvas.height = dom.levelHeight;
  layers.titleBgCanvas = title_bg_canvas

  var alt_title_bg_canvas = document.createElement('canvas');
  alt_title_bg_canvas.width = dom.levelWidth;
  alt_title_bg_canvas.height = dom.levelHeight;
  layers.altTitleBgCanvas = alt_title_bg_canvas

  var world_menu_bg_canvas = document.createElement('canvas');
  world_menu_bg_canvas.width = dom.levelWidth;
  world_menu_bg_canvas.height = dom.levelHeight;
  layers.worldMenuBgCanvas = world_menu_bg_canvas

  // screen setup
  layers.mainCanvas = document.getElementById("canvas");
  var canvas_container = document.getElementById("canvas_container");
  layers.mainCanvas.width = dom.canvasWidth;
  layers.mainCanvas.height =  dom.canvasHeight;
  canvas_container.style.width = dom.canvasWidth + 'px'
  canvas_container.style.height = dom.canvasHeight + 'px'

  layers.bgCanvas = document.getElementById("bg_canvas");
  var bg_canvas_container = document.getElementById("bg_canvas_container");
  layers.bgCanvas.width = dom.canvasWidth;
  layers.bgCanvas.height =  dom.canvasHeight;
  bg_canvas_container.style.width = dom.canvasWidth + 'px'
  bg_canvas_container.style.height = dom.canvasHeight + 'px'

  layers.mainCtx = layers.mainCanvas.getContext('2d');
  layers.bgCtx = layers.bgCanvas.getContext('2d');
}

layers.draw_factor = 15;
