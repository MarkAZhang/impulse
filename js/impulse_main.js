var ctx;
var world;
var canvasWidth, canvasHeight;
var player;
var player_x = 0;
var player_y = 0;
var player_force = .5;
var player_lin_damp = .96;

function setupWorld() {
    var worldAABB = new b2AABB();
    worldAABB.minVertex.Set(-1000, -1000);
    worldAABB.maxVertex.Set(1000, 1000);
    var gravity = new b2Vec2(000, 000);
    var doSleep = false; //objects in our world will rarely go to sleep
    world = new b2World(worldAABB, gravity, doSleep); 
    makePlayer()
}

function makePlayer()
{
    var circleSd = new b2CircleDef();
    circleSd.density = 1.0;
    circleSd.radius = .5;
    circleSd.restitution = 1.0;
    circleSd.friction = 0;
    var circleBd = new b2BodyDef();
    circleBd.AddShape(circleSd);
    circleBd.position.Set(20,20);
    player = world.CreateBody(circleBd);
    player.m_linearDamping = player_lin_damp;
}

function step() {
    processGame();
    world.Step(1.0/60, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawWorld(world, ctx);

	setTimeout('step()', 10);
}



Event.observe(window, 'load', function() {
    canvasWidth = 800;
    canvasHeight = 600;
   // screen setup
    var canvas = document.getElementById("canvas");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onKeyUp);
    //canvas.addEventListener("click", onClick, false);
    setupWorld(); // as you like
    // game loop
    // msDuration = time since last tick() call
    step()
});

function onKeyDown(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
    switch(keyCode)
    {
        case 65:
            player_x = -1;
            break;
        case 68:
            player_x = 1;
            break;
        case 83:
            player_y = 1;
            break;
        case 87:
            player_y = -1;
            break;
    }

    console.log("KEY_DOWN "+keyCode);
}

function onKeyUp(event) {
    var keyCode = event==null? window.event.keyCode : event.keyCode;
    console.log("KEY_UP "+keyCode);
    switch(keyCode)
    {
        case 65:
            player_x = 0;
            break;
        case 68:
            player_x = 0;
            break;
        case 83:
            player_y = 0;
            break;
        case 87:
            player_y = 0;
            break;
    }
}

function processGame() {
    var force = Math.abs(player_x)+Math.abs(player_y)==2 ? player_force/Math.sqrt(2) : player_force;
    player.ApplyImpulse(new b2Vec2(force*player_x, force*player_y), player.GetCenterPosition())
}

function getCursorPosition(){

    var x;
    var y;
    if (e.pageX || e.pageY) { 
      x = e.pageX;
      y = e.pageY;
    }
    else { 
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
    } 
    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;

}
