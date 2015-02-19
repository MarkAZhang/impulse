var imp_vars = {
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
  player_data: {},
  impulse_music: null,
  minified: true,
  bg_opacity: 0.3,
  hive0_bg_opacity: 0.6 /* hive0 gets rendered differently, needs to be brighter */,
  switch_bg_duration: null,
  share_button_open: true, // button starts out as open.
  dark_one_speaks: false,
  last_tutorial_level: "HIVE 0-4"
};
imp_vars.debug = {
  god_mode_enabled: true,
  god_mode: false,
  dev: false,
  old_menu: false,
  story_mode: false,
  show_zero_level: false,
  is_beta: false,
  instant_victory_enabled: false
};

if (window.location.host === 'localhost' && window.location.search.indexOf("dev=1") !== -1) {
  imp_vars.debug.dev = true;
}
if (window.location.pathname.indexOf("beta") !== -1) {
  imp_vars.debug.is_beta = true;
}

window["impulse_main"] =  function() {
    b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2AABB = Box2D.Collision.b2AABB
    , b2BodyDef = Box2D.Dynamics.b2BodyDef
    , b2Body = Box2D.Dynamics.b2Body
    , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    , b2Fixture = Box2D.Dynamics.b2Fixture
    , b2World = Box2D.Dynamics.b2World
    , b2MassData = Box2D.Collision.Shapes.b2MassData
    , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    , b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    , b2ContactListener = Box2D.Dynamics.b2ContactListener

    imp_vars.canvasWidth = 1200;
    imp_vars.canvasHeight = 600;

    //topbarHeight = 35
    imp_vars.sidebarWidth = 200;

    imp_vars.levelWidth = imp_vars.canvasWidth - 2 * imp_vars.sidebarWidth;

    imp_vars.levelHeight = imp_vars.canvasHeight

    // screen setup
    imp_vars.canvas = document.getElementById("canvas");
    var canvas_container = document.getElementById("canvas_container");
    imp_vars.canvas.width = imp_vars.canvasWidth;
    imp_vars.canvas.height =  imp_vars.canvasHeight;
    canvas_container.style.width = imp_vars.canvasWidth + 'px'
    canvas_container.style.height = imp_vars.canvasHeight + 'px'

    imp_vars.bg_canvas = document.getElementById("bg_canvas");
    var bg_canvas_container = document.getElementById("bg_canvas_container");
    imp_vars.bg_canvas.width = imp_vars.canvasWidth;
    imp_vars.bg_canvas.height =  imp_vars.canvasHeight;
    bg_canvas_container.style.width = imp_vars.canvasWidth + 'px'
    bg_canvas_container.style.height = imp_vars.canvasHeight + 'px'

    imp_vars.ctx = imp_vars.canvas.getContext('2d');
    imp_vars.bg_ctx = imp_vars.bg_canvas.getContext('2d');
    window.addEventListener('keydown', on_key_down, false);
    window.addEventListener('keyup', on_key_up, false);
    window.addEventListener('click', on_click, false);
    window.addEventListener('mousedown', on_mouse_down, false);
    window.addEventListener('mouseup', on_mouse_up, false);
    window.addEventListener('mousemove', on_mouse_move, false)
    window.addEventListener('resize', centerCanvas, false)
    window.oncontextmenu = function ()
    {
        return false;     // cancel default menu
    }

    //addVisibilityListener()

    centerCanvas()
    load_game()
    set_up_enemy_images()
    set_up_player_images()
    set_up_title_bg()
    set_up_game_buttons()
    set_key_bindings()
    imp_vars.impulse_music = new MusicPlayer()
    /*if(imp_vars.player_data.first_time) {
      imp_vars.cur_game_state = new HowToPlayState("first_time_tutorial")
    } else {*/
    imp_vars.cur_game_state = new IntroState(null)
    //}
    imp_vars.last_time = (new Date()).getTime();
    step()
}

function set_up_game_buttons() {
  imp_params.game_buttons = []
  /*imp_params.game_buttons.push(new IconButton("", 16, imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 20, 30, 30, this.color, this.bright_color, function() {
    toggle_mute()
  }, "mute_in_game"))

  imp_params.game_buttons.push(new IconButton("", 16, imp_vars.sidebarWidth/2 - 40, imp_vars.canvasHeight - 20, 30, 30, this.color, this.bright_color, function() {
    toggle_pause()
  }, "pause_in_game"))

  imp_params.game_buttons.push(new IconButton("", 16, imp_vars.sidebarWidth/2 + 40, imp_vars.canvasHeight - 20, 30, 30, this.color, this.bright_color, function() {
    toggleFullScreen()
  }, "fullscreen_in_game"))*/
}

function toggle_pause() {
  if (imp_vars.cur_game_state instanceof ImpulseGameState) {
    imp_vars.cur_game_state.toggle_pause()
  }
}

function set_up_player_images() {
  imp_params.ultimate_image = get_ultimate_canvas()
}

/*function addVisibilityListener() {
  var hidden = "hidden";

    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", on_visibility_change);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", on_visibility_change);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", on_visibility_change);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", on_visibility_change);
    // IE 9 and lower:
    else if ('onfocusin' in document)
        document.onfocusin = document.onfocusout = on_visibility_change;
    // All others:
    else
        window.onpageshow = window.onpagehide
            = window.onfocus = window.onblur = on_visibility_change;

}*/

function centerCanvas() {
  var dim = getWindowDimensions()


    if(imp_vars.canvasWidth < dim.w)
    {
      offset_left = (dim.w-imp_vars.canvasWidth)/2
      canvas_container.style.left =  Math.round(offset_left) + 'px'
      bg_canvas_container.style.left =  Math.round(offset_left) + 'px'
    }
    else
    {
      offset_left = 0
    }
    if(imp_vars.canvasHeight < dim.h)
    {
      offset_top = (dim.h-imp_vars.canvasHeight)/2
      canvas_container.style.top = Math.round(offset_top) + 'px'
      bg_canvas_container.style.top =  Math.round(offset_top) + 'px'
    }
    else
    {
      offset_top = 0
    }
    message.style.display = ""
}

function set_up_title_bg() {
  var title_bg_canvas = document.createElement('canvas');
  title_bg_canvas.width = imp_vars.levelWidth;
  title_bg_canvas.height = imp_vars.levelHeight;
  imp_vars.title_bg_canvas = title_bg_canvas

  var alt_title_bg_canvas = document.createElement('canvas');
  alt_title_bg_canvas.width = imp_vars.levelWidth;
  alt_title_bg_canvas.height = imp_vars.levelHeight;
  imp_vars.alt_title_bg_canvas = alt_title_bg_canvas

  var world_menu_bg_canvas = document.createElement('canvas');
  world_menu_bg_canvas.width = imp_vars.levelWidth;
  world_menu_bg_canvas.height = imp_vars.levelHeight;
  imp_vars.world_menu_bg_canvas = world_menu_bg_canvas
}

function switch_bg(bg_file, duration, alpha) {
  // Only perform the switch if the bg_file is different.
  if (imp_vars.bg_file != bg_file) {
    imp_vars.switch_bg_duration = duration;
    imp_vars.switch_bg_timer = duration;
    var alt_title_bg_ctx = imp_vars.alt_title_bg_canvas.getContext('2d');
    // bg_file can also be a color.
    if (bg_file.substring(0, 1) == "#") {
      alt_title_bg_ctx.fillStyle = bg_file;
      alt_title_bg_ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    } else {
      draw_bg(alt_title_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, bg_file)
    }

    imp_vars.alt_bg_alpha = alpha;
    imp_vars.alt_bg_file = bg_file;
  }
}

// Will immediately draw the new bg onto the bg_ctx.
function set_bg(bg_file, alpha) {
  var title_bg_ctx = imp_vars.title_bg_canvas.getContext('2d');
  if (bg_file.substring(0, 1) == "#") {
    title_bg_ctx.fillStyle = bg_file;
    title_bg_ctx.fillRect(0, 0, imp_vars.levelWidth, imp_vars.levelHeight);
  } else {
    draw_bg(title_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, bg_file)
  }
  imp_vars.bg_alpha = alpha;
  imp_vars.bg_file = bg_file;

  imp_vars.bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
  imp_vars.bg_ctx.fillStyle = "#000"
  imp_vars.bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
  imp_vars.bg_ctx.globalAlpha = imp_vars.bg_alpha;

  imp_vars.bg_ctx.drawImage(imp_vars.title_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
  imp_vars.bg_ctx.globalAlpha = 1
}

function process_and_draw_bg(dt) {
  if (imp_vars.switch_bg_timer > 0) {
    var prog = imp_vars.switch_bg_timer / imp_vars.switch_bg_duration;

    imp_vars.bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    imp_vars.bg_ctx.fillStyle = "#000"
    imp_vars.bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    imp_vars.bg_ctx.globalAlpha = prog * imp_vars.bg_alpha
    imp_vars.bg_ctx.drawImage(imp_vars.title_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    imp_vars.bg_ctx.globalAlpha = (1 - prog) * imp_vars.alt_bg_alpha
    imp_vars.bg_ctx.drawImage(imp_vars.alt_title_bg_canvas, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    imp_vars.bg_ctx.globalAlpha = 1

    imp_vars.switch_bg_timer -= dt;
  } else if (imp_vars.switch_bg_duration != null) {
    // At the end of the transition, directly set the bg.
    imp_vars.switch_bg_duration = null;
    set_bg(imp_vars.alt_bg_file, imp_vars.alt_bg_alpha);
  }
}

function step() {
  var cur_time = (new Date()).getTime()
  imp_vars.ctx.globalAlpha = 1;
  dt = cur_time - imp_vars.last_time
  imp_vars.cur_game_state.process(dt)
  if (imp_vars.cur_dialog_box != null) {
    imp_vars.cur_dialog_box.process(dt);
  }
  if (imp_vars.cur_popup_message != null) {
    process_popup_message(dt)
  }
  if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
    imp_vars.ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if(imp_vars.cur_game_state instanceof ImpulseGameState &&  imp_vars.cur_game_state.ready) {
    if(imp_vars.cur_game_state.zoom != 1) {
      imp_vars.ctx.fillStyle= imp_vars.cur_game_state.dark_color;
      imp_vars.ctx.fillRect(imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    } else {
      imp_vars.ctx.clearRect(imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight);
    }

  }

  if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
    imp_vars.ctx.fillStyle = "black"
    imp_vars.ctx.fillRect(0, 0, imp_vars.sidebarWidth, imp_vars.canvasHeight);
    imp_vars.ctx.fillRect(imp_vars.canvasWidth - imp_vars.sidebarWidth, 0, imp_vars.sidebarWidth, imp_vars.canvasHeight);
    imp_vars.ctx.translate(imp_vars.sidebarWidth, 0)//allows us to have a topbar
    imp_vars.cur_game_state.draw(imp_vars.ctx, imp_vars.bg_ctx);
    imp_vars.ctx.translate(-imp_vars.sidebarWidth, 0)//allows us to have a topbar
  } else {
    imp_vars.cur_game_state.draw(imp_vars.ctx, imp_vars.bg_ctx);
    imp_vars.ctx.save()
    imp_vars.cur_game_state.set_zoom_transparency(imp_vars.ctx)
    for(var i = 0; i < imp_params.game_buttons.length; i++) {
      imp_params.game_buttons[i].draw(imp_vars.ctx)
    }
    imp_vars.ctx.restore()
  }

  if(imp_vars.cur_dialog_box!=null) {
    //imp_vars.ctx.beginPath()
    //imp_vars.ctx.globalAlpha = 1
    //imp_vars.ctx.fillStyle = imp_vars.cur_dialog_box.bg_color ? imp_vars.cur_dialog_box.bg_color : "black"
    //imp_vars.ctx.rect(imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    //imp_vars.ctx.fill()
    imp_vars.ctx.globalAlpha = 1
    imp_vars.cur_dialog_box.draw(imp_vars.ctx)
  }

  if (imp_vars.cur_popup_message != null) {
    draw_popup_message(imp_vars.ctx)
  }

  //check_share_dialog();
  imp_vars.last_time = cur_time
  var temp_dt = (new Date()).getTime() - cur_time
  imp_vars.step_id = setTimeout(step, Math.max(33 - temp_dt, 1))
  //imp_vars.step_id = requestAnimationFrame(step);
}

function set_dialog_box(box) {
  imp_vars.cur_dialog_box = box
}

function clear_dialog_box() {
  imp_vars.cur_dialog_box = null
}

function set_popup_message(type, duration, color, world_num) {
  imp_vars.cur_popup_message = new MessageBox(type, color ? color : "white", world_num ? world_num : 0);
  imp_vars.cur_popup_message.set_position(imp_vars.canvasWidth/2, imp_vars.canvasHeight - 10 - imp_vars.cur_popup_message.h)
  imp_vars.cur_popup_message.set_visible(true)
  imp_vars.cur_popup_duration = duration;
  imp_vars.cur_popup_timer = duration;
}

function process_popup_message(dt) {
  imp_vars.cur_popup_timer -= dt;
  if (imp_vars.cur_popup_timer < 0) {
    imp_vars.cur_popup_message = null;
  }
}

function draw_popup_message(ctx) {
  ctx.save();
  var prog = imp_vars.cur_popup_timer / imp_vars.cur_popup_duration;
  if (prog < 0.2) {
    ctx.globalAlpha *= prog * 5;
  } else if (prog > 0.9) {
    ctx.globalAlpha *= 10 * (1 - prog)
  } else {
    ctx.globalAlpha = 1
  }
  imp_vars.cur_popup_message.draw(ctx);
  ctx.restore();
}

function on_mouse_move(event) {

  var mPos = getCursorPosition(event)

  if(imp_vars.cur_dialog_box) {
    imp_vars.cur_dialog_box.on_mouse_move(mPos.x, mPos.y)
  }
  if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
    imp_vars.cur_game_state.on_mouse_move(mPos.x - imp_vars.sidebarWidth, mPos.y)
  } else {
    imp_vars.cur_game_state.on_mouse_move(mPos.x, mPos.y)
    for(var i = 0; i < imp_params.game_buttons.length; i++) {
      imp_params.game_buttons[i].on_mouse_move(mPos.x, mPos.y)
    }
  }
}

function on_mouse_down(event) {
  event.preventDefault()

  var mPos = getCursorPosition(event)
  if(event.button == 0) {

    if(imp_vars.cur_dialog_box) {
      imp_vars.cur_dialog_box.on_mouse_down(mPos.x, mPos.y)
      return
    }
    if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
      imp_vars.cur_game_state.on_mouse_down(mPos.x - imp_vars.sidebarWidth, mPos.y)
    } else {
      imp_vars.cur_game_state.on_mouse_down(mPos.x, mPos.y)
    }
  } else if(event.button == 2) {

    if(imp_vars.cur_dialog_box) {
      imp_vars.cur_dialog_box.on_right_mouse_down(mPos.x, mPos.y)
      return
    }
    if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
      imp_vars.cur_game_state.on_right_mouse_down(mPos.x - imp_vars.sidebarWidth, mPos.y)
    } else {
      imp_vars.cur_game_state.on_right_mouse_down(mPos.x, mPos.y)
    }
  }
}

function on_mouse_up(event) {
  event.preventDefault()

  var mPos = getCursorPosition(event)

  if(event.button == 0) {
    if(imp_vars.cur_dialog_box) {
      imp_vars.cur_dialog_box.on_mouse_up(mPos.x, mPos.y)
      return
    }
    if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
      imp_vars.cur_game_state.on_mouse_up(mPos.x - imp_vars.sidebarWidth, mPos.y)
    } else {
      imp_vars.cur_game_state.on_mouse_up(mPos.x, mPos.y)
    }
  } else if(event.button == 2) {
    if(imp_vars.cur_dialog_box) {
      imp_vars.cur_dialog_box.on_right_mouse_up(mPos.x, mPos.y)
      return
    }
    if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
      imp_vars.cur_game_state.on_right_mouse_up(mPos.x - imp_vars.sidebarWidth, mPos.y)
    } else {
      imp_vars.cur_game_state.on_right_mouse_up(mPos.x, mPos.y)
    }
  }

}

function on_click(event) {

  event.preventDefault()

  var mPos = getCursorPosition(event)

  if(event.button == 0) {
    if(imp_vars.cur_dialog_box) {
      imp_vars.cur_dialog_box.on_click(mPos.x, mPos.y)
      if (imp_vars.cur_game_state instanceof ImpulseGameState) {
        for(var i = 0; i < imp_params.game_buttons.length; i++) {
          imp_params.game_buttons[i].on_click(mPos.x, mPos.y)
        }
      }
      return
    }
    if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
      imp_vars.cur_game_state.on_click(mPos.x - imp_vars.sidebarWidth, mPos.y)
    } else {
      for(var i = 0; i < imp_params.game_buttons.length; i++) {
        imp_params.game_buttons[i].on_click(mPos.x, mPos.y)
      }
      imp_vars.cur_game_state.on_click(mPos.x, mPos.y)
    }
  } else if(event.button == 2) {
    if(imp_vars.cur_dialog_box) {
      imp_vars.cur_dialog_box.on_right_click(mPos.x, mPos.y)
      return
    }
    if(!(imp_vars.cur_game_state instanceof ImpulseGameState)) {
      imp_vars.cur_game_state.on_right_click(mPos.x - imp_vars.sidebarWidth, mPos.y)
    } else {
      imp_vars.cur_game_state.on_right_click(mPos.x, mPos.y)
    }
  }


}

/*function on_visibility_change(evt) {
  var v = 'visible', h = 'hidden',
  evtMap = {
      focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
  };

  evt = evt || window.event;

  var event_type = null
  if (evt.type in evtMap)
      event_type = evtMap[evt.type];
  else
      event_type = this.webkitHidden ? "hidden" : "visible";

  if(imp_vars.cur_game_state) {
    imp_vars.cur_game_state.on_visibility_change(event_type)
  }
}*/

function isInFullScreen() {
  return (document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
            (document.mozFullScreen || document.webkitIsFullScreen);
}

function toggleFullScreen() {
  var isFullScreen = isInFullScreen();

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
  if (imp_vars.cur_dialog_box && imp_vars.cur_dialog_box instanceof OptionsMenu) {
    imp_vars.cur_dialog_box.sendFullscreenSignal(!isFullScreen);
  }
}

function toggle_mute() {
  if(!imp_vars.impulse_music.mute) {
    imp_vars.impulse_music.mute_bg()
    imp_vars.impulse_music.mute_effects(true);
  } else {
    imp_vars.impulse_music.unmute_bg()
    imp_vars.impulse_music.mute_effects(false)
  }
  if (imp_vars.cur_dialog_box && imp_vars.cur_dialog_box instanceof OptionsMenu) {
    imp_vars.cur_dialog_box.sendMuteSignal(imp_vars.impulse_music.mute);
  }
}

function is_mute() {
  return imp_vars.impulse_music_mute;
}

function on_key_down(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;

  if(keyCode == imp_params.keys.GOD_MODE_KEY && imp_vars.debug.god_mode_enabled) { //G = god mode
    if (imp_vars.debug.god_mode == false) {
      imp_vars.debug.god_mode = true
      imp_vars.debug.story_mode = true;
      set_popup_message("god_mode_alert", 2500, "white", 0)
      if (imp_vars.cur_game_state instanceof WorldMapState) {
        imp_vars.cur_game_state.set_up_buttons();
      }
    }
  }

  if(keyCode == imp_params.keys.MUTE_KEY) { //X = mute/unmute
    toggle_mute()
  }

  if(keyCode == imp_params.keys.FULLSCREEN_KEY) {
    toggleFullScreen()
  }

  if(imp_vars.cur_dialog_box) {
    imp_vars.cur_dialog_box.on_key_down(keyCode)
    return
  }
  imp_vars.cur_game_state.on_key_down(keyCode)
}

function on_key_up(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  if(imp_vars.cur_dialog_box) {
    imp_vars.cur_dialog_box.on_key_up(keyCode)
    //do not return immediately. Allows player to disengage movement
  }
  imp_vars.cur_game_state.on_key_up(keyCode)
}

function switch_game_state(game_state) {
  imp_vars.cur_game_state.dispose();
  imp_vars.cur_game_state = game_state
}

function switch_game_state_helper(game_state) {
  step()
}


function load_game() {
  var load_obj = {}
  if(localStorage[imp_vars.save_name]===undefined || localStorage[imp_vars.save_name] === null) {
    imp_vars.player_data.first_time = true
    send_logging_to_server('STARTED GAME', {});
    load_obj["difficulty_mode"] = "easy"
  }
  else {
    load_obj = JSON.parse(localStorage[imp_vars.save_name])
    imp_vars.player_data.first_time = load_obj['first_time'] == false? false: true
  }

  if (load_obj['hard_mode_unlocked'] !== undefined) {
    imp_vars.player_data.hard_mode_unlocked = load_obj['hard_mode_unlocked'];
    if (!imp_vars.player_data.hard_mode_unlocked) {
      imp_vars.player_data.difficulty_mode = "easy";
    }
  } else {
    // if we don't have a value, but the player has beaten world 4, then it should be unlocked.
    imp_vars.player_data.hard_mode_unlocked = false;
    if (imp_vars.player_data.world_rankings &&
        imp_vars.player_data.world_rankings["easy"] &&
        imp_vars.player_data.world_rankings["easy"]["world 4"] !== undefined) {
      imp_vars.player_data.hard_mode_unlocked = true;
    }
  }

  if(!load_obj['levels']) {
    load_obj['levels'] = {}
  }

  if(!load_obj['enemies_seen']) {
    load_obj['enemies_seen'] = {}
  }

  if(!load_obj['enemies_killed']) {
    load_obj['enemies_killed'] = {}
  }

  if(!load_obj['world_rankings']) {
    load_obj['world_rankings'] = {
        'easy': {},
        'normal': {}
    }
  }

  // These need to be explicitly named because the values can change across minifications.
  var default_options = {
      'effects_volume': 100,
      'bg_music_volume': 100,
      'explosions': true,
      'score_labels': true,
      'progress_circle': false,
      'multiplier_display': false,
      'impulse_shadow': true,
      'speed_run_countdown': false,
      'control_hand': 'right',
      'control_scheme': 'mouse',
    }

  function isValidOptionValue (optionName, optionValue) {
    if (['bg_music_volume', 'effects_volume'].indexOf(optionName) !== -1) {
      return typeof optionValue === 'number';
    } else if (['explosions', 'score_labels', 'progress_circle', 'multiplier_display',
      'impulse_shadow', 'speed_run_countdown'].indexOf(optionName) !== -1) {
      return typeof optionValue === 'boolean'
    } else if (optionName === 'control_hand') {
      return ['right', 'left'].indexOf(optionValue) !== -1;
    } else if (optionName === 'control_scheme') {
      return ['mouse', 'keyboard'].indexOf(optionValue) !== -1;
    } else {
      return false;
    }
  }

  if(!load_obj['options']) {
    //default options
    load_obj['options'] = {}
  }

  if(!load_obj['quests']) {
    load_obj['quests'] = []
  }

  for(var option in default_options) {
    if(!load_obj['options'].hasOwnProperty(option)) {
      load_obj['options'][option] = default_options[option]
    }
  }

  for (var option in load_obj['options']) {
    // Remove extraneous or obsolete options from load object.
    if(!default_options.hasOwnProperty(option)) {
      delete default_options[option];
    }
    // Verify load object options are valid. Replace with default if not.
    else if(!isValidOptionValue(option, load_obj['options'][option])) {
      load_obj['options'][option] = default_options[option];
    }
  }

  if(!load_obj['save_data']) {
    load_obj['save_data'] = {
      "easy": {},
      "normal": {}
    }
  }

  imp_vars.player_data.save_data = load_obj['save_data']

  imp_vars.player_data.difficulty_mode = load_obj['difficulty_mode'] ? load_obj['difficulty_mode'] : "normal";
  imp_vars.player_data.total_kills = load_obj['total_kills'] ? load_obj['total_kills'] : 0
  imp_vars.player_data.tutorial_shown = load_obj['tutorial_shown'] ? load_obj['tutorial_shown'] : [];
  imp_vars.player_data.options = {
    effects_volume: load_obj['options']['effects_volume'],
    bg_music_volume: load_obj['options']['bg_music_volume'],
    explosions: load_obj['options']['explosions'],
    score_labels: load_obj['options']['score_labels'],
    progress_circle: load_obj['options']['progress_circle'],
    multiplier_display: load_obj['options']['multiplier_display'],
    impulse_shadow: load_obj['options']['impulse_shadow'],
    speed_run_countdown: load_obj['options']['speed_run_countdown'],
    control_hand: load_obj['options']['control_hand'],
    control_scheme: load_obj['options']['control_scheme']
  };
  imp_vars.player_data.quests = load_obj["quests"]
  load_level_data("easy", load_obj)
  load_level_data("normal", load_obj)

  imp_vars.player_data.world_rankings = load_obj['world_rankings']

  // for backwards-compatibility. Previously, we stored rank as simply the letter value instead of an object.
  for(difficulty in imp_vars.player_data.world_rankings) {
    for (world in imp_vars.player_data.world_rankings[difficulty]) {
      var value = imp_vars.player_data.world_rankings[difficulty][world]
      if (typeof value === "string") {
        var victory_type = MainGameSummaryState.prototype.convert_rank_to_victory_type(value);
        MainGameSummaryState.prototype.overwrite_rank_data_with_victory_type(difficulty, world, victory_type);
      }
      // If we use the old rank system, convert it over.
      if (value["rank"]) {
        var victory_type = MainGameSummaryState.prototype.convert_rank_to_victory_type(value["rank"]);
        MainGameSummaryState.prototype.overwrite_rank_data_with_victory_type(difficulty, world, victory_type);
      }
    }
  }

  for(i in imp_params.impulse_enemy_stats) {
    //load if enemies are seen
    imp_params.impulse_enemy_stats[i].seen = load_obj['enemies_seen'][i] ? load_obj['enemies_seen'][i] : 0
    imp_params.impulse_enemy_stats[i].kills = load_obj['enemies_killed'][i] ? load_obj['enemies_killed'][i] : 0
  }

  calculate_stars('easy')
  calculate_stars('normal')

}

function load_level_data(difficulty_level, load_obj) {
  for(i in imp_params.impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(typeof(imp_params.impulse_level_data[i].save_state) === "undefined") {
        imp_params.impulse_level_data[i].save_state = {}
      }
      imp_params.impulse_level_data[i].save_state[difficulty_level] = {}
      if(load_obj['levels'].hasOwnProperty(i) && load_obj['levels'][i]["save_state"] && load_obj['levels'][i]["save_state"][difficulty_level] ) {
        imp_params.impulse_level_data[i].save_state[difficulty_level].high_score = load_obj['levels'][i]["save_state"][difficulty_level]["high_score"]
        imp_params.impulse_level_data[i].save_state[difficulty_level].seen = load_obj['levels'][i]["save_state"][difficulty_level]["seen"]
        imp_params.impulse_level_data[i].save_state[difficulty_level].best_time = load_obj['levels'][i]["save_state"][difficulty_level]["best_time"]

        if(i.slice(0, 4) == "HIVE") {
          var stars = 0
          while(imp_params.impulse_level_data[i].save_state[difficulty_level].high_score >= imp_params.impulse_level_data[i].cutoff_scores[difficulty_level][stars])
          {
            stars+=1
          }
          imp_params.impulse_level_data[i].save_state[difficulty_level].stars = stars
         } else {
            if(imp_params.impulse_level_data[i].save_state[difficulty_level].best_time < 1000) {
              imp_params.impulse_level_data[i].save_state[difficulty_level].stars = 3
            } else {
              imp_params.impulse_level_data[i].save_state[difficulty_level].stars = 0
            }

         }

      }
      else {
        imp_params.impulse_level_data[i].save_state[difficulty_level].high_score = 0
        imp_params.impulse_level_data[i].save_state[difficulty_level].stars = 0
        imp_params.impulse_level_data[i].save_state[difficulty_level].seen = false
        imp_params.impulse_level_data[i].save_state[difficulty_level].best_time = 1000
      }
    }
  }
}

function save_game() {
  var save_obj = {}
  save_obj['levels'] = {}
  save_level_data('easy', save_obj)
  save_level_data('normal', save_obj)
  save_obj['enemies_seen'] = {}
  save_obj['enemies_killed'] = {}
  for(i in imp_params.impulse_enemy_stats) {
    save_obj['enemies_seen'][i] = imp_params.impulse_enemy_stats[i].seen
    save_obj['enemies_killed'][i] = imp_params.impulse_enemy_stats[i].kills
  }
  save_obj['total_kills'] = imp_vars.player_data.total_kills
  save_obj['difficulty_mode'] = imp_vars.player_data.difficulty_mode
  save_obj['world_rankings'] = imp_vars.player_data.world_rankings
  save_obj['save_data'] = imp_vars.player_data.save_data
  save_obj['options'] = {
    'effects_volume': imp_vars.player_data.options.effects_volume,
    'bg_music_volume': imp_vars.player_data.options.bg_music_volume,
    'explosions': imp_vars.player_data.options.explosions,
    'score_labels': imp_vars.player_data.options.score_labels,
    'progress_circle': imp_vars.player_data.options.progress_circle,
    'multiplier_display': imp_vars.player_data.options.multiplier_display,
    'impulse_shadow': imp_vars.player_data.options.impulse_shadow,
    'speed_run_countdown': imp_vars.player_data.options.speed_run_countdown,
    'control_hand': imp_vars.player_data.options.control_hand,
    'control_scheme': imp_vars.player_data.options.control_scheme
  };
  save_obj['first_time'] = imp_vars.player_data.first_time
  save_obj['hard_mode_unlocked'] = imp_vars.player_data.hard_mode_unlocked;
  save_obj['tutorial_shown'] = imp_vars.player_data.tutorial_shown;
  save_obj['quests'] = imp_vars.player_data.quests
  localStorage[imp_vars.save_name] = JSON.stringify(save_obj)
}


function save_level_data(difficulty_level, save_obj) {
  for(i in imp_params.impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(!(save_obj['levels'].hasOwnProperty(i))) {
        save_obj['levels'][i] = {}
        save_obj['levels'][i]["save_state"] = {}
      }

      save_obj['levels'][i]["save_state"][difficulty_level] = {}
      save_obj['levels'][i]["save_state"][difficulty_level]["high_score"] = imp_params.impulse_level_data[i].save_state[difficulty_level].high_score
      save_obj['levels'][i]["save_state"][difficulty_level]["best_time"] = imp_params.impulse_level_data[i].save_state[difficulty_level].best_time
      save_obj['levels'][i]["save_state"][difficulty_level]["seen"] = imp_params.impulse_level_data[i].save_state[difficulty_level].seen
    }
  }
}

function calculate_stars(difficulty_mode) {
  var total_stars = 0
  for(i in imp_params.impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(imp_params.impulse_level_data[i].save_state[difficulty_mode]) {
        total_stars += imp_params.impulse_level_data[i].save_state[difficulty_mode].stars
      }
    }
  }
  imp_vars.player_data.kill_stars = 0
  for(i in impulse_enemy_kills_star_cutoffs)
  {
    if(imp_params.impulse_enemy_stats[i].kills >= impulse_enemy_kills_star_cutoffs[i]) {
      imp_vars.player_data.kill_stars += 1
    }

  }
  if(typeof imp_vars.player_data.stars === "undefined")
    imp_vars.player_data.stars = {}
  imp_vars.player_data.stars[difficulty_mode] = total_stars + imp_vars.player_data.kill_stars
}

function save_player_game(hive_number) {
  imp_vars.player_data.save_data[imp_vars.player_data.difficulty_mode] = hive_number
  save_game();
}

function has_ult() {
  return calculate_ult() >= 1;
}

function calculate_lives() {
  var life = 3;
  for (var i = 0; i < imp_vars.player_data.quests.length; i++) {
    var quest = imp_vars.player_data.quests[i];
    if (imp_params.quest_data[quest] && imp_params.quest_data[quest].rewards.indexOf("life") != -1) {
      life += 1;
    }
  }
  return life
}

function calculate_ult() {
  var ult = 0;
  for (var i = 0; i < imp_vars.player_data.quests.length; i++) {
    var quest = imp_vars.player_data.quests[i];
    if (imp_params.quest_data[quest] && imp_params.quest_data[quest].rewards.indexOf("ult") != -1) {
      ult += 1;
    }
  }
  return ult;
}

function calculate_spark_val() {
  var spark_val = 10;
  for (var i = 0; i < imp_vars.player_data.quests.length; i++) {
    var quest = imp_vars.player_data.quests[i];
    if (imp_params.quest_data[quest] && imp_params.quest_data[quest].rewards.indexOf("spark") != -1) {
      spark_val += 1;
    }
  }
  return spark_val
}

function calculate_next_upgrade() {
  var rating = calculate_current_rating()
  var spark_val_cutoffs = imp_params.spark_upgrades
  var ult_cutoffs = imp_params.ult_upgrades
  var life_cutoffs = imp_params.life_upgrades
  var min_upgrade = null
  for(var i = 0; i < life_cutoffs.length; i++) {
    if(life_cutoffs[i].rating > rating && (life_cutoffs[i].rating < min_upgrade || min_upgrade == null))
      min_upgrade = life_cutoffs[i].rating
  }
  for(var i = 0; i < ult_cutoffs.length; i++) {
    if(ult_cutoffs[i].rating > rating && (ult_cutoffs[i].rating < min_upgrade || min_upgrade == null))
      min_upgrade = ult_cutoffs[i].rating
  }
  for(var i = 0; i < spark_val_cutoffs.length; i++) {
    if(spark_val_cutoffs[i].rating > rating && (spark_val_cutoffs[i].rating < min_upgrade || min_upgrade == null))
      min_upgrade = spark_val_cutoffs[i].rating
  }
  return min_upgrade
}

function is_quest_completed(name) {
  return imp_vars.player_data.quests.indexOf(name) != -1
}

function set_quest_completed(name) {
  if (!is_quest_completed(name)) {
    imp_vars.player_data.quests.push(name);
    save_game();
    set_popup_message("quest_" + name, 2500, "white", 0)
  }
}

function should_show_level_zero(world_num) {
  // Easy difficulty, and we've never played this world before.
  return imp_vars.player_data.difficulty_mode == "easy" &&
         imp_params.impulse_level_data["HIVE "+world_num+"-1"].save_state[imp_vars.player_data.difficulty_mode].seen;
}

function get_bg_opacity(world) {
  // Return opacity for the background in world menus.
  var opacity_array = [
    imp_vars.hive0_bg_opacity,
    imp_vars.bg_opacity,
    0.8,
    0.4,
    imp_vars.bg_opacity
  ];
  return opacity_array[world];
}

function get_world_map_bg_opacity(world) {
  // Return opacity for the background in world-map state.
  var opacity_array = [
    imp_vars.hive0_bg_opacity,
    0.2,
    0.35,
    0.3,
    0.25,
  ];
  return opacity_array[world];
}

function send_logging_to_server(msg, tags) {
  if (window.location.host === 'localhost') {
    window.console.log('LOGGING');
    window.console.log(msg);
    window.console.log(tags);
  } else {
    window["Raven"]["captureMessage"](msg, tags);
  }
}

function share_on_facebook_dialog() {
  FB.ui({
    method: 'share',
    href: 'https://developers.facebook.com/docs/dialogs/',
  }, function(response){});
}
/*
function open_share_dialog() {
  // share_button_open prevents us from calling click too much.
  if (document.getElementById("at4-soc") && !share_dialog_is_open()) {
    document.getElementById("at4-soc").click()
  }
}

function close_share_dialog() {
  if (imp_vars.share_button_open && document.getElementById("at4-scc") && share_dialog_is_open()) {
    document.getElementById("at4-scc").click()
  }
}

function check_share_dialog() {
  if (imp_vars.cur_game_state instanceof TitleState && imp_vars.cur_dialog_box == null) {
    open_share_dialog();
  } else {
    close_share_dialog();
  }
}

function share_dialog_is_open() {
  // check whether the at4-share element has the at4-show class. THIS HACKY IMPLEMENTATION IS 3RD PARTY SPECIFIC!
  return document.getElementById("at4-share").className.match(/\bat4-show\b/);
}*/
