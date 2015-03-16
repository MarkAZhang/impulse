var dom = {};

dom.canvasWidth = 1200;
dom.canvasHeight = 600;

dom.sideBarWidth = 200;
dom.levelWidth = dom.canvasWidth - 2 * dom.sideBarWidth;
dom.levelHeight = dom.canvasHeight;

dom.setUpDocument = function () {
  window.oncontextmenu = function ()
  {
    return false;     // cancel default menu
  };
  dom.centerCanvas();
};

dom.centerCanvas = function() {
  var dim = utils.getWindowDimensions()

  if(dom.canvasWidth < dim.w)
  {
    offset_left = (dim.w-dom.canvasWidth)/2
    canvas_container.style.left =  Math.round(offset_left) + 'px'
    bg_canvas_container.style.left =  Math.round(offset_left) + 'px'
  }
  else
  {
    offset_left = 0
  }
  if(dom.canvasHeight < dim.h)
  {
    offset_top = (dim.h-dom.canvasHeight)/2
    canvas_container.style.top = Math.round(offset_top) + 'px'
    bg_canvas_container.style.top =  Math.round(offset_top) + 'px'
  }
  else
  {
    offset_top = 0
  }
  message.style.display = ""
};

dom.centerMessage = function() {
  var message = document.getElementById("message");
  var dim = utils.getWindowDimensions()

  message.setAttribute("style", "display: block" )
  if(message.clientWidth < dim.w)
  {
    offset_left = (dim.w-message.clientWidth)/2
    message.style.left =  Math.round(offset_left) + 'px'
  }
  else
  {
    offset_left = 0
  }
  if(message.clientHeight < dim.h)
  {
    offset_top = (dim.h-message.clientHeight )/2
    message.style.top = Math.round(offset_top) + 'px'
  }
  else
  {
    offset_top = 0
  }
}

dom.redirectToChrome = function() {
  window.location = "https://www.google.com/intl/en/chrome/browser/";
};

dom.clearMessageAndStartGame = function() {
  message.setAttribute("style", "display: none" )
  setTimeout(function() {
    main.executeGame()
  }, 50)
}


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
  if (game_engine.cur_dialog_box && game_engine.cur_dialog_box instanceof OptionsMenu) {
    game_engine.cur_dialog_box.sendFullscreenSignal(!isFullScreen);
  }
}

dom.isChromeBrowser = function () {
  return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
};
