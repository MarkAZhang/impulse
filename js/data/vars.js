var imp_params = {
  step_id: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  sidebarWidth: 0,
  levelWidth: 0,
  levelHeight: 0,
  ctx: null,
  canvas: null,
  bg_canvas: null,
  bg_ctx: null,
  cur_popup_message: null,
  draw_factor: 15,
  last_time: 0,
  cur_game_state: null,
  cur_dialog_box: null,
  save_name: "impulse_save_data",
  impulse_music: null,
  minified: true,
  bg_opacity: 0.3,
  hive0_bg_opacity: 0.6 /* hive0 gets rendered differently, needs to be brighter */,
  switch_bg_duration: null,
};

imp_params.debug = {
  god_mode_enabled: true,
  god_mode: false,
  dev: false,
  old_menu: false,
  show_zero_level: false,
  is_beta: false,
  instant_victory_enabled: false,
  hide_pause_menu: false
};

if (window.location.host === 'localhost' && window.location.search.indexOf("dev=1") !== -1) {
  imp_params.debug.dev = true;
}
if (window.location.pathname.indexOf("beta") !== -1) {
  imp_params.debug.is_beta = true;
}

imp_params.WALL_BIT = 0x0001;
imp_params.PLAYER_BIT = 0x0002;
imp_params.ENEMY_BIT = 0x0004;
imp_params.BOSS_ONE_BIT = 0x0008;
imp_params.BOSS_THREE_BIT = 0x0010;
imp_params.BOSS_FOUR_BIT = 0x0011;
imp_params.BOSS_BITS = 0x0018;


