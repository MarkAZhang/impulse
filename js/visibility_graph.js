
var VisibilityGraph = function(polygons) {
  console.log("CREATING VISIBILITY GRAPH")
  this.init(polygons)
}

VisibilityGraph.prototype.init = function(polygons) {
//polygons is an array of array of vertices
  this.poly_edges = []
  this.vertices = []
  this.edges = []
  this.edge_list = {}
  this.shortest_paths = {}
  this.polygons = polygons
  //edge_list stores the adjacencies from each vertex
  //edge_list uses the indices according to this.vertices
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
        vertex.p_n = i
        vertex.p_v = polygon.length
        vertex.p_i = j
        this.vertices.push(vertex)
      }
      this.poly_edges.push({p1: polygon[j], p2: polygon[m]})
      m = j
    }
  }

  for(var i = 0; i < this.vertices.length; i++)
  {
    this.edge_list[i] = {}
    for(var j = 0; j < i; j++)
    {

      var v_i = this.vertices[i]
      var v_j = this.vertices[j]
      if(v_i.p_n!=v_j.p_n || (v_i.p_n==v_j.p_n && (Math.max(v_i.p_i, v_j.p_i) - Math.min(v_i.p_i, v_j.p_i) == 1 || Math.min(v_i.p_i, v_j.p_i) == 0 && Math.max(v_i.p_i, v_j.p_i) == v_i.p_v - 1)))
      {
        if(isVisible(v_i, v_j, this.poly_edges))
        {
          this.edges.push({p1: v_i, p2: v_j})
          var dist =  p_dist(v_j, v_i)
          this.edge_list[i][j] = dist
          this.edge_list[j][i] = dist
        }
      }
    }
  }
  //console.log(this.edge_list)
  for(var h = 0; h < this.vertices.length; h++)
  {

    var predecessors = dijkstra.single_source_shortest_paths(this.edge_list, h)
    //console.log("SHORTEST PATH "+h)
    this.shortest_paths[h] = {}
    for(var i = 0; i < h; i++)
    {
       var path = dijkstra.extract_shortest_path_from_predecessor_list(predecessors, i);
       //console.log(path)
       var sum = 0
       var j = path[0]
       for( var k = 1; k < path.length; k++)
       {
        sum+=this.edge_list[j][path[k]]
        //console.log(j+" "+path[k])
          j = path[k]
       }
       //console.log(sum)
       this.shortest_paths[h][i] = {path: path, dist: sum}
       this.shortest_paths[i][h] = {path: path.slice(0).reverse(), dist: sum}
    }
  }
}

VisibilityGraph.prototype.query = function(point1, point2, bad_polygons)
//start point, end point, list of bad polygons
//returns the shortest path from point1 to VISIBILITY_GRAPH to point2
{
  

  //if it is possible to go from current location to player, always go there directly
  if(isVisible(point1, point2, level.obstacle_edges))//if visible, go there directly
  {
    return [point1, point2]
  }
  
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
    if(isVisible(point1, this.vertices[i], this.poly_edges))
    {
      point1_adj.push(i)
    }
    if(isVisible(point2, this.vertices[i], level.obstacle_edges))
    {
      point2_adj.push(i)
    }
  }
  console.log(point1_adj)
  console.log(point2_adj)
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
      var dist = p_dist(point1, this.vertices[point1_adj[i]]) + v_dist
        + p_dist(this.vertices[point2_adj[j]], point2);
      if(!min_distance || dist < min_distance)
      {
        min_distance = dist
        if(point1_adj[i] == point2_adj[j])
        {
          min_path = [point1_adj[i]]
          //console.log(min_path)
        }
        else
        {

          min_path = this.shortest_paths[point1_adj[i]][point2_adj[j]].path
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
  return ans


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

