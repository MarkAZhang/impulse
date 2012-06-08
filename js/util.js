function isVisible(v_i, v_j, edges)
{
  for(var k = 0; k < edges.length; k++)
  {
    var sum1 = v_i.x+v_i.y
    var sum2 = v_j.x+v_j.y
    var sum3 = edges[k].p1.x+edges[k].p1.y
    var sum4 = edges[k].p2.x+edges[k].p2.y
    if(sum1==sum3 || sum1==sum4 || sum2==sum3 || sum2==sum4)//having the same point in two edges can lead to problems
      continue
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
      return false//lines are collinear. For the purposes of our visibility_graph, this does not count as an intersection
    }
    //lines are parallel
  }
  var t = crossProduct(a, seg2d)/b
  var s = crossProduct(a, seg1d)/b
  return t>0 && t<1 && s>0 && s<1
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
      return null//lines are collinear. For the purposes of our visibility_graph, this does not count as an intersection
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

var _atan = function(center, ray) {
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
  if(center.x > ray.x)
  {
    angle +=Math.PI
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
    if(cur_angle > Math.PI/2)
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

function check_bounds(buffer, pt) {
  return pt.x >= buffer && pt.y >= buffer && pt.x <= canvasWidth - buffer && pt.y <= canvasHeight - buffer
}

function get_safe_point(object) {
  var safe_lines = [{x: -5, y: -5}, {x: -5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: canvasHeight/draw_factor + 5}, {x: canvasWidth/draw_factor + 5, y: -5}]

  var rayOut = new b2Vec2(object.body.GetPosition().x - player.body.GetPosition().x, object.body.GetPosition().y - player.body.GetPosition().y)
  rayOut.Normalize()
  rayOut.Multiply(200)
  var j = safe_lines.length - 1
  for(var i = 0; i < safe_lines.length; i++)
  {
    var temp = getSegIntersection(player.body.GetPosition(), {x: player.body.GetPosition().x + rayOut.x, y: player.body.GetPosition().y + rayOut.y}, safe_lines[i], safe_lines[j])

    if(temp!=null)
    {
      console.log("RETURN " + temp.x +" " +temp.y)
      return temp
      
    }

    j = i
  }  
}
