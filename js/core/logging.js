var logging = {};

logging.send_logging_to_server = function (msg, tags) {
  if (window.location.host === 'localhost') {
    window.console.log('LOGGING');
    window.console.log(msg);
    window.console.log(tags);
  } else {
    // window["Raven"]["captureMessage"](msg, tags);
  }
};

module.exports = logging;
