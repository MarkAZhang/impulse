window.onload = function() {
  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if(is_chrome) {
    main.executeGame()
  } else {
    dom.centerMessage()
    document.getElementById('continue_btn').addEventListener('click', dom.clearMessageAndStartGame);
    document.getElementById('download_btn').addEventListener('click', dom.redirectToChrome);
  }
}
