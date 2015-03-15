function set_key_bindings() {
  var type = imp_params.player_data.options.control_hand +" "+imp_params.player_data.options.control_scheme
  if(type == "left mouse") {
    imp_params.keys = {
      LEFT_KEY: 37,
      UP_KEY: 38,
      RIGHT_KEY: 39,
      DOWN_KEY: 40,
      PAUSE: 13,
      GOD_MODE_KEY: 71,
      SECONDARY_PAUSE: 27,
      GATEWAY_KEY: 16,
      MUTE_KEY: 77,
      FULLSCREEN_KEY: 70,
      EXIT_KEY: 39,
      SAVE_AND_QUIT_KEY: 37,
      RESTART_KEY: 16,
      QUIT_KEY: 39,
      EXIT_GAME_KEY: 37,
      RESUME_GAME_KEY: 39,
      DELETE_GAME_KEY: 40,
      NEXT_KEY: 13
    }
  } else if(type == "right mouse") {
    imp_params.keys = {
      LEFT_KEY: 65,
      UP_KEY: 87,
      RIGHT_KEY: 68,
      DOWN_KEY: 83,
      PAUSE: 81,
      GOD_MODE_KEY: 71,
      SECONDARY_PAUSE: 27,
      GATEWAY_KEY: 32,
      MUTE_KEY: 77,
      FULLSCREEN_KEY: 70,
      EXIT_KEY: 69,
      RESTART_KEY: 82,
      SAVE_AND_QUIT_KEY: 83,
      QUIT_KEY: 81,
      EXIT_GAME_KEY: 69,
      RESUME_GAME_KEY: 82,
      DELETE_GAME_KEY: 68,
      NEXT_KEY: 32
    }
  } else if(type == "right keyboard") {
    imp_params.keys = {
      LEFT_KEY: 37,
      UP_KEY: 38,
      RIGHT_KEY: 39,
      DOWN_KEY: 40,
      PAUSE: 81,
      GOD_MODE_KEY: 71,
      SECONDARY_PAUSE: 27,
      ILEFT_KEY: 65,
      IUP_KEY: 87,
      IRIGHT_KEY: 68,
      IDOWN_KEY: 83,
      GATEWAY_KEY: 32,
      MUTE_KEY: 77,
      FULLSCREEN_KEY: 70,
      EXIT_KEY: 69,
      RESTART_KEY: 82,
      SAVE_AND_QUIT_KEY: 83,
      QUIT_KEY: 81,
      EXIT_GAME_KEY: 69,
      RESUME_GAME_KEY: 82,
      DELETE_GAME_KEY: 68,
      NEXT_KEY: 32,
    }
  }
}
