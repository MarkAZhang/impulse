
var VisibilityGraph = function(polygons, level, poly_edges, vertices, edges, edge_list, shortest_paths ) {
  console.log("CREATING VISIBILITY GRAPH")
  this.init(polygons, level, poly_edges, vertices, edges, edge_list, shortest_paths)
}

VisibilityGraph.prototype.init = function(polygons, level, poly_edges, vertices, edges, edge_list, shortest_paths ) {
//polygons is an array of array of vertices
  this.level = level
  this.polygons = polygons
  if(poly_edges) {
    this.poly_edges = poly_edges
    this.vertices = vertices
    this.edges = edges
    //edge_list stores the adjacencies from each vertex
    //edge_list uses the indices according to this.vertices
    this.edge_list = edge_list
    this.shortest_paths = shortest_paths
  }
  else {
    poly_edges = []
    vertices = []
    edges = []
    //edge_list stores the adjacencies from each vertex
    //edge_list uses the indices according to this.vertices
    edge_list = {}
    shortest_paths = {}
    for(var i = 0; i < polygons.length; i++)
    {
      var polygon = polygons[i]
      var m = polygon.length - 1
      for(var j = 0; j < polygon.length; j++)
      {
        var vertex = polygon[j]
        var inPoly = false
        for(var k = 0; k < polygons.length; k++)
        {
          if(i != k && pointInPolygon(polygons[k], vertex))
          {
            inPoly = true
          }
        }

        if(!inPoly)
        {
          vertex.p_n = i  //number of polygon
          vertex.p_v = polygon.length
          vertex.p_i = j  //index of vertex in polygon
          vertices.push(vertex)

        }
        poly_edges.push({p1: polygon[j], p2: polygon[m]})
        m = j
      }
    }

    for(var i = 0; i < vertices.length; i++)
    {
      edge_list[i] = {}
      for(var j = 0; j < i; j++)
      {

        var v_i = vertices[i]
        var v_j = vertices[j]
        if(v_i.p_n!=v_j.p_n || (v_i.p_n==v_j.p_n && (Math.max(v_i.p_i, v_j.p_i) - Math.min(v_i.p_i, v_j.p_i) == 1 || Math.min(v_i.p_i, v_j.p_i) == 0 && Math.max(v_i.p_i, v_j.p_i) == v_i.p_v - 1)))//if adjacent edges of same polygon, add. else, if different polygons and visible, add
        {
          if(isVisible(v_i, v_j, poly_edges) && isVisible(v_i, v_j, this.level.obstacle_edges))
          {
            edges.push({p1: v_i, p2: v_j})
            var dist =  p_dist(v_j, v_i)
            edge_list[i][j] = dist
            edge_list[j][i] = dist
          }
        }
        else if(v_i.p_n==v_j.p_n && !pointInPolygon(polygons[v_i.p_n], {x: (v_i.x + v_j.x)/2, y: (v_i.y + v_j.y)/2}))
        {//for concave polygons
          if(isVisible(v_i, v_j, this.level.obstacle_edges) && isVisible(v_i, v_j, poly_edges))
          {
            edges.push({p1: v_i, p2: v_j})
            var dist =  p_dist(v_j, v_i)
            edge_list[i][j] = dist
            edge_list[j][i] = dist
          }
        }
      }
    }

    for(var h = 0; h < vertices.length; h++)
    {

      var predecessors = dijkstra.single_source_shortest_paths(edge_list, h)
      shortest_paths[h] = {}
      for(var i = 0; i < h; i++)
      {
         var path = dijkstra.extract_shortest_path_from_predecessor_list(predecessors, i);
         if(path.length == 1) {
           shortest_paths[h][i] = {path: null, dist: null}
           shortest_paths[i][h] = {path: null, dist: null}
           continue
         }//nonexistent path
         var sum = 0
         var j = path[0]
         for( var k = 1; k < path.length; k++)
         {
          sum+=edge_list[j][path[k]]
            j = path[k]
         }
         shortest_paths[h][i] = {path: path, dist: sum}
         shortest_paths[i][h] = {path: path.slice(0).reverse(), dist: sum}
      }
    }
    this.poly_edges = poly_edges
    this.vertices = vertices
    this.edges = edges
    //edge_list stores the adjacencies from each vertex
    //edge_list uses the indices according to this.vertices
    this.edge_list = edge_list
    this.shortest_paths = shortest_paths
  }


  this.last_time = (new Date()).getTime()


}

VisibilityGraph.prototype.query = function(point1, point2, bad_polygons, temp)
//start point, end point, list of bad polygons
//returns the shortest path from point1 to VISIBILITY_GRAPH to point2
{

  //if it is possible to go from current location to player, always go there directly
  if(isVisible(point1, point2, this.level.obstacle_edges))//if visible, go there directly
  {
    return [point2]
  }

  /*var cur_time = (new Date()).getTime()
  console.log("QUERY "+(cur_time - this.last_time) +" "+temp.id)
  console.log(temp)
  this.last_time = cur_time*/

  /*//if start point is inside a bad polygon (but we aren't dead...)
  //get out of there ASAP
  for(var k = 0; k < bad_polygons.length; k++)
  {
    if(i != k && pointInPolygon(bad_polygons[k], point1))
    {
      inPoly = true
    }
  }

  for(var k = 0; k < bad_polygons.length; k++)
  {
    if(i != k && pointInPolygon(bad_polygons[k], point2))
    {
      inPoly = true
    }
  }
  if(inPoly)
  {
    return null
  }*/

  var min_distance = null
  var min_path = null
  var point1_adj = []
  var point2_adj = []


  var inPoly = false

  for(var i = 0; i < this.vertices.length; i++)
  {
    if(isVisible(point1, this.vertices[i], this.poly_edges) && isVisible(point1, this.vertices[i], this.level.obstacle_edges))
    {
      point1_adj.push(i)
    }
    if(isVisible(point2, this.vertices[i], this.level.obstacle_edges))
    {
      point2_adj.push(i)
    }
  }
  //console.log(point1_adj)
  //console.log(point2_adj)
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
        v_dist = this.shortest_paths[point1_adj[i]][point2_adj[j]].dist
      }
      if(v_dist == null) continue
      var dist = p_dist(point1, this.vertices[point1_adj[i]]) + v_dist
        + p_dist(this.vertices[point2_adj[j]], point2);
      if(!min_distance || dist < min_distance)
      {
        min_distance = dist
        if(point1_adj[i] == point2_adj[j])
        {
          min_path = [point1_adj[i]]
          //console.log(i+" "+j+" "+point1_adj[i]+" "+point2_adj[j])
          //console.log("NEW MIN PATH with "+dist)
          //console.log(min_path)
        }
        else
        {
          //console.log(i+" "+j+" "+point1_adj[i]+" "+point2_adj[j])
          min_path = this.shortest_paths[point1_adj[i]][point2_adj[j]].path
          //console.log("NEW MIN PATH with "+dist)
          //console.log(min_path)
        }
      }
    }
  }

  if(!min_path) return null//it's possible that player is inside an open-space that is surrouded by triangle edges.
    //thus, no visible vertices
    //this is only if the player "tunnels" (cheats)
  var ans = []

  for (var i = 0; i < min_path.length; i++)
  {
    ans.push(this.vertices[min_path[i]])
  }
  ans.push(point2)
  //console.log("ANSWER ")
  //console.log(ans)
  return {path: ans, dist: min_distance}
}
