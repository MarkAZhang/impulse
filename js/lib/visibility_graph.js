var VisibilityGraph = function(level, poly_edges, vertices, edges, edge_list, shortest_paths, visible_vertices ) {
  this.init(level, poly_edges, vertices, edges, edge_list, shortest_paths, visible_vertices)
}

VisibilityGraph.prototype.init = function(level, poly_edges, vertices, edges, edge_list, shortest_paths, visible_vertices) {
//buffer_polygons is an array of array of vertices
  this.level = level
  this.buffer_polygons = level.boundary_polygons
  this.obstacle_polygons = level.obstacle_polygons

  if(poly_edges) {
    this.poly_edges = poly_edges
    this.vertices = vertices
    this.edges = edges
    //edge_list stores the adjacencies from each vertex
    //edge_list uses the indices according to this.vertices
    this.edge_list = edge_list
    this.shortest_paths = shortest_paths
    this.visible_vertices = visible_vertices
  }
  this.last_time = (new Date()).getTime()
}

VisibilityGraph.prototype.is_valid_visible_vertice = function(point, vertex, polygonContainingPoint, passThroughPolygonContainingPoint) {
  if (passThroughPolygonContainingPoint) {
    return utils.isVisible(point, vertex, this.poly_edges, polygonContainingPoint/*ignore_polygon*/) && (vertex["p_n"] != polygonContainingPoint ||
         utils.isVisibleThroughPolygon(point, vertex, this.obstacle_polygons[vertex["p_n"]]))

  } else {
    if (polygonContainingPoint) {
      return (vertex["p_n"] == polygonContainingPoint &&
         utils.isVisibleThroughPolygon(point, vertex, this.obstacle_polygons[vertex["p_n"]]))
    } else {
      return utils.isVisible(point, vertex, this.poly_edges)
    }
  }
}

VisibilityGraph.prototype.query = function(point1, point2, pick_alt_path)
//start point, end point, whether to try to pick a different path so enemies don't all go to the same place
//returns the shortest path from point1 to VISIBILITY_GRAPH to point2
{

  //if it is possible to go from current location to player, always go there directly
  if(utils.isVisible(point1, point2, this.poly_edges) && utils.isVisible(point1, point2, this.level.obstacle_edges))//if visible, go there directly
  {
    return {path: [point2], dist: utils.pDist(point1, point2)}
  }

  // Detect whether point1 or point2 is inside a boundary polygon.
  // If so, make sure points on that boundary polygon are utils.isVisible through the obstacle polygon before considering.
  // This is necessary because we use obstacle polygon for most of our calculations.
  var point1polygon = null;
  var point2polygon = null;
  for(var i = 0; i < this.buffer_polygons.length; i++) {
    if (utils.pointInPolygon(this.buffer_polygons[i], point1)) {
      point1polygon = i;
    }
    if (utils.pointInPolygon(this.buffer_polygons[i], point2)) {
      point2polygon = i;
    }
  }

  var min_distance = null
  var min_path = null
  var split_size = 50
  var point1_adj = this.visible_vertices[Math.floor(point1.x*layers.draw_factor/split_size)*split_size+" "+Math.floor(point1.y*layers.draw_factor/split_size)*split_size]
  var point2_adj = this.visible_vertices[Math.floor(point2.x*layers.draw_factor/split_size)*split_size+" "+Math.floor(point2.y*layers.draw_factor/split_size)*split_size]

  var inPoly = false

  if(point1_adj) {
    var actual_point1_adj = []
    for(var i = 0; i < point1_adj.length; i++)
    {
      if(this.is_valid_visible_vertice(point1, this.vertices[point1_adj[i]], point1polygon, true /* passThroughPolygonContainingPoint*/))
      {
        actual_point1_adj.push(point1_adj[i])
      }
    }
    point1_adj = actual_point1_adj
  }

  if(!point1_adj || point1_adj.length == 0) {
    point1_adj = []
    for(var i = 0; i < this.vertices.length; i++)
    {
      if(this.is_valid_visible_vertice(point1, this.vertices[i], point1polygon, true))
      {
        point1_adj.push(i)
      }
    }
  }

  if(point2_adj) {
    var actual_point2_adj = []
    for(var i = 0; i < point2_adj.length; i++)
    {
      if(this.is_valid_visible_vertice(point2, this.vertices[point2_adj[i]], point2polygon, true))
      {
        actual_point2_adj.push(point2_adj[i])
      }
    }
    point2_adj = actual_point2_adj
  }

  if(!point2_adj || point2_adj.length == 0) {
    point2_adj = []
    for(var i = 0; i < this.vertices.length; i++)
    {
      if(this.is_valid_visible_vertice(point2, this.vertices[i], point2polygon, true))
      {
        point2_adj.push(i)
      }
    }
  }

  for(var i = 0; i < point1_adj.length; i++)
  {
    for(var j = 0; j < point2_adj.length; j++)
    {
      var v_dist;
      if(point1_adj[i] == point2_adj[j])//same point
      {
        v_dist = 0
      }
      else
      {
        v_dist = this.shortest_paths[point1_adj[i]][point2_adj[j]]["b"] // dist
      }
      if(v_dist == null) continue
      var dist = utils.pDist(point1, this.vertices[point1_adj[i]]) + v_dist
        + utils.pDist(this.vertices[point2_adj[j]], point2);
      if(!min_distance || dist < min_distance)
      {
        min_distance = dist
        if(point1_adj[i] == point2_adj[j])
        {
          min_path = [point1_adj[i]]
        }
        else
        {
          min_path = this.shortest_paths[point1_adj[i]][point2_adj[j]]["a"] // path
        }
      }
    }
  }
  if(!min_path) {
    return {path: null, dist: null}//it's possible that player is inside an open-space that is surrouded by triangle edges.
  }
  if(pick_alt_path) {
    var random_path_index = Math.floor(Math.random() * point1_adj.length * point2_adj.length)

    var i = Math.floor(random_path_index / point2_adj.length)
    var j = random_path_index % point2_adj.length


    if(utils.pDist(point1, this.vertices[min_path[0]] < 5)) {
      i = point1_adj.indexOf(min_path[0])
    }

    var v_dist;
    if(point1_adj.length * point2_adj.length != 0) {
      if(point1_adj[i] == point2_adj[j])//same point
      {
        v_dist = 0
      }
      else
      {
        v_dist = this.shortest_paths[point1_adj[i]][point2_adj[j]]["b"] // dist
      }
      if(v_dist != null) {
        var dist = utils.pDist(point1, this.vertices[point1_adj[i]]) + v_dist
        + utils.pDist(this.vertices[point2_adj[j]], point2);
        var orig_angle = utils.atan(point1, this.vertices[min_path[0]])
        var new_angle = utils.atan(point1, this.vertices[point1_adj[i]])

        // Choose an alternate path.
        // The path cannot be much worse.
        // The path cannot lead in the other direction.
        // The path must lead into another corridor.

        if(dist < 1.2 * min_distance && utils.smallAngleBetween(orig_angle, new_angle) < Math.PI*3/8 &&
          !utils.isVisible(this.vertices[min_path[0]], this.vertices[point1_adj[i]]))
        {
          min_distance = dist
          if(point1_adj[i] == point2_adj[j])
          {
            min_path = [point1_adj[i]]
          }
          else
          {
            min_path = this.shortest_paths[point1_adj[i]][point2_adj[j]]["a"] // path
          }
        }
      }
    }
  }

  //thus, no visible vertices
  //this is only if the player "tunnels" (cheats)
  var ans = []

  for (var i = 0; i < min_path.length; i++)
  {
    ans.push(this.vertices[min_path[i]])
  }
  ans.push(point2)

  // covers some edge cases. For example, if the player is inside a boundary polygon, this will prevent enemy from going through a boundary polygon vertex first.
  if (ans.length == 2 && utils.isVisible(point1, point2, this.level.obstacle_edges)) {
    return {path: [point2], dist: utils.pDist(point1, point2)}
  }

  return {path: ans, dist: min_distance}
}
