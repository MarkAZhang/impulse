var version_num = "1.0"
var debug = true

var canvasWidth, canvasHeight
var ctx
var canvas
var canvas_container
var draw_factor = 15
var dt = 0
var last_time = 0
var step_id = 0
var cur_game_state
var cur_dialog_box = null
var save_name = "impulse_save_data"
var impulse_colors = {}
impulse_colors['bronze'] = "rgb(205, 127, 50)"
impulse_colors['silver'] = "rgb(175, 175, 175)"
impulse_colors['gold'] = "rgb(238, 201, 0)"
impulse_colors['world 1'] = "rgb(50, 205, 50)"
impulse_colors['world 2'] = "rgb(255, 204, 0)"
impulse_colors['world 3'] = "rgb(186, 85, 211)"
impulse_colors['world 4'] = "rgb(0, 206, 209)"
var player_data = {}

window.onload =  function() {
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
    
    canvasWidth = 800;
    canvasHeight = 600;

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

    ctx = canvas.getContext('2d');
    window.addEventListener('keydown', on_key_down, false);
    window.addEventListener('keyup', on_key_up, false);
    window.addEventListener('click', on_click, false);
    window.addEventListener('mousedown', on_mouse_down, false);
    window.addEventListener('mouseup', on_mouse_up, false);
    window.addEventListener('mousemove', on_mouse_move, false)

    var dim = getWindowDimensions()

    canvas_container.style.position = 'absolute'
    if(canvasWidth < dim.w)
    {
      offset_left = (dim.w-canvasWidth)/2
      canvas_container.style.left =  Math.round(offset_left) + 'px'
    }
    else
    {
      offset_left = 0
    }
    if(canvasHeight < dim.h)
    {
      offset_top = (dim.h-canvasHeight)/2
      canvas_container.style.top = Math.round(offset_top) + 'px'
    }
    else
    {
      offset_top = 0
    }

    cur_game_state = new TitleState(false)
    load_game()
    step()

}

function step() {
  var cur_time = (new Date()).getTime()

  dt = cur_time - last_time
  cur_game_state.process(dt)
  process_music(dt)
  if(!(cur_game_state instanceof ImpulseGameState) || cur_game_state.ready)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
	cur_game_state.draw(ctx);

  if(cur_dialog_box!=null) {
    ctx.beginPath()
    ctx.globalAlpha = .5
    ctx.fillStyle = "black"
    ctx.rect(0, 0, canvas.width, canvas.height)
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
    return
  }
  cur_game_state.on_mouse_move(mPos.x, mPos.y)
}

function on_mouse_down(event) {

  var mPos = getCursorPosition(event)

  if(cur_dialog_box) {
    cur_dialog_box.on_mouse_down(mPos.x, mPos.y)
    return
  }
  cur_game_state.on_mouse_down(mPos.x, mPos.y)
}

function on_mouse_up(event) {

  var mPos = getCursorPosition(event)

  if(cur_dialog_box) {
    cur_dialog_box.on_mouse_up(mPos.x, mPos.y)
    return
  }
  cur_game_state.on_mouse_up(mPos.x, mPos.y)
}

function on_click(event) {
  var mPos = getCursorPosition(event)
  if(cur_dialog_box) {
    cur_dialog_box.on_click(mPos.x, mPos.y)
    return
  }
  cur_game_state.on_click(mPos.x, mPos.y)
}

function on_key_down(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  if(keyCode == 77) { //M = mute/unmute
    
    mute = !mute
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

function save_game() {
  var save_obj = {}
  save_obj['levels'] = {}
  for(i in impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      save_obj['levels'][i] = {}
      save_obj['levels'][i].high_score = impulse_level_data[i].high_score
      save_obj['levels'][i].stars = impulse_level_data[i].stars
    }
  }
  save_obj['enemies_seen'] = {}
  for(i in impulse_enemy_stats) {
    save_obj['enemies_seen'][i] = impulse_enemy_stats[i].seen
  }
  localStorage[save_name] = JSON.stringify(save_obj)
}

function load_game() {
  var load_obj = {}
  if(localStorage[save_name]===undefined || localStorage[save_name] === null) {
    load_obj['levels'] = {}
    for(i in impulse_level_data) {
      if(i.slice(0, 11) != "HOW TO PLAY") {
        load_obj['levels'][i] = {}
        load_obj['levels'][i].high_score = 0
        load_obj['levels'][i].stars = 0
      }
    }
    player_data.first_time = true
    load_obj['enemies_seen'] = {}
    for(i in impulse_enemy_stats) {
      load_obj['enemies_seen'][i] = false
    }
  }
  else {
    load_obj = JSON.parse(localStorage[save_name])
    player_data.first_time = false
  }
  for(i in impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(load_obj['levels'][i]) {
        impulse_level_data[i].high_score = load_obj['levels'][i].high_score
        impulse_level_data[i].stars = load_obj['levels'][i].stars
      }
      else {
        impulse_level_data[i].high_score = 0
        impulse_level_data[i].stars = 0
      }
    }

  }

  for(i in impulse_enemy_stats) {

    impulse_enemy_stats[i].seen = load_obj['enemies_seen'][i]
  }

  calculate_stars()
  
}

function calculate_stars() {
  var total_stars = 0
  for(i in impulse_level_data) {
    if(i.slice(0, 11) != "HOW TO PLAY") {
      if(impulse_level_data[i]) {
        total_stars += impulse_level_data[i].stars
      }
      
    }
  }
  player_data.stars = total_stars
}


///MUSIC

var audio_tag_map = {}

var cur_song = null

var world_music_map = {}

world_music_map[1] = "speedway"
world_music_map[2] = "droid_march"
world_music_map[3] = "tunneled"
world_music_map[4] = "strangled"
world_music_map[5] = "emergence"
world_music_map[6] = "machine_one"
world_music_map[7] = "trial_by_fire"
world_music_map[8] = "hard_noise"

var music_switch = "none"

var music_switchtime = 1000

var music_volume = 1.0

var mute = false

var next_song = null

function play_song(song_name, force_restart) {
  console.log(song_name+" "+song_name+" "+cur_song+" "+next_song)
  if((cur_song == song_name && !force_restart) || next_song != null && song_name == next_song) return

  if(song_name == null) {
    audio_tag_map[cur_song].pause()
    cur_song = null
    return
  }

  if(!audio_tag_map[song_name]) {
    add_song(song_name)
    return
  }
  
  if(cur_song != null) {
    next_song = song_name
    music_switch = "down"
    setTimeout(function() {
      start_song(next_song)
      audio_tag_map[cur_song].volume = music_volume
      music_switch = "none"
      next_song = null
    }, 1000)
  }
  else {
    next_song = song_name
    setTimeout(function() {
    start_song(next_song)
    audio_tag_map[cur_song].volume = music_volume
    next_song = null
    }, 1000)
  }

}

function start_song(song_name) {
  if(song_name==null) return  //sometimes if songs are switched really fast next_song can be changed, then nulled, then called again

  if(cur_song != null)
    audio_tag_map[cur_song].pause()
  console.log(song_name)
  audio_tag_map[song_name].currentTime = 0
  audio_tag_map[song_name].play()
  cur_song = song_name
}

function add_song(song_name) {
  var audio = document.createElement("audio")
  audio.src = "audio/"+song_name+".ogg"
  audio.addEventListener('canplaythrough', function() {
    play_song(song_name)
    audio_tag_map[song_name].playable = true
  }, false)
  audio.loop = true
  audio_tag_map[song_name] = audio
}

function process_music(dt) {
  if(!cur_song || !audio_tag_map[cur_song]) return

  if(music_switch == "down") {
    audio_tag_map[cur_song].volume *= Math.pow(0.5, dt/(music_switchtime/8))
  }

  if(mute && music_volume > 0) {
    if(music_volume <= Math.pow(0.5, 8))
      music_volume = 0
    else
      music_volume *= Math.pow(0.5, dt/(music_switchtime/8))
  }
  else if(!mute && music_volume < 1) {
    if(music_volume == 0) {
      music_volume = Math.pow(0.5, 8)
    }
    music_volume = Math.min(music_volume * Math.pow(2, dt/(music_switchtime/8)), 1)

  }
  if(music_switch == "none")
    audio_tag_map[cur_song].volume = music_volume
}
