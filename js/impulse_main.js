/**
 * A bare bones Sprite and sprite Group example.
 *
 * We move a lot of Ship sprites across the screen with varying speed. The sprites
 * rotate themselves randomly. The sprites bounce back from the bottom of the
 * screen.
 */

var gamejs = require('gamejs');
var draw = require('gamejs/draw');


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
function drawWorld(world, surface) {
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
			drawShape(s, surface);
		}
	}
}

function drawShape(shape, surface) {
	switch (shape.m_type) {
	case b2Shape.e_circleShape:
		{
			var circle = shape;
			var pos = circle.m_position;
			var r = circle.m_radius;
			var segments = 16.0;
			var theta = 0.0;
			var dtheta = 2.0 * Math.PI / segments;
            draw.circle(surface, '#000000', [pos.x, pos.y], circle.m_radius, 0)
			// draw circle
			/*context.moveTo(pos.x + r, pos.y);
			for (var i = 0; i < segments; i++) {
				var d = new b2Vec2(r * Math.cos(theta), r * Math.sin(theta));
				var v = b2Math.AddVV(pos, d);
				context.lineTo(v.x, v.y);
				theta += dtheta;
			}
			context.lineTo(pos.x + r, pos.y);*/
	
		}
		break;
	case b2Shape.e_polyShape:
		{
			var poly = shape;
			var tV = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
            //TODO
			//context.moveTo(tV.x, tV.y);
			for (var i = 0; i < poly.m_vertexCount; i++) {
				var v = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
				//context.lineTo(v.x, v.y);
			}
			//context.lineTo(tV.x, tV.y);
		}
		break;
	}
	//context.stroke();
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
         drawWorld(world, mainSurface);
   };
   gamejs.time.fpsCallback(tick, this, 30);
}

/**
 * M A I N
 */
gamejs.ready(main);
