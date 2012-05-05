require = window.require;

require.define({
    'impulse_draw': function(require, exports, module) {

var draw = require('gamejs/draw');
console.log(EXPORTS)
    console.log(exports)
exports.drawWorld = function(world, surface) {
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
			drawShape(s, surface);
		}
	}
};

var drawShape = exports.drawShape = function(shape, surface) {
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
}}, ['gamejs/draw']);
