var constants = require('../data/constants.js');
var utils = require('./utils.js');

var dom = {};

dom.setUpDocument = function () {
  window.oncontextmenu = function ()
  {
    return false;     // cancel default menu
  };
  dom.centerCanvas();
};

dom.centerCanvas = function() {
  var dim = utils.getWindowDimensions();
  var canvas_container = document.getElementById('canvas_container');
  var bg_canvas_container = document.getElementById('bg_canvas_container');
  var message = document.getElementById('message');


  if(constants.canvasWidth < dim.w)
  {
    constants.offsetLeft = (dim.w-constants.canvasWidth)/2
    canvas_container.style.left =  Math.round(constants.offsetLeft) + 'px'
    bg_canvas_container.style.left =  Math.round(constants.offsetLeft) + 'px'
  }
  else
  {
    constants.offsetLeft = 0
  }
  if(constants.canvasHeight < dim.h)
  {
    constants.offsetTop = (dim.h-constants.canvasHeight)/2
    canvas_container.style.top = Math.round(constants.offsetTop) + 'px'
    bg_canvas_container.style.top =  Math.round(constants.offsetTop) + 'px'
  }
  else
  {
    constants.offsetTop = 0
  }
  message.style.display = ""
};

dom.centerMessage = function() {
  var message = document.getElementById("message");
  var dim = utils.getWindowDimensions()

  message.setAttribute("style", "display: block" )
  if(message.clientWidth < dim.w)
  {
    constants.offsetLeft = (dim.w-message.clientWidth)/2
    message.style.left =  Math.round(constants.offsetLeft) + 'px'
  }
  else
  {
    constants.offsetLeft = 0
  }
  if(message.clientHeight < dim.h)
  {
    constants.offsetTop = (dim.h-message.clientHeight )/2
    message.style.top = Math.round(constants.offsetTop) + 'px'
  }
  else
  {
    constants.offsetTop = 0
  }
}

dom.redirectToChrome = function() {
  window.location = "https://www.google.com/intl/en/chrome/browser/";
};

dom.clearMessage = function() {
  var message = document.getElementById("message");
  message.setAttribute("style", "display: none" )
};

dom.IsInFullScreen = function () {
  return (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
            (document.mozFullScreen || document.webkitIsFullScreen);
}

dom.toggleFullScreen = function () {
  var isFullScreen = dom.IsInFullScreen();
  var docElm = document.documentElement;
  if (!isFullScreen) {

      if (docElm.requestFullscreen) {
          docElm.requestFullscreen();
      }
      else if (docElm.mozRequestFullscreen) {
          docElm.mozRequestFullscreen();
      }
      else if (docElm.webkitRequestFullscreen) {
          docElm.webkitRequestFullscreen ();
      }
  } else {
    if (document.exitFullscreen) {
          document.exitFullscreen();
      }
      else if (document.mozExitFullscreen) {
          document.mozExitFullscreen();
      }
      else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen ();
      }
  }
}

dom.isChromeBrowser = function () {
  return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
};

module.exports = dom;
