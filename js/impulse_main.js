var version_num = "1.0"

var dev = true
var unlockall = dev
var canvasWidth, canvasHeight, sidebarWidth, boardWidth, boardHeight;
var ctx, canvas, bg_canvas, bg_ctx
var draw_factor = 15
var dt = 0
var last_time = 0
var step_id = 0
var cur_game_state
var cur_dialog_box = null
var save_name = "impulse_save_data"

var player_data = {}
var impulse_music = null

var control_scheme = "mouse"

var impulse_main =  function() {
    b2Vec2 = Box2D.Common.Math.b2Vec2
    , b2AABB = Box2D.Collision.b2AABB
    ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
    ,	b2Body = Box2D.Dynamics.b2Body
    ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
    ,	b2Fixture = Box2D.Dynamics.b2Fixture
    ,	b2World = Box2D.Dynamics.b2World
    ,	b2MassData = Box2D.Collision.Shapes.b2MassData
    ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
    ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
    ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    , b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
    , b2ContactListener = Box2D.Dynamics.b2ContactListener

    canvasWidth = 1200;
    canvasHeight = 600;

    //topbarHeight = 35
    sidebarWidth = 200;

    levelWidth = canvasWidth - 2 * sidebarWidth;

    levelHeight = canvasHeight

    /*gameWidth = 800
    gameHeight = 660 //extra 60 for interface

    arenaWidth = 800
    arenaHeight = 600

    /*var gap_h = 75
    var gap_w = 75

    var num_x = 3
    var num_y = 4

    var ph = (canvasHeight - gap_h * (num_x + 1))/num_x
    var pw = (canvasWidth - gap_w * (num_y + 1))/num_y

    var polygons = []
    for(var i = 0; i < (num_x); i++) {
      for(var j = 0; j < (num_y); j++) {
        if(!(i == 1 && (j == 1 || j == 2))) {
        var polygon = [[Math.floor(gap_w + (gap_w + pw) * j), Math.floor(gap_h + (gap_h + ph) * i)], [Math.floor(gap_w + pw + (gap_w + pw) * j), Math.floor(gap_h + (gap_h + ph) * i)], [Math.floor(gap_w + pw + (gap_w + pw) * j), Math.floor(gap_h + ph + (gap_h + ph) * i)], [Math.floor(gap_w + (gap_w + pw) * j), Math.floor(gap_h + ph + (gap_h + ph) * i)]]
      polygons.push(polygon)
        }
      }
    }
    console.log(JSON.stringify(polygons))

    var polyg = [[[29,44],[56,44],[56,260],[29,260]],[[29,340],[56,340],[56,557],[29,557]]]


      var m = polyg.length
    for(var i = 1; i < 8; i++) {
      for(var k = 0; k < m; k++) {
      var poly = []
        for(var j = 0; j < polyg[k].length; j++) {
            poly.push([polyg[k][j][0] + i * 103, polyg[k][j][1]])

        }
      polyg.push(poly)
      }
    }
    console.log(JSON.stringify(polyg))*/

    // screen setup
    canvas = document.getElementById("canvas");
    canvas_container = document.getElementById("canvas_container");
    canvas.width = canvasWidth;
    canvas.height =  canvasHeight;
    canvas_container.style.width = canvasWidth + 'px'
    canvas_container.style.height = canvasHeight + 'px'

    bg_canvas = document.getElementById("bg_canvas");
    bg_canvas_container = document.getElementById("bg_canvas_container");
    bg_canvas.width = canvasWidth;
    bg_canvas.height =  canvasHeight;
    bg_canvas_container.style.width = canvasWidth + 'px'
    bg_canvas_container.style.height = canvasHeight + 'px'

    ctx = canvas.getContext('2d');
    bg_ctx = bg_canvas.getContext('2d');
    window.addEventListener('keydown', on_key_down, false);
    window.addEventListener('keyup', on_key_up, false);
    window.addEventListener('click', on_click, false);
    window.addEventListener('mousedown', on_mouse_down, false);
    window.addEventListener('mouseup', on_mouse_up, false);
    window.addEventListener('mousemove', on_mouse_move, false)
    window.addEventListener('resize', centerCanvas, false)

    //addVisibilityListener()

    centerCanvas()
    load_game()
    set_key_bindings()
    impulse_music = new MusicPlayer()
    cur_game_state = new TitleState(false)
    step()


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


    if(canvasWidth < dim.w)
    {
      offset_left = (dim.w-canvasWidth)/2
      canvas_container.style.left =  Math.round(offset_left) + 'px'
      bg_canvas_container.style.left =  Math.round(offset_left) + 'px'
    }
    else
    {
      offset_left = 0
    }
    if(canvasHeight < dim.h)
    {
      offset_top = (dim.h-canvasHeight)/2
      canvas_container.style.top = Math.round(offset_top) + 'px'
      bg_canvas_container.style.top =  Math.round(offset_top) + 'px'
    }
    else
    {
      offset_top = 0
    }
    message.style.display = ""
}

function step() {
  var cur_time = (new Date()).getTime()
  ctx.globalAlpha = 1;
  dt = cur_time - last_time
  cur_game_state.process(dt)
  if(!(cur_game_state instanceof ImpulseGameState)) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else if(cur_game_state instanceof ImpulseGameState &&  cur_game_state.ready) {
    if(cur_game_state.zoom != 1) {
      ctx.fillStyle= cur_game_state.dark_color;
      ctx.fillRect(sidebarWidth, 0, levelWidth, levelHeight);
    } else {
      ctx.clearRect(sidebarWidth, 0, levelWidth, levelHeight);
    }

  }

  if(!(cur_game_state instanceof ImpulseGameState)) {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, sidebarWidth, canvasHeight);
    ctx.fillRect(canvasWidth - sidebarWidth, 0, sidebarWidth, canvasHeight);
    ctx.translate(sidebarWidth, 0)//allows us to have a topbar
    cur_game_state.draw(ctx, bg_ctx);
    ctx.translate(-sidebarWidth, 0)//allows us to have a topbar
  } else {
    cur_game_state.draw(ctx, bg_ctx);
  }



  if(cur_dialog_box!=null) {
    ctx.beginPath()
    ctx.globalAlpha = 1
    ctx.fillStyle = cur_dialog_box.bg_color ? cur_dialog_box.bg_color : "black"
    ctx.rect(sidebarWidth, 0, levelWidth, levelHeight)
    ctx.fill()
    ctx.globalAlpha = 1
    cur_dialog_box.draw(ctx)
  }

  last_time = cur_time
  var temp_dt = (new Date()).getTime() - cur_time
  step_id = setTimeout('step()', Math.max(25 - temp_dt, 1))

}

function set_dialog_box(box) {
  this.cur_dialog_box = box
}

function clear_dialog_box() {
  this.cur_dialog_box = null
}

function on_mouse_move(event) {

  var mPos = getCursorPosition(event)

  if(cur_dialog_box) {
    cur_dialog_box.on_mouse_move(mPos.x, mPos.y)
  }
  if(!(cur_game_state instanceof ImpulseGameState)) {
    cur_game_state.on_mouse_move(mPos.x - sidebarWidth, mPos.y)
  } else {
    cur_game_state.on_mouse_move(mPos.x, mPos.y)
  }
}

function on_mouse_down(event) {
  event.preventDefault()

  var mPos = getCursorPosition(event)

  if(cur_dialog_box) {
    cur_dialog_box.on_mouse_down(mPos.x, mPos.y)
    return
  }
  if(!(cur_game_state instanceof ImpulseGameState)) {
    cur_game_state.on_mouse_down(mPos.x - sidebarWidth, mPos.y)
  } else {
    cur_game_state.on_mouse_down(mPos.x, mPos.y)
  }
}

function on_mouse_up(event) {
  event.preventDefault()

  var mPos = getCursorPosition(event)

  if(cur_dialog_box) {
    cur_dialog_box.on_mouse_up(mPos.x, mPos.y)
    return
  }
  if(!(cur_game_state instanceof ImpulseGameState)) {
    cur_game_state.on_mouse_up(mPos.x - sidebarWidth, mPos.y)
  } else {
    cur_game_state.on_mouse_up(mPos.x, mPos.y)
  }
}

function on_click(event) {

  event.preventDefault()

  var mPos = getCursorPosition(event)
  if(cur_dialog_box) {
    cur_dialog_box.on_click(mPos.x, mPos.y)
    return
  }
  if(!(cur_game_state instanceof ImpulseGameState)) {
    cur_game_state.on_click(mPos.x - sidebarWidth, mPos.y)
  } else {
    cur_game_state.on_click(mPos.x, mPos.y)
  }

  DoFullScreen();


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

  if(cur_game_state) {
    cur_game_state.on_visibility_change(event_type)
  }
}*/

function DoFullScreen() {
  return

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
    }
}

function on_key_down(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;

  if(keyCode == imp_vars.keys.MUTE_KEY) { //X = mute/unmute
    if(!impulse_music.mute) {
      impulse_music.mute_bg()
    } else {
      impulse_music.unmute_bg()
    }
  }

  if(cur_dialog_box) {
    cur_dialog_box.on_key_down(keyCode)
    return
  }
  cur_game_state.on_key_down(keyCode)
}

function on_key_up(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  if(cur_dialog_box) {
    cur_dialog_box.on_key_up(keyCode)
    //do not return immediately. Allows player to disengage movement
  }
  cur_game_state.on_key_up(keyCode)
}

function switch_game_state(game_state) {
  cur_game_state = game_state
}

function switch_game_state_helper(game_state) {
  step()
}


function load_game() {

  var load_obj = {}
  if(localStorage[save_name]===undefined || localStorage[save_name] === null) {

    player_data.first_time = true
    load_obj.difficulty_mode = "normal"
  }
  else {
    load_obj = JSON.parse(localStorage[save_name])
    player_data.first_time = false
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
        easy: {},
        normal: {}
    }
  }

  if(!load_obj['options']) {
    //default options
    load_obj['options'] = {
      "music_mute": false,
      "effects_mute": false,
      'explosions': true,
      'score_labels': true,
      "progress_circle": false,
      "multiplier_display": true,
      "control_hand": "right",
      "control_scheme": "mouse",
      "impulse_shadow": true
    }
  }

  if(!load_obj['save_data']) {
    load_obj['save_data'] = {
      easy: {},
      normal: {}
    }
  }

  player_data.save_data = load_obj['save_data']

  player_data.difficulty_mode = load_obj['difficulty_mode'];
  player_data.total_kills = load_obj['total_kills'] ? load_obj['total_kills'] : 0
  player_data.options = load_obj.options
  load_level_data("easy", load_obj)
  load_level_data("normal", load_obj)

  player_data.world_rankings = load_obj['world_rankings']

  for(i in impulse_enemy_stats) {
    //load if enemies are seen
    impulse_enemy_stats[i].seen = load_obj['enemies_seen'][i] ? load_obj['enemies_seen'][i] : 0
    impulse_enemy_stats[i].kills = load_obj['enemies_killed'][i] ? load_obj['enemies_killed'][i] : 0
  }

  calculate_stars('easy')
  calculate_stars('normal')

}

function load_level_data(difficulty_level, load_obj) {
  for(i in impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(!(impulse_level_data[i].hasOwnProperty("save_state"))) {
        impulse_level_data[i].save_state = {}
      }
      impulse_level_data[i].save_state[difficulty_level] = {}
      if(load_obj['levels'].hasOwnProperty(i)) {
        impulse_level_data[i].save_state[difficulty_level].high_score = load_obj['levels'][i].save_state[difficulty_level].high_score
        impulse_level_data[i].save_state[difficulty_level].stars = load_obj['levels'][i].save_state[difficulty_level].stars
        impulse_level_data[i].save_state[difficulty_level].seen = load_obj['levels'][i].save_state[difficulty_level].seen
      }
      else {
        impulse_level_data[i].save_state[difficulty_level].high_score = 0
        impulse_level_data[i].save_state[difficulty_level].stars = 0
        impulse_level_data[i].save_state[difficulty_level].seen = false
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
  for(i in impulse_enemy_stats) {
    save_obj['enemies_seen'][i] = impulse_enemy_stats[i].seen
    save_obj['enemies_killed'][i] = impulse_enemy_stats[i].kills
  }
  save_obj['total_kills'] = player_data.total_kills
  save_obj['difficulty_mode'] = player_data.difficulty_mode
  save_obj['world_rankings'] = player_data.world_rankings
  save_obj['save_data'] = player_data.save_data
  save_obj['options'] = player_data.options
  localStorage[save_name] = JSON.stringify(save_obj)
}


function save_level_data(difficulty_level, save_obj) {
  for(i in impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(!(save_obj['levels'].hasOwnProperty(i)))
        save_obj['levels'][i] = {save_state: {}}

      save_obj['levels'][i].save_state[difficulty_level] = {}
      save_obj['levels'][i].save_state[difficulty_level].high_score = impulse_level_data[i].save_state[difficulty_level].high_score
      save_obj['levels'][i].save_state[difficulty_level].stars = impulse_level_data[i].save_state[difficulty_level].stars
      save_obj['levels'][i].save_state[difficulty_level].seen = impulse_level_data[i].save_state[difficulty_level].seen
    }
  }
}

function calculate_stars(difficulty_mode) {
  var total_stars = 0
  for(i in impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(impulse_level_data[i]) {
        total_stars += impulse_level_data[i].save_state[difficulty_mode].stars
      }
    }
  }
  player_data.kill_stars = 0
  for(i in impulse_enemy_kills_star_cutoffs)
  {
    if(impulse_enemy_stats[i].kills >= impulse_enemy_kills_star_cutoffs[i]) {
      player_data.kill_stars += 1
    }

  }
  if(!player_data.hasOwnProperty('stars'))
    player_data.stars = {}
  player_data.stars[difficulty_mode] = total_stars + player_data.kill_stars
}
