var dom = require('./core/dom.js');
var main = require('./core/main.js');

window.onload = function() {
  if(dom.isChromeBrowser()) {
    main.executeGame()
  } else {
    dom.centerMessage()
    document.getElementById('continue_btn').addEventListener('click', main.clearMessageAndStartGame);
    document.getElementById('download_btn').addEventListener('click', dom.redirectToChrome);
  }
}
