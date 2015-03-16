window.onload = function() {
  if(dom.isChromeBrowser()) {
    main.executeGame()
  } else {
    dom.centerMessage()
    document.getElementById('continue_btn').addEventListener('click', dom.clearMessageAndStartGame);
    document.getElementById('download_btn').addEventListener('click', dom.redirectToChrome);
  }
}
