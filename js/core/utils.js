var box_2d = require('../vendor/box2d.js');
var constants = require('../data/constants.js');
var levelData = require('../data/level_data.js');

var utils = {};

utils.eq = function(a, b) {
  return a.x == b.x && a.y == b.y
};

utils.convertSecondsToTimeString = function(seconds) {
  var a = seconds % 60;
  a = a < 10 ? "0"+a : a;
  return Math.floor(seconds/60)+":"+a;
};

utils.isVisibleThroughPolygon = function (v_i, v_j, polygon) {
  var j = polygon.length - 1
  var ans = false

  for( var i = 0; i < polygon.length; i++)
  {
    if(utils.segIntersection(v_i, v_j, polygon[i], polygon[j])) {
      return false
    }

    j = i
  }
  return true

};

utils.isVisible = function (v_i, v_j, edges, ignore_polygon) {
  // ignore_polygon ignores edges of a certain polygon. Only works with boundary polygons.

  // prevents an obstacle polygon with no p_n from equally ignore_polygon
  if(ignore_polygon === undefined) ignore_polygon = null;
  for(var k = 0; k < edges.length; k++)
  {

    if(utils.eq(v_i, edges[k]["p1"]) || utils.eq(v_i, edges[k]["p2"]) || utils.eq(v_j, edges[k]["p1"]) || utils.eq(v_j, edges[k]["p2"])) {
      continue
    }
    if(edges[k]["p1"]["p_n"] !== ignore_polygon && utils.segIntersection(v_i, v_j, edges[k]["p1"], edges[k]["p2"]))
    {
      return false
    }
  }
  return true
};

utils.pointInPolygon = function (polygon, point)
//polygon is an array of box_2d.b2Vec2
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
};

utils.closestPolygonEdgeToPoint = function (polygon, point) {
  var j = polygon.length - 1
  var ans = {p1: null, p2: null, dist: null}

  for(var i = 0; i < polygon.length; i++)
  {

    var dist = utils.segDistFromPt(polygon[i], polygon[j], point)
    if(ans.dist == null || dist < ans.dist) {

      var angle_one = utils.atan(point, polygon[j])
      var angle_two = utils.angleClosestTo(angle_one,utils.atan(point, polygon[i]))
      if(angle_two - angle_one < Math.PI/2) {
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
};


utils.closestPolygonVertexToPoint = function(polygon, point) {
  var ans = {v: null, dist: null}

  for(var i = 0; i < polygon.length; i++)
  {

    var dist = utils.pDist(polygon[i], point)
    if(ans.dist == null || dist < ans.dist) {

      ans.dist = dist
      ans.v = polygon[i]
    }
  }
  return ans
};

utils.pDist = function(p1, p2)
{
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
};

utils.segIntersection = function (seg1s, seg1f, seg2s, seg2f)
{
  var seg1d = {x: seg1f.x - seg1s.x, y: seg1f.y - seg1s.y}
  var seg2d = {x: seg2f.x - seg2s.x, y: seg2f.y - seg2s.y}
  var a = {x: seg2s.x - seg1s.x, y: seg2s.y - seg1s.y}
  var b = utils.crossProduct(seg1d, seg2d)
  if(b==0)
  {
    if(utils.crossProduct(a, seg2d)==0)
    {
      return false//lines are collinear. For the purposes of our visibility_graph, this does not count as an intersection
    }
    //lines are parallel
  }
  var t = utils.crossProduct(a, seg2d)/b
  var s = utils.crossProduct(a, seg1d)/b
  return t>=0 && t<=1 && s>=0 && s<=1
};

utils.getSegIntersection = function (seg1s, seg1f, seg2s, seg2f)
{
  var seg1d = {x: seg1f.x - seg1s.x, y: seg1f.y - seg1s.y}
  var seg2d = {x: seg2f.x - seg2s.x, y: seg2f.y - seg2s.y}
  var a = {x: seg2s.x - seg1s.x, y: seg2s.y - seg1s.y}
  var b = utils.crossProduct(seg1d, seg2d)
  if(b==0)
  {
    if(utils.crossProduct(a, seg2d)==0)
    {
      return null//lines are collinear. For the purposes of our visibility_graph, this does not count as an intersection
    }
    //lines are parallel
  }
  var t = utils.crossProduct(a, seg2d)/b
  var s = utils.crossProduct(a, seg1d)/b
  if(t>=0 && t<=1 && s>=0 && s<=1)
  {
    return {x: seg1s.x + seg1d.x * t, y: seg1s.y + seg1d.y * t}
  }
  else
    return null
};

utils.segDistFromPt = function(seg1s, seg1f, pt) {
  return Math.abs(utils.crossProduct({x: seg1f.x - seg1s.x, y: seg1f.y - seg1s.y}, {x: pt.x - seg1s.x, y: pt.y - seg1s.y})) /
         Math.sqrt((seg1f.x - seg1s.x) * (seg1f.x - seg1s.x)  + (seg1f.y -seg1s.y) * (seg1f.y -seg1s.y));
};

utils.pathSafeFromPt = function (path, pt, dist) {
  for(var i = 0; i < path.length-1; i++) {
    if(utils.segDistFromPt(path[i], path[i+1], pt) < dist)
      return false;
  }
  return true;
};

utils.crossProduct = function(v1, v2)
{
  return v1.x*v2.y - v1.y*v2.x
}

utils.dotProduct = function(v1, v2)
{
  return v1.x*v2.x + v1.y*v2.y
}

utils.getCursorPosition = function(e){

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
    x -= constants.offsetLeft;
    y -= constants.offsetTop;
    return {x: x, y: y}

}

// returns -Math.pi to Math.pi
utils.atan = function(center, ray) {
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

utils.getObjectsWithinRadius = function(pt, r, objects, getLocation)
{
  var ans = []
  for(var i = 0; i < objects.length; i++)
  {
    var loc = getLocation(objects[i])
    if (utils.pDist(pt, loc)<r)
    {
      ans.push(objects[i])
    }
  }
  return ans

}

utils.getBoundaryPolygon = function(polygon, radius) {
  var j = polygon.length - 1
  var ans = []
  for(var i = 0; i < polygon.length; i++)
  {
    var k = (i+1)%polygon.length
    var j_to_i_normal = new box_2d.b2Vec2(polygon[i].y - polygon[j].y, polygon[j].x - polygon[i].x)
    var j_to_i = new box_2d.b2Vec2(polygon[i].x - polygon[j].x, polygon[i].y - polygon[j].y)
    var k_to_i_normal = new box_2d.b2Vec2(polygon[k].y - polygon[i].y, polygon[i].x - polygon[k].x)
    var k_to_i = new box_2d.b2Vec2(polygon[i].x - polygon[k].x, polygon[i].y - polygon[k].y)
    j_to_i_normal.Normalize()
    k_to_i_normal.Normalize()
    j_to_i.Normalize()
    k_to_i.Normalize()
    var first_angle = utils.atan({x: 0, y: 0}, k_to_i_normal)
    var second_angle = utils.atan({x: 0, y: 0}, j_to_i_normal)
    var cur_angle = first_angle - second_angle
    cur_angle = cur_angle < 0? cur_angle+Math.PI * 2 : cur_angle
    cur_angle = cur_angle >= 2 * Math.PI ? cur_angle - Math.PI * 2 : cur_angle
    if (cur_angle > Math.PI) {
      ans.push({"x": polygon[i].x+j_to_i_normal.x*radius - j_to_i.x*1/Math.tan(cur_angle/2 - Math.PI/2)*radius, "y": polygon[i].y + j_to_i_normal.y*radius - j_to_i.y *1/Math.tan(cur_angle/2 - Math.PI/2)* radius})

    }
    else if(cur_angle > 5*Math.PI/6)
    {
      ans.push({"x": polygon[i].x+j_to_i_normal.x*radius+j_to_i.x*radius, "y": polygon[i].y + j_to_i_normal.y*radius + j_to_i.y * radius})
      ans.push({"x": polygon[i].x+k_to_i_normal.x*radius+k_to_i.x*radius, "y": polygon[i].y + k_to_i_normal.y*radius + k_to_i.y * radius})
    }
    else
    {
      ans.push({"x": polygon[i].x+j_to_i_normal.x*radius+j_to_i.x*Math.tan(cur_angle/2)*radius, "y": polygon[i].y + j_to_i_normal.y*radius + j_to_i.y *Math.tan(cur_angle/2)* radius})

    }


   j = i
  }
  return ans
}

utils.checkBounds = function(buffer, pt, draw_factor) {
  var factor = draw_factor ? draw_factor : 1;
  return pt.x >= buffer && pt.y >= buffer && pt.x <= constants.levelWidth/factor - buffer && pt.y <= (constants.levelHeight)/factor - buffer;
}

utils.getSafestSpawnPoint = function(object, player, level_name) {
  //returns the spawn point whose angle is closest to opposite the player

  var spawn_points = levelData[level_name].spawn_points

  var best_point = null
  var best_value = 0

  var angle_to_player = utils.atan(object.body.GetPosition(), player.body.GetPosition())

  for(var i = 0; i < spawn_points.length; i++){
    var angle = utils.angleClosestTo(angle_to_player, utils.atan(object.body.GetPosition(), {x: spawn_points[i][0]/constants.drawFactor, y: spawn_points[i][1]/constants.drawFactor}))
    var diff = Math.abs(angle - angle_to_player)
    if(diff > best_value) {
      best_value = diff
      best_point = spawn_points[i]
    }
  }

  return {x: best_point[0]/constants.drawFactor, y: best_point[1]/constants.drawFactor}

}

utils.getNearestSpawnPoint = function(object, player, level_name) {
  //returns the spawn point whose angle is closest to opposite the player

  var spawn_points = levelData[level_name].spawn_points

  var best_point = null
  var best_value = 1000


  for(var i = 0; i < spawn_points.length; i++){
    var dist = utils.pDist({x: spawn_points[i][0]/constants.drawFactor, y: spawn_points[i][1]/constants.drawFactor}, object.body.GetPosition())
    if(dist < best_value) {
      best_value = dist
      best_point = spawn_points[i]
    }
  }

  return {x: best_point[0], y: best_point[1]}

}

utils.getRandomOutsideLocation = function(buffer, range) {
  var x_anchor, y_anchor
  if(Math.random() < .5)
  {
    x_anchor = Math.random() < .5 ? -buffer-range : constants.levelWidth/constants.drawFactor + buffer
    y_anchor = Math.random() * ((constants.levelHeight)/constants.drawFactor + 2 * buffer + range) - (buffer + range)
  }
  else
  {
    y_anchor = Math.random() < .5 ? -buffer-range : (constants.levelHeight)/constants.drawFactor + buffer
    x_anchor = Math.random() * (constants.levelWidth/constants.drawFactor + 2 * buffer + range) - (buffer + range)
  }

  //buffer is border outside screen which is not okay, range is range of values beyond that which ARE okay
  var r_point = {x: x_anchor + Math.random() * range, y: y_anchor + Math.random() * range }
  return r_point
}

utils.getWindowDimensions = function() {
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

utils.getLines = function(ctx,phrase,maxPxLength,textStyle) {
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

utils.isAngleBetween = function(small, large, angle) {
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

utils.angleClosestTo = function(this_angle, other_angle) {
  while(other_angle - this_angle > Math.PI) {
    other_angle -= 2 * Math.PI
  }
  while(other_angle - this_angle < -Math.PI) {
    other_angle += 2 * Math.PI
  }
  return other_angle

}

utils.smallAngleBetween = function(angle1, angle2) {
  var ans = angle1 - angle2;

  if(ans > Math.PI * 2) ans -= Math.PI * 2
  if(ans < 0) ans += Math.PI * 2;

  if(ans > Math.PI)
    ans = Math.PI * 2 - ans
  return ans
}

utils.bezierInterpolate = function(mid1, mid2, t) {

 return (Math.pow(1-t,3) * 0 + 3*Math.pow(1-t,2)*t*mid1+ 3*(1-t)*Math.pow(t,2)*mid2+ Math.pow(t,3)*1);
}

utils.createBody = function(world, polygons, x, y, lin_damp, density, categoryBits, maskBits, type, owner, self) {
  var bodyDef = new box_2d.b2BodyDef;
  if(type == "static") {
    bodyDef.type = box_2d.b2Body.b2_staticBody
  } else
    bodyDef.type = box_2d.b2Body.b2_dynamicBody;
  bodyDef.position.x = x;
  bodyDef.position.y = y;
  bodyDef.linearDamping = lin_damp;
  var body = world.CreateBody(bodyDef)

  for(var i = 0; i < polygons.length; i++) {
    var polygon = polygons[i]
    var this_shape = null
    if(polygon.type == "circle") {
      this_shape = new box_2d.b2CircleShape(polygon.r)
      this_shape.SetLocalPosition(new box_2d.b2Vec2(polygon.x, polygon.y))
    }
    if(polygon.type == "polygon") {
      var vertices = []
      for(var j= 0; j < polygon.vertices.length; j++) {
        vertices.push(new box_2d.b2Vec2(polygon.x + polygon.r * polygon.vertices[j][0], polygon.y + polygon.r * polygon.vertices[j][1]))
      }
      this_shape = new box_2d.b2PolygonShape
      this_shape.SetAsArray(vertices, vertices.length)
    }

    var fixDef = new box_2d.b2FixtureDef;//make the shape
    fixDef.density = density;
    fixDef.friction = 0;
    fixDef.restitution = 0.7;
    fixDef.filter.categoryBits = categoryBits
    fixDef.filter.maskBits = maskBits
    fixDef.shape = this_shape
    body.CreateFixture(fixDef).SetUserData({"body": body, "owner": owner, "self": self})

  }

  return body;
}

utils.getNextLevelName = function(level, world_num) {
  if(!level) {
    return utils.getFirstLevelName(world_num);
  } else {
    if(level.level_number < 7) {
      return "HIVE "+world_num+"-"+(level.level_number+1)
    } else {
      return "BOSS "+world_num
    }
  }
}

utils.getFirstLevelName = function (world_num) {
  if (world_num == 0) {
    return "HIVE 0-3"
  }

  return "HIVE "+world_num+"-1"
}

module.exports = utils;
