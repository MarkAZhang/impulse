debugVars = {
  god_mode_enabled: true,
  god_mode: false,
  dev: false,
  old_menu: false,
  show_zero_level: false,
  is_beta: false,
  instant_victory_enabled: false,
  hide_pause_menu: false,
  use_minified_worker: true,
};

if (window.location.host === 'localhost' && window.location.search.indexOf("dev=1") !== -1) {
  debugVars.dev = true;
}
if (window.location.pathname.indexOf("beta") !== -1) {
  debugVars.is_beta = true;
}
