/**
 * A bare bones Sprite and sprite Group example.
 *
 * We move a lot of Ship sprites across the screen with varying speed. The sprites
 * rotate themselves randomly. The sprites bounce back from the bottom of the
 * screen.
 */

var gamejs = require('gamejs');
var impulse_draw = require('impulse_draw');
console.log(impulse_draw);
console.log(gamejs)


function setupWorld() {
    var worldAABB = new b2AABB();
    worldAABB.minVertex.Set(-1000, -1000);
    worldAABB.maxVertex.Set(1000, 1000);
    var gravity = new b2Vec2(000, 000);
    var doSleep = true;
    world = new b2World(worldAABB, gravity, doSleep); 
    makePlayer()
    
}

function makePlayer()
{
    var circleSd = new b2CircleDef();
    circleSd.density = 1.0;
    circleSd.radius = 20;
    circleSd.restitution = 1.0;
    circleSd.friction = 0;
    var circleBd = new b2BodyDef();
    circleBd.AddShape(circleSd);
    circleBd.position.Set(200,200);
    var circleBody = world.CreateBody(circleBd);
}

function main() {
   // screen setup
   gamejs.display.setMode([800, 600]);
   gamejs.display.setCaption("Impulse");
   // create some ship sprites and put them in a group

    setupWorld(); // as you like


   // game loop
   var mainSurface = gamejs.display.getSurface();
   // msDuration = time since last tick() call
   var tick = function(msDuration) {
         world.Step(1.0/60, 1);
         mainSurface.fill("#FFFFFF");
         impulse_draw.drawWorld(world, mainSurface);
   };
   gamejs.time.fpsCallback(tick, this, 30);
}

/**
 * M A I N
 */
gamejs.ready(main);
