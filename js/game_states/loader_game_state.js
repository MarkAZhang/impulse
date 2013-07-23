var LoaderGameState = function() {
  //empty constructor
}
LoaderGameState.prototype = new GameState()

LoaderGameState.prototype.constructor = LoaderGameState

LoaderGameState.prototype.load_level = function(level_data) {
  var level = new Level(level_data, this)

  level.generate_obstacles()

  console.log("BEGIN WORKER")

  var visibility_graph_worker = new Worker("js/lib/visibility_graph_worker.js")

  visibility_graph_worker.postMessage({polygons: level.boundary_polygons,
    obstacle_edges: level.obstacle_edges,
     draw_factor: imp_vars.draw_factor,
     levelWidth: imp_vars.levelWidth,
     levelHeight: imp_vars.levelHeight})

  this.load_percentage = 0

  visibility_graph_worker.onmessage = function(_this) {
    return function(event) {
      if(event.data.print) {
        console.log(event.data.print)
      }
      else if (event.data.percentage) {
        _this.load_percentage = event.data.percentage

      }
      else if(event.data.poly_edges) {
        _this.visibility_graph = new VisibilityGraph(level.boundary_polygons, level, event.data.poly_edges, event.data.vertices, event.data.edges, event.data.edge_list, event.data.shortest_paths, event.data.visible_vertices)
        _this.load_percentage = 1
        _this.load_complete()
      }
    }

  }(this)

  return level
}

LoaderGameState.prototype.load_complete = function() {

}