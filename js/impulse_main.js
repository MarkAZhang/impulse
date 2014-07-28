var imp_vars = {
  dev: false,
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
  draw_factor: 15,
  last_time: 0,
  cur_game_state: null,
  cur_dialog_box: null,
  save_name: "impulse_save_data",
  player_data: {},
  impulse_music: null,
  minified: true,
  bg_opacity: 0.3,
  share_button_open: true // button starts out as open.
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
    if(imp_vars.player_data.first_time) {
      imp_vars.cur_game_state = new HowToPlayState("first_time_tutorial")
    } else {
      imp_vars.cur_game_state = new TitleState(null)
    }
    imp_vars.last_time = (new Date()).getTime();
    step()
}

function set_up_game_buttons() {
  imp_params.game_buttons = []
  imp_params.game_buttons.push(new IconButton("", 16, imp_vars.sidebarWidth/2, imp_vars.canvasHeight - 20, 30, 30, this.color, this.bright_color, function() {
    toggle_mute()
  }, "mute_in_game"))

  imp_params.game_buttons.push(new IconButton("", 16, imp_vars.sidebarWidth/2 - 40, imp_vars.canvasHeight - 20, 30, 30, this.color, this.bright_color, function() {
    toggle_pause() 
  }, "pause_in_game"))

  imp_params.game_buttons.push(new IconButton("", 16, imp_vars.sidebarWidth/2 + 40, imp_vars.canvasHeight - 20, 30, 30, this.color, this.bright_color, function() {
    toggleFullScreen()
  }, "fullscreen_in_game"))

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
  var title_bg_ctx = title_bg_canvas.getContext('2d');
  draw_bg(title_bg_ctx, 0, 0, imp_vars.levelWidth, imp_vars.levelHeight, "Hive 0")
  imp_vars.title_bg_canvas = title_bg_canvas
  var world_menu_bg_canvas = document.createElement('canvas');
  world_menu_bg_canvas.width = imp_vars.levelWidth;
  world_menu_bg_canvas.height = imp_vars.levelHeight;
  imp_vars.world_menu_bg_canvas = world_menu_bg_canvas
}

function step() {
  var cur_time = (new Date()).getTime()
  imp_vars.ctx.globalAlpha = 1;
  dt = cur_time - imp_vars.last_time
  imp_vars.cur_game_state.process(dt)
  if (imp_vars.cur_dialog_box != null) {
    imp_vars.cur_dialog_box.process(dt);
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
    imp_vars.ctx.beginPath()
    imp_vars.ctx.globalAlpha = 1
    imp_vars.ctx.fillStyle = imp_vars.cur_dialog_box.bg_color ? imp_vars.cur_dialog_box.bg_color : "black"
    imp_vars.ctx.rect(imp_vars.sidebarWidth, 0, imp_vars.levelWidth, imp_vars.levelHeight)
    imp_vars.ctx.fill()
    imp_vars.ctx.globalAlpha = 1
    imp_vars.cur_dialog_box.draw(imp_vars.ctx)
  }

  check_share_dialog();
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

function toggleFullScreen() {

    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !==     null) ||    // alternative standard method
            (document.mozFullScreen || document.webkitIsFullScreen);

    var docElm = document.documentElement;
    if (!isInFullScreen) {

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
}

function toggle_mute() {
  if(!imp_vars.impulse_music.mute) {
    imp_vars.impulse_music.mute_bg()
  } else {
    imp_vars.impulse_music.unmute_bg()
  }
}

function on_key_down(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;

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
  imp_vars.cur_game_state = game_state
}

function switch_game_state_helper(game_state) {
  step()
}


function load_game() {

  var load_obj = {}
  if(localStorage[imp_vars.save_name]===undefined || localStorage[imp_vars.save_name] === null) {
    imp_vars.player_data.first_time = true
    load_obj["difficulty_mode"] = "normal"
  }
  else {
    load_obj = JSON.parse(localStorage[imp_vars.save_name])
    imp_vars.player_data.first_time = load_obj['first_time'] == false? false: true
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
        "easy": {},
        "normal": {}
    }
  }

  var default_options = {
      music_mute: false,
      effects_mute: false,
      explosions: true,
      score_labels: true,
      progress_circle: false,
      multiplier_display: true,
      impulse_shadow: true,
      show_transition_screens: false,
      control_hand: "right",
      control_scheme: "mouse",
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

  if(!load_obj['save_data']) {
    load_obj['save_data'] = {
      "easy": {},
      "normal": {}
    }
  }

  imp_vars.player_data.save_data = load_obj['save_data']

  imp_vars.player_data.difficulty_mode = load_obj['difficulty_mode'] ? load_obj['difficulty_mode'] : "normal";
  imp_vars.player_data.total_kills = load_obj['total_kills'] ? load_obj['total_kills'] : 0
  imp_vars.player_data.options = load_obj["options"]
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
  save_obj['options'] = imp_vars.player_data.options
  save_obj['first_time'] = imp_vars.player_data.first_time
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

function has_ult() {
  return calculate_current_rating() >= imp_params.ult_upgrades[0].rating
}

function calculate_lives(this_rating) {
  var rating = this_rating === undefined ? calculate_current_rating() : this_rating
  var life = 3
  var life_cutoffs = imp_params.life_upgrades
  for(var i = 0; i < life_cutoffs.length; i++) {
    if(rating >= life_cutoffs[i].rating) {
      life = life_cutoffs[i].life
    } else {
      break
    }
  }
  return life
}

function calculate_ult(this_rating) {
  var rating = this_rating === undefined ? calculate_current_rating() : this_rating
  var ult = 0
  var ult_cutoffs = imp_params.ult_upgrades
  for(var i = 0; i < ult_cutoffs.length; i++) {
    if(rating >= ult_cutoffs[i].rating) {
      ult = ult_cutoffs[i].ult
    } else {
      break
    }
  }
  return ult
}


function calculate_spark_val(this_rating) {
  var rating = this_rating === undefined ? calculate_current_rating() : this_rating
  var spark_val = 10
  var spark_val_cutoffs = imp_params.spark_upgrades
  for(var i = 0; i < spark_val_cutoffs.length; i++) {
    if(rating >= spark_val_cutoffs[i].rating) {
      spark_val = spark_val_cutoffs[i].spark_val
    } else {
      break
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

function get_bg_opacity(world) {
  if (world == 2) {
    return 0.5;
  }
  if (world == 3) {
    return 0.4;
  }
  return imp_vars.bg_opacity;
}

function share_on_facebook_dialog() {
  FB.ui({
    method: 'share',
    href: 'https://developers.facebook.com/docs/dialogs/',
  }, function(response){});
}

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
}