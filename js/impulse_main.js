window.onload = function() {
  var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  if(is_chrome) {
    window.impulse_main();
  } else {
    centerMessage()
    document.getElementById('continue_btn').addEventListener('click', start_game);
    document.getElementById('download_btn').addEventListener('click', redirect_to_chrome);
  }
}
function centerMessage() {
  var message = document.getElementById("message");
  var dim = getWindowDimensions()

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

function redirect_to_chrome() {
  window.location = "https://www.google.com/intl/en/chrome/browser/";
}

function start_game() {
  message.setAttribute("style", "display: none" )
  setTimeout(function(){window.impulse_main()}, 50)
}

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

window["impulse_main"] =  function() {


    imp_params.canvasWidth = 1200;
    imp_params.canvasHeight = 600;

    //topbarHeight = 35
    imp_params.sidebarWidth = 200;

    imp_params.levelWidth = imp_params.canvasWidth - 2 * imp_params.sidebarWidth;

    imp_params.levelHeight = imp_params.canvasHeight

    // screen setup
    imp_params.canvas = document.getElementById("canvas");
    var canvas_container = document.getElementById("canvas_container");
    imp_params.canvas.width = imp_params.canvasWidth;
    imp_params.canvas.height =  imp_params.canvasHeight;
    canvas_container.style.width = imp_params.canvasWidth + 'px'
    canvas_container.style.height = imp_params.canvasHeight + 'px'

    imp_params.bg_canvas = document.getElementById("bg_canvas");
    var bg_canvas_container = document.getElementById("bg_canvas_container");
    imp_params.bg_canvas.width = imp_params.canvasWidth;
    imp_params.bg_canvas.height =  imp_params.canvasHeight;
    bg_canvas_container.style.width = imp_params.canvasWidth + 'px'
    bg_canvas_container.style.height = imp_params.canvasHeight + 'px'

    imp_params.ctx = imp_params.canvas.getContext('2d');
    imp_params.bg_ctx = imp_params.bg_canvas.getContext('2d');

    window.oncontextmenu = function ()
    {
        return false;     // cancel default menu
    }

    io.set_up_listeners();
    dom.centerCanvas()
    saveData.loadGame()
    set_up_title_bg()
    set_key_bindings()
    imp_params.impulse_music = new MusicPlayer()
    imp_params.last_time = (new Date()).getTime();
    game_engine.switch_game_state(new IntroState());
    game_engine.step()
}

function set_up_title_bg() {
  var title_bg_canvas = document.createElement('canvas');
  title_bg_canvas.width = imp_params.levelWidth;
  title_bg_canvas.height = imp_params.levelHeight;
  imp_params.title_bg_canvas = title_bg_canvas

  var alt_title_bg_canvas = document.createElement('canvas');
  alt_title_bg_canvas.width = imp_params.levelWidth;
  alt_title_bg_canvas.height = imp_params.levelHeight;
  imp_params.alt_title_bg_canvas = alt_title_bg_canvas

  var world_menu_bg_canvas = document.createElement('canvas');
  world_menu_bg_canvas.width = imp_params.levelWidth;
  world_menu_bg_canvas.height = imp_params.levelHeight;
  imp_params.world_menu_bg_canvas = world_menu_bg_canvas
}

function switch_bg(bg_file, duration, alpha) {
  // Only perform the switch if the bg_file is different.
  if (imp_params.bg_file != bg_file) {
    imp_params.switch_bg_duration = duration;
    imp_params.switch_bg_timer = duration;
    var alt_title_bg_ctx = imp_params.alt_title_bg_canvas.getContext('2d');
    // bg_file can also be a color.
    if (bg_file.substring(0, 1) == "#") {
      alt_title_bg_ctx.fillStyle = bg_file;
      alt_title_bg_ctx.fillRect(0, 0, imp_params.levelWidth, imp_params.levelHeight);
    } else {
      draw_bg(alt_title_bg_ctx, 0, 0, imp_params.levelWidth, imp_params.levelHeight, bg_file)
    }

    imp_params.alt_bg_alpha = alpha;
    imp_params.alt_bg_file = bg_file;
  }
}

// Will immediately draw the new bg onto the bg_ctx.
function set_bg(bg_file, alpha) {
  var title_bg_ctx = imp_params.title_bg_canvas.getContext('2d');
  if (bg_file.substring(0, 1) == "#") {
    title_bg_ctx.fillStyle = bg_file;
    title_bg_ctx.fillRect(0, 0, imp_params.levelWidth, imp_params.levelHeight);
  } else {
    draw_bg(title_bg_ctx, 0, 0, imp_params.levelWidth, imp_params.levelHeight, bg_file)
  }
  imp_params.bg_alpha = alpha;
  imp_params.bg_file = bg_file;

  imp_params.bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
  imp_params.bg_ctx.fillStyle = "#000"
  imp_params.bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
  imp_params.bg_ctx.globalAlpha = imp_params.bg_alpha;

  imp_params.bg_ctx.drawImage(imp_params.title_bg_canvas, 0, 0, imp_params.levelWidth, imp_params.levelHeight, imp_params.sidebarWidth, 0, imp_params.levelWidth, imp_params.levelHeight);
  imp_params.bg_ctx.globalAlpha = 1
}

function process_and_draw_bg(dt) {
  if (imp_params.switch_bg_timer > 0) {
    var prog = imp_params.switch_bg_timer / imp_params.switch_bg_duration;

    imp_params.bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    imp_params.bg_ctx.fillStyle = "#000"
    imp_params.bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    imp_params.bg_ctx.globalAlpha = prog * imp_params.bg_alpha
    imp_params.bg_ctx.drawImage(imp_params.title_bg_canvas, 0, 0, imp_params.levelWidth, imp_params.levelHeight, imp_params.sidebarWidth, 0, imp_params.levelWidth, imp_params.levelHeight);
    imp_params.bg_ctx.globalAlpha = (1 - prog) * imp_params.alt_bg_alpha
    imp_params.bg_ctx.drawImage(imp_params.alt_title_bg_canvas, 0, 0, imp_params.levelWidth, imp_params.levelHeight, imp_params.sidebarWidth, 0, imp_params.levelWidth, imp_params.levelHeight);
    imp_params.bg_ctx.globalAlpha = 1

    imp_params.switch_bg_timer -= dt;
  } else if (imp_params.switch_bg_duration != null) {
    // At the end of the transition, directly set the bg.
    imp_params.switch_bg_duration = null;
    set_bg(imp_params.alt_bg_file, imp_params.alt_bg_alpha);
  }
}


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
  if (game_engine.cur_dialog_box && game_engine.cur_dialog_box instanceof OptionsMenu) {
    game_engine.cur_dialog_box.sendFullscreenSignal(!isFullScreen);
  }
}

function toggle_mute() {
  if(!imp_params.impulse_music.mute) {
    imp_params.impulse_music.mute_bg()
    imp_params.impulse_music.mute_effects(true);
  } else {
    imp_params.impulse_music.unmute_bg()
    imp_params.impulse_music.mute_effects(false)
  }
  if (game_engine.cur_dialog_box && game_engine.cur_dialog_box instanceof OptionsMenu) {
    game_engine.cur_dialog_box.sendMuteSignal(imp_params.impulse_music.mute);
  }
}


function is_quest_completed(name) {
  return saveData.quests.indexOf(name) != -1
}

function set_quest_completed(name) {
  if (!is_quest_completed(name)) {
    saveData.quests.push(name);
    saveData.saveGame();
    game_engine.set_popup_message("quest_" + name, 2500, "white", 0)
  }
}

function should_show_level_zero(world_num) {
  // Easy difficulty, and we've never played this world before.
  return saveData.difficultyMode == "easy" && saveData.getLevelData("HIVE " + world_num + "-1").seen;
}

function get_bg_opacity(world) {
  // Return opacity for the background in world menus.
  var opacity_array = [
    imp_params.hive0_bg_opacity,
    imp_params.bg_opacity,
    0.8,
    0.4,
    imp_params.bg_opacity
  ];
  return opacity_array[world];
}

function get_world_map_bg_opacity(world) {
  // Return opacity for the background in world-map state.
  var opacity_array = [
    imp_params.hive0_bg_opacity,
    0.2,
    0.35,
    0.3,
    0.25,
  ];
  return opacity_array[world];
}

// Send logging to server with Karma.
function send_logging_to_server(msg, tags) {
  if (window.location.host === 'localhost') {
    window.console.log('LOGGING');
    window.console.log(msg);
    window.console.log(tags);
  } else {
    window["Raven"]["captureMessage"](msg, tags);
  }
}
