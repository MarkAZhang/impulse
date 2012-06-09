var canvasWidth, canvasHeight
var ctx
var canvas
var canvas_container
var draw_factor = 15
var dt = 0
var last_time = 0
var step_id = 0
var cur_game_state

Event.observe(window, 'load', function() {
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
    
    // screen setup
    canvas = document.getElementById("canvas");
    canvas_container = document.getElementById("canvas_container");
    canvas.width = canvasWidth;
    canvas.height =  canvasHeight;
    canvas_container.style.width = canvasWidth + 'px'
    canvas_container.style.height = canvasHeight + 'px'

    ctx = canvas.getContext('2d');
    canvas.addEventListener('keydown', on_key_down);
    canvas.addEventListener('keyup', on_key_up);
    canvas.addEventListener('click', on_click);
    canvas.addEventListener('mousemove', on_mouse_move)

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
    step()

});

function step() {
  var cur_time = (new Date()).getTime()

  dt = cur_time - last_time
  cur_game_state.process(dt)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
	cur_game_state.draw(ctx);
  last_time = cur_time
  var temp_dt = (new Date()).getTime() - cur_time
  step_id = setTimeout('step()', Math.max(25 - temp_dt, 1))

}

function on_mouse_move(event) {
  var mPos = getCursorPosition(event)
  cur_game_state.on_mouse_move(mPos.x, mPos.y)
}

function on_click(event) {
  var mPos = getCursorPosition(event)
  cur_game_state.on_click(mPos.x, mPos.y)
}

function on_key_down(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  cur_game_state.on_key_down(keyCode)
}

function on_key_up(event) {
  var keyCode = event==null? window.event.keyCode : event.keyCode;
  cur_game_state.on_key_up(keyCode)
}

function switch_game_state(game_state) {
  cur_game_state = game_state
}

function switch_game_state_helper(game_state) {
  step()
}
