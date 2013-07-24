var eq = function(a, b) {
  return a.x == b.x && a.y == b.y
}

function isVisible(v_i, v_j, edges)
{
  for(var k = 0; k < edges.length; k++)
  {

    if(eq(v_i, edges[k].p1) || eq(v_i, edges[k].p2) || eq(v_j, edges[k].p1) || eq(v_j, edges[k].p2)) {
      continue
    }
  if(segIntersection(v_i, v_j, edges[k].p1, edges[k].p2))
    {
      return false
    }
  }
  return true
}

function pointInPolygon(polygon, point)
//polygon is an array of b2Vec2
{
  var j = polygon.length - 1
  var ans = false

  for( var i = 0; i < polygon.length; i++)
  {
    if(polygon[i].y < point.y && polygon[j].y >=point.y || polygon[i].y >= point.y && polygon[j].y < point.y)
    {
      if(polygon[i].y!=polygon[j].y && (polygon[i].x + (point.y - polygon[i].y)/(polygon[j].y - polygon[i].y)*(polygon[j].x - polygon[i].x) < point.x))
      {
        ans = !ans
      }
    }
    j = i
  }
  return ans
}

function closestPolygonEdgeToPoint(polygon, point) {
  var j = polygon.length - 1
  var ans = {p1: null, p2: null, dist: null}

  for(var i = 0; i < polygon.length; i++)
  {

    var dist = seg_dist_from_pt(polygon[i], polygon[j], point)
    if(ans.dist == null || dist < ans.dist) {

      var angle_one = _atan(point, polygon[j])
      var angle_two = angle_closest_to(angle_one,_atan(point, polygon[i]))
      if(ans.dist != null && angle_two - angle_one < Math.PI/2) {
        // ensure that the edge is close to the point...necessary for CONCAVE polygons
      } else {
        ans.p1 = polygon[j]
        ans.p2 = polygon[i]
        ans.dist = dist
      }
    }
    j = i
  }
  return ans
}

function p_dist(p1, p2)
{
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

function segIntersection(seg1s, seg1f, seg2s, seg2f)
{
  var seg1d = {x: seg1f.x - seg1s.x, y: seg1f.y - seg1s.y}
  var seg2d = {x: seg2f.x - seg2s.x, y: seg2f.y - seg2s.y}
  var a = {x: seg2s.x - seg1s.x, y: seg2s.y - seg1s.y}
  var b = crossProduct(seg1d, seg2d)
  if(b==0)
  {
    if(crossProduct(a, seg2d)==0)
    {
      return false//lines are collinear. For the purposes of our imp_vars.cur_game_state.visibility_graph, this does not count as an intersection
    }
    //lines are parallel
  }
  var t = crossProduct(a, seg2d)/b
  var s = crossProduct(a, seg1d)/b
  return t>=0 && t<=1 && s>=0 && s<=1
}

function getSegIntersection(seg1s, seg1f, seg2s, seg2f)
{
  var seg1d = {x: seg1f.x - seg1s.x, y: seg1f.y - seg1s.y}
  var seg2d = {x: seg2f.x - seg2s.x, y: seg2f.y - seg2s.y}
  var a = {x: seg2s.x - seg1s.x, y: seg2s.y - seg1s.y}
  var b = crossProduct(seg1d, seg2d)
  if(b==0)
  {
    if(crossProduct(a, seg2d)==0)
    {
      return null//lines are collinear. For the purposes of our imp_vars.cur_game_state.visibility_graph, this does not count as an intersection
    }
    //lines are parallel
  }
  var t = crossProduct(a, seg2d)/b
  var s = crossProduct(a, seg1d)/b
  if(t>=0 && t<=1 && s>=0 && s<=1)
  {
    return {x: seg1s.x + seg1d.x * t, y: seg1s.y + seg1d.y * t}
  }
  else
    return null
}

function seg_dist_from_pt(seg1s, seg1f, pt) {

  return Math.abs(crossProduct({x: seg1f.x - seg1s.x, y: seg1f.y - seg1s.y}, {x: pt.x - seg1s.x, y: pt.y - seg1s.y})) /
  //return Math.abs((seg1f.x - seg1s.x) * (seg1s.y - pt.y) - (seg1s.x - pt.x) * (seg1f.y -seg1s.y)) /
         Math.sqrt((seg1f.x - seg1s.x) * (seg1f.x - seg1s.x)  + (seg1f.y -seg1s.y) * (seg1f.y -seg1s.y));
}

function path_safe_from_pt(path, pt, dist) {
  for(var i = 0; i < path.length-1; i++) {
    if(seg_dist_from_pt(path[i], path[i+1], pt) < dist)
      return false;
  }
  return true;
}


function crossProduct(v1, v2)
{
  return v1.x*v2.y - v1.y*v2.x
}

function dotProduct(v1, v2)
{
  return v1.x*v2.x + v1.y*v2.y
}

function getCursorPosition(e){

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
    x -= offset_left;
    y -= offset_top;
    return {x: x, y: y}

}

// returns -Math.pi to Math.pi
var _atan = function(center, ray) {
  if(center == null || ray == null) {
    console.log("ERROR")
  }
  var angle
  if(center.x == ray.x)
  {
    if(center.y > ray.y)
    {
      angle = -Math.PI/2
    }
    else
    {
      angle = Math.PI/2
    }
    return angle
  }
  angle = Math.atan((center.y-ray.y)/(center.x-ray.x))
  if(center.x > ray.x && center.y < ray.y)
  {
    angle +=Math.PI
  } else if(center.x > ray.x && center.y >= ray.y) {
    angle -= Math.PI
  }
  return angle
}

var normalize_angle = function(angle) {
  while(angle < -Math.PI) {
    angle += 2 * Math.PI
  }
  while(angle > Math.PI) {
    angle -= Math.Pi
  }
  return angle
}

function getObjectsWithinRadius(pt, r, objects, getLocation)
{
  var ans = []
  for(var i = 0; i < objects.length; i++)
  {
    var loc = getLocation(objects[i])
    if (p_dist(pt, loc)<r)
    {
      ans.push(objects[i])
    }
  }
  return ans

}

function getBoundaryPolygonOld(polygon, radius) {

  var j = polygon.length - 1
  var ans = []
  for(var i = 0; i < polygon.length; i++)
  {
    var k = (i+1)%polygon.length
    var j_to_i_normal = new b2Vec2(polygon[j].y - polygon[i].y, polygon[i].x - polygon[j].x)
    var k_to_i_normal = new b2Vec2(polygon[i].y - polygon[k].y, polygon[k].x - polygon[i].x)
    j_to_i_normal.Normalize()
    k_to_i_normal.Normalize()
    ans.push({x: polygon[j].x+j_to_i_normal.x*radius, y: polygon[j].y + j_to_i_normal.y*radius})
    ans.push({x: polygon[i].x+j_to_i_normal.x*radius, y: polygon[i].y + j_to_i_normal.y*radius})
    var sum = new b2Vec2(j_to_i_normal.x + k_to_i_normal.x, j_to_i_normal.y + k_to_i_normal.y)
    sum.Normalize()
    ans.push({x: polygon[i].x+sum.x * radius, y: polygon[i].y+sum.y * radius})
    j = i
  }
  return ans
}

function getBoundaryPolygon(polygon, radius) {
  var j = polygon.length - 1
  var ans = []
  for(var i = 0; i < polygon.length; i++)
  {
    var k = (i+1)%polygon.length
    var j_to_i_normal = new b2Vec2(polygon[i].y - polygon[j].y, polygon[j].x - polygon[i].x)
    var j_to_i = new b2Vec2(polygon[i].x - polygon[j].x, polygon[i].y - polygon[j].y)
    var k_to_i_normal = new b2Vec2(polygon[k].y - polygon[i].y, polygon[i].x - polygon[k].x)
    var k_to_i = new b2Vec2(polygon[i].x - polygon[k].x, polygon[i].y - polygon[k].y)
    j_to_i_normal.Normalize()
    k_to_i_normal.Normalize()
    j_to_i.Normalize()
    k_to_i.Normalize()
    var first_angle = _atan({x: 0, y: 0}, k_to_i_normal)
    var second_angle = _atan({x: 0, y: 0}, j_to_i_normal)
    var cur_angle = first_angle - second_angle
    cur_angle = cur_angle < 0? cur_angle+Math.PI * 2 : cur_angle
    cur_angle = cur_angle >= 2 * Math.PI ? cur_angle - Math.PI * 2 : cur_angle
    if (cur_angle > Math.PI) {
      ans.push({x: polygon[i].x+j_to_i_normal.x*radius - j_to_i.x*1/Math.tan(cur_angle/2 - Math.PI/2)*radius, y: polygon[i].y + j_to_i_normal.y*radius - j_to_i.y *1/Math.tan(cur_angle/2 - Math.PI/2)* radius})

    }
    else if(cur_angle > 5*Math.PI/6)
    {
      ans.push({x: polygon[i].x+j_to_i_normal.x*radius+j_to_i.x*radius, y: polygon[i].y + j_to_i_normal.y*radius + j_to_i.y * radius})
      ans.push({x: polygon[i].x+k_to_i_normal.x*radius+k_to_i.x*radius, y: polygon[i].y + k_to_i_normal.y*radius + k_to_i.y * radius})
    }
    else
    {
      ans.push({x: polygon[i].x+j_to_i_normal.x*radius+j_to_i.x*Math.tan(cur_angle/2)*radius, y: polygon[i].y + j_to_i_normal.y*radius + j_to_i.y *Math.tan(cur_angle/2)* radius})

    }


   j = i
  }
  return ans
}

function check_bounds(buffer, pt, draw_factor) {
  var factor = draw_factor ? draw_factor : 1
  return pt.x >= buffer && pt.y >= buffer && pt.x <= imp_vars.levelWidth/factor - buffer && pt.y <= (imp_vars.levelHeight)/factor - buffer
}

function get_safest_spawn_point(object, player, level_name) {
  //returns the spawn point whose angle is closest to opposite the player

  var spawn_points = imp_params.impulse_level_data[level_name].spawn_points

  var best_point = null
  var best_value = 2 * Math.PI

  var angle_to_player = _atan(object.body.GetPosition(), player.body.GetPosition())

  for(var i = 0; i < spawn_points.length; i++){
    var angle = angle_closest_to(angle_to_player, _atan(object.body.GetPosition(), {x: spawn_points[i][0]/imp_vars.draw_factor, y: spawn_points[i][1]/imp_vars.draw_factor}))
    var diff = Math.abs(angle, angle_to_player)
    if(diff < best_value) {
      best_value = diff
      best_point = spawn_points[i]
    }
  }

  return {x: best_point[0], y: best_point[1]}

}


function get_nearest_spawn_point(object, player, level_name) {
  //returns the spawn point whose angle is closest to opposite the player

  var spawn_points = imp_params.impulse_level_data[level_name].spawn_points

  var best_point = null
  var best_value = 1000


  for(var i = 0; i < spawn_points.length; i++){
    var dist = p_dist({x: spawn_points[i][0]/imp_vars.draw_factor, y: spawn_points[i][1]/imp_vars.draw_factor}, object.body.GetPosition())
    if(dist < best_value) {
      best_value = dist
      best_point = spawn_points[i]
    }
  }

  return {x: best_point[0], y: best_point[1]}

}

/*function get_pointer_point(object) {

  var enemy_pointer_lines = [{x: 2, y: 2}, {x: 2, y: (levelHeight)/draw_factor - 2}, {x: levelWidth/draw_factor - 2, y: (levelHeight)/draw_factor  - 2}, {x: levelWidth/draw_factor - 2, y: 2}]
  var j = enemy_pointer_lines.length - 1
  for(var i = 0; i < enemy_pointer_lines.length; i++)
  {
    var temp = getSegIntersection({x: (levelHeight)/draw_factor/2, y: levelWidth/draw_factor/2}, object.body.GetPosition(), enemy_pointer_lines[i], enemy_pointer_lines[j])

    if(temp!=null)
    {
      return temp
    }

    j = i
  }
}*/

//gets random point that is not inside a boundary polygon
function getRandomValidLocation(testPoint, buffer_radius, draw_factor) {
  var r_point = {x:Math.random()*(imp_vars.levelWidth/draw_factor-2*buffer_radius)+buffer_radius, y: Math.random()*((imp_vars.levelHeight)/draw_factor-2*buffer_radius)+buffer_radius}
  var inPoly = false
  for(var k = 0; k < imp_vars.cur_game_state.level.boundary_polygons.length; k++)
  {
    if(i != k && pointInPolygon(imp_vars.cur_game_state.level.boundary_polygons[k], r_point))
    {
      inPoly = true
    }
  }
  if(inPoly)
  {
    return getRandomValidLocation(testPoint, buffer_radius, draw_factor)
  }
  if(imp_vars.cur_game_state.visibility_graph.query(r_point, testPoint, imp_vars.cur_game_state.level.boundary_polygons).path==null)
  {
    return getRandomValidLocation(testPoint, buffer_radius, draw_factor)
  }
  return r_point
}

//gets random point that is not inside a boundary polygon
function getRandomCentralValidLocation(testPoint) {
  var r_point = {x:Math.random()*(imp_vars.levelWidth/2/imp_vars.draw_factor)+imp_vars.levelWidth/4/imp_vars.draw_factor, y: Math.random()*((imp_vars.levelHeight)/2/imp_vars.draw_factor)+(imp_vars.levelHeight)/4/imp_vars.draw_factor}
  var inPoly = false
  for(var k = 0; k < imp_vars.cur_game_state.level.boundary_polygons.length; k++)
  {
    if(i != k && pointInPolygon(imp_vars.cur_game_state.level.boundary_polygons[k], r_point))
    {
      inPoly = true
    }
  }
  if(inPoly)
  {
    return getRandomCentralValidLocation(testPoint)
  }
  if(imp_vars.cur_game_state.visibility_graph.query(r_point, testPoint, imp_vars.cur_game_state.level.boundary_polygons).path==null)
  {
    return getRandomCentralValidLocation(testPoint)
  }
  return r_point
}

function getRandomOutsideLocation(buffer, range) {
  var x_anchor, y_anchor
  if(Math.random() < .5)
  {
    x_anchor = Math.random() < .5 ? -buffer-range : imp_vars.levelWidth/imp_vars.draw_factor + buffer
    y_anchor = Math.random() * ((imp_vars.levelHeight)/imp_vars.draw_factor + 2 * buffer + range) - (buffer + range)
  }
  else
  {
    y_anchor = Math.random() < .5 ? -buffer-range : (imp_vars.levelHeight)/imp_vars.draw_factor + buffer
    x_anchor = Math.random() * (imp_vars.levelWidth/imp_vars.draw_factor + 2 * buffer + range) - (buffer + range)
  }

  //buffer is border outside screen which is not okay, range is range of values beyond that which ARE okay
  var r_point = {x: x_anchor + Math.random() * range, y: y_anchor + Math.random() * range }
  return r_point

}



function getWindowDimensions() {
  var winW = 800, winH = 600;
  if (document.body && document.body.offsetWidth) {
   winW = document.body.offsetWidth;
   winH = document.body.offsetHeight;
  }
  if (document.compatMode=='CSS1Compat' &&
      document.documentElement &&
      document.documentElement.offsetWidth ) {
   winW = document.documentElement.offsetWidth;
   winH = document.documentElement.offsetHeight;
  }
  if (window.innerWidth && window.innerHeight) {
   winW = window.innerWidth;
   winH = window.innerHeight;
  }

  return {w: winW, h: winH}
}

function getLines(ctx,phrase,maxPxLength,textStyle) {

  var wa=phrase.split(" "),
      phraseArray=[],
      lastPhrase=wa[0],
      l=maxPxLength,
      measure=0;
  if(wa.length == 1) {return wa}
  ctx.font = textStyle;
  for (var i=1;i<wa.length;i++) {
      var w=wa[i];
      measure=ctx.measureText(lastPhrase+w).width;
      if (measure<l && w!= "#") {
          lastPhrase+=(" "+w);
      }else {
          phraseArray.push(lastPhrase);
          if(w != "#")
            lastPhrase=w;
          else
            lastPhrase = ""
      }
      if (i===wa.length-1) {
          phraseArray.push(lastPhrase);
          break;
      }
  }
  return phraseArray;
}

function is_angle_between(small, large, angle) {
//assumes large - small < Math.Pi * 2
  var t_small = small
  var t_large = large
  while(t_small < angle) {
    t_small += Math.PI * 2

  }
  while(t_small > angle) {
    t_small -= Math.PI * 2
  }

  while(t_large > angle) {
    t_large -= Math.PI * 2
  }
  while(t_large < angle) {
    t_large += Math.PI * 2
  }

  return t_large - t_small <= Math.PI * 2
}

function angle_closest_to(this_angle, other_angle) {
  while(other_angle - this_angle > Math.PI) {
    other_angle -= 2 * Math.PI
  }
  while(other_angle - this_angle < -Math.PI) {
    other_angle += 2 * Math.PI
  }
  return other_angle

}

function small_angle_between(angle1, angle2) {
  var ans = angle1 - angle2;

  if(ans > Math.PI * 2) ans -= Math.PI * 2
  if(ans < 0) ans += Math.PI * 2;

  if(ans > Math.PI)
    ans = Math.PI * 2 - ans
  return ans
}

function bezier_interpolate(mid1, mid2, t) {

 return (Math.pow(1-t,3) * 0 + 3*Math.pow(1-t,2)*t*mid1+ 3*(1-t)*Math.pow(t,2)*mid2+ Math.pow(t,3)*1);
}

function create_body(world, polygons, x, y, lin_damp, density, categoryBits, maskBits, type, owner, self) {
  var bodyDef = new b2BodyDef;
  if(type == "static") {
    bodyDef.type = b2Body.b2_staticBody
  } else
    bodyDef.type = b2Body.b2_dynamicBody;
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = lin_damp;
  var body = world.CreateBody(bodyDef)

  for(var i = 0; i < polygons.length; i++) {
    var polygon = polygons[i]
    var this_shape = null
    if(polygon.type == "circle") {
      this_shape = new b2CircleShape(polygon.r)
      this_shape.SetLocalPosition(new b2Vec2(polygon.x, polygon.y))
    }
    if(polygon.type == "polygon") {
      var vertices = []
      for(var j= 0; j < polygon.vertices.length; j++) {
        vertices.push(new b2Vec2(polygon.x + polygon.r * polygon.vertices[j][0], polygon.y + polygon.r * polygon.vertices[j][1]))
      }
      this_shape = new b2PolygonShape
      this_shape.SetAsArray(vertices, vertices.length)
    }

    var fixDef = new b2FixtureDef;//make the shape
    fixDef.density = density;
    fixDef.friction = 0;
    fixDef.restitution = 1.0;
    fixDef.filter.categoryBits = categoryBits
    fixDef.filter.maskBits = maskBits
    fixDef.shape = this_shape
    body.CreateFixture(fixDef).SetUserData({"body": body, "owner": owner, "self": self})

  }

  return body;

}