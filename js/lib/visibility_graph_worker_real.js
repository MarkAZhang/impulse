//console.log("START")
self.onmessage = function(event) {


  var polygons = event.data.polygons
  var obstacle_edges = event.data.obstacle_edges // actual obstacle edges
  var draw_factor = event.data.draw_factor
  var levelWidth = event.data.levelWidth
  var levelHeight = event.data.levelHeight
  var poly_edges = [] // buffered obstacle edges (surround)
  var vertices = []
  var edges = [] // visibility graph edges
  var edge_list = {}
  var shortest_paths = {}
  var visible_vertices = {}

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

      if(!inPoly && check_bounds(0, vertex, draw_factor, levelWidth, levelHeight))
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

  postMessage({percentage: .25})

  for(var i = 0; i < vertices.length; i++)
  {
    edge_list[i] = {}
    for(var j = 0; j < i; j++)
    {

      var v_i = vertices[i]
      var v_j = vertices[j]
      if(v_i.x *draw_factor == 400 && v_i.y *draw_factor== 350) {
        console.log("HERE")
      }
      if(v_i.p_n!=v_j.p_n || (v_i.p_n==v_j.p_n && (Math.max(v_i.p_i, v_j.p_i) - Math.min(v_i.p_i, v_j.p_i) == 1 || Math.min(v_i.p_i, v_j.p_i) == 0 && Math.max(v_i.p_i, v_j.p_i) == v_i.p_v - 1)))//if adjacent edges of same polygon, add. else, if different polygons and visible, add
      {
        if(isVisible(v_i, v_j, poly_edges) && isVisible(v_i, v_j, obstacle_edges))
        {
          edges.push({p1: v_i, p2: v_j})
          var dist =  p_dist(v_j, v_i)
          edge_list[i][j] = dist
          edge_list[j][i] = dist
        }
      }
      else if(v_i.p_n==v_j.p_n && !pointInPolygon(polygons[v_i.p_n], {x: (v_i.x + v_j.x)/2, y: (v_i.y + v_j.y)/2}))
      {//for concave polygons
        if(isVisible(v_i, v_j, obstacle_edges) && isVisible(v_i, v_j, poly_edges))
        {
          edges.push({p1: v_i, p2: v_j})
          var dist =  p_dist(v_j, v_i)
          edge_list[i][j] = dist
          edge_list[j][i] = dist
        }
      }
    }
  }

  postMessage({percentage: .50})

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
  postMessage({percentage: .75})

  var split_size = 50

  var vertices_visible_cache = {}

  for(var i = -150; i < levelWidth+150; i += split_size) {
    for(var j = -150; j < levelHeight+150; j += split_size) {
      var vertices_visible_from_square = []
      var pts_to_check = [{x: i/draw_factor, y: j/draw_factor}, {x: i/draw_factor, y: (j+split_size)/draw_factor}, {x: (i+split_size)/draw_factor, y: j/draw_factor}, {x: (i+split_size)/draw_factor, y: (j+split_size)/draw_factor}]

      for(var k = 0; k < pts_to_check.length; k++) {
        var pts = getVerticesVisibleFromSquare(pts_to_check[k], vertices, obstacle_edges, vertices_visible_cache)
        for(var n = 0; n < pts.length; n++) {
          var not_present = true
          for(var m = 0; m < vertices_visible_from_square.length; m++) {
            if(vertices_visible_from_square[m] == pts[n]) {
              not_present = false
              break;
            }
          }
          if(not_present) {
            vertices_visible_from_square.push(pts[n])
          }
        }

      }
      visible_vertices[i+" "+j] = vertices_visible_from_square
    }

  }


  postMessage({poly_edges: poly_edges, vertices: vertices, edges: edges, edge_list: edge_list, shortest_paths: shortest_paths, visible_vertices: visible_vertices})
}

function getVerticesVisibleFromSquare(pt, vertices, edges, cache) {
  if(cache.hasOwnProperty(pt.x+" "+pt.y)) {
    return cache[pt.x+" "+pt.y]
  } else {
    var vertices_visible_from_point = []

    for(var k = 0; k < vertices.length; k++) {
     if(isVisible(pt, vertices[k], edges))
      {
        vertices_visible_from_point.push(k)
      }
    }
  }
  cache[pt.x+" "+pt.y] = vertices_visible_from_point
  return vertices_visible_from_point
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

function p_dist(p1, p2)
{
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

function check_bounds(buffer, pt, draw_factor, levelWidth, levelHeight) {
  var factor = draw_factor ? draw_factor : 1
  return pt.x >= buffer && pt.y >= buffer && pt.x <= levelWidth/factor - buffer && pt.y <= (levelHeight)/factor - buffer
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
      return false//lines are collinear. For the purposes of our cur_game_state.visibility_graph, this does not count as an intersection
    }
    //lines are parallel
  }
  var t = crossProduct(a, seg2d)/b
  var s = crossProduct(a, seg1d)/b
  return t>=0 && t<=1 && s>=0 && s<=1
}

var eq = function(a, b) {
  return a.x == b.x && a.y == b.y
}

function crossProduct(v1, v2)
{
  return v1.x*v2.y - v1.y*v2.x
}

var dijkstra = {
  single_source_shortest_paths: function(graph, s, d) {
    // Predecessor map for each node that has been encountered.
    // node ID => predecessor node ID
    var predecessors = {};

    // Costs of shortest paths from s to all nodes encountered.
    // node ID => cost
    var costs = {};
    costs[s] = 0;

    // Costs of shortest paths from s to all nodes encountered; differs from
    // `costs` in that it provides easy access to the node that currently has
    // the known shortest path from s.
    // XXX: Do we actually need both `costs` and `open`?
    var open = dijkstra.PriorityQueue.make();
    open.push(s, 0);

    var closest,
        u,
        cost_of_s_to_u,
        adjacent_nodes,
        cost_of_e,
        cost_of_s_to_u_plus_cost_of_e,
        cost_of_s_to_v,
        first_visit;
    while (open) {
      // In the nodes remaining in graph that have a known cost from s,
      // find the node, u, that currently has the shortest path from s.
      closest = open.pop();
      if(!closest)
      {
        break
      }
      u = closest.value;
      cost_of_s_to_u = closest.cost;

      // Get nodes adjacent to u...
      adjacent_nodes = graph[u] || {};

      // ...and explore the edges that connect u to those nodes, updating
      // the cost of the shortest paths to any or all of those nodes as
      // necessary. v is the node across the current edge from u.
      for (var v in adjacent_nodes) {
        // Get the cost of the edge running from u to v.
        cost_of_e = adjacent_nodes[v];

        // Cost of s to u plus the cost of u to v across e--this is *a*
        // cost from s to v that may or may not be less than the current
        // known cost to v.
        cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;

        // If we haven't visited v yet OR if the current known cost from s to
        // v is greater than the new cost we just found (cost of s to u plus
        // cost of u to v across e), update v's cost in the cost list and
        // update v's predecessor in the predecessor list (it's now u).
        cost_of_s_to_v = costs[v];
        first_visit = (typeof costs[v] === 'undefined');
        if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
          costs[v] = cost_of_s_to_u_plus_cost_of_e;
          open.push(v, cost_of_s_to_u_plus_cost_of_e);
          predecessors[v] = u;
        }

        // If a destination node was specified and we reached it, we're done.
        if (v === d) {
          open = null;
          break;
        }
      }
    }

    if (d && typeof costs[d] === 'undefined') {
      var msg = ['Could not find a path from ', s, ' to ', d, '.'].join('');
      throw new Error(msg);
    }

    return predecessors;
  },

  extract_shortest_path_from_predecessor_list: function(predecessors, d) {
    var nodes = [];
    var u = d;
    var predecessor;
    while (u != undefined) {
      nodes.push(u);
      predecessor = predecessors[u];
      u = predecessors[u];
    }
    nodes.reverse();
    return nodes;
  },

  find_path: function(graph, s, d) {
    var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
    return dijkstra.extract_shortest_path_from_predecessor_list(
      predecessors, d);
  },

  /**
   * A very naive priority queue implementation.
   */
  PriorityQueue: {
    make: function (opts) {
      var T = dijkstra.PriorityQueue,
          t = {},
          opts = opts || {},
          key;
      for (key in T) {
        t[key] = T[key];
      }
      t.queue = [];
      t.sorter = opts.sorter || T.default_sorter;
      return t;
    },

    default_sorter: function (a, b) {
      return a.cost - b.cost;
    },

    /**
     * Add a new item to the queue and ensure the highest priority element
     * is at the front of the queue.
     */
    push: function (value, cost) {
      var item = {value: value, cost: cost};
      this.queue.push(item);
      this.queue.sort(this.sorter);
    },

    /**
     * Return the highest priority element in the queue.
     */
    pop: function () {
      return this.queue.shift();
    }
  }
};

//console.log("END");