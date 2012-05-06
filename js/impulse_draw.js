var draw_factor = 10; //everything is scaled by this factor

function drawWorld(world, context) {
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
			drawShape(s, context);
		}
	}
};

function drawShape(shape, context) {
    context.beginPath()
	context.fillStyle = 'black';
	switch (shape.m_type) {
	case b2Shape.e_circleShape:
		{
			var circle = shape;
			var pos = circle.m_position;
			var r = circle.m_radius;
			// draw circle
			context.arc(pos.x*draw_factor, pos.y*draw_factor, r*draw_factor, 0, 2*Math.PI, true)
		}
		break;
	
	}
	context.fill();
}

