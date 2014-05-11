var LoaderGameState = function() {
  //empty constructor
}
LoaderGameState.prototype = new GameState()

LoaderGameState.prototype.constructor = LoaderGameState

LoaderGameState.prototype.load_level = function(level_data) {
  var level = new Level(level_data, this)

  level.generate_obstacles()

  if(imp_vars.minified)
    var visibility_graph_worker = new Worker("js/lib/visibility_graph_worker.js")
  else
    var visibility_graph_worker = new Worker("js/lib/visibility_graph_worker_real.js")
  visibility_graph_worker.postMessage({"a": level.boundary_polygons, /*polygons*/
     "b": level.obstacle_edges, /*obstacle_edges*/
     "c": imp_vars.draw_factor, /*draw_factor*/
     "d": imp_vars.levelWidth, /*levelWidth*/
     "e": imp_vars.levelHeight}) /*levelHeight*/

  this.load_percentage = 0

  visibility_graph_worker.onmessage = function(_this) {
    return function(event) {
      if (event.data["z"]) {
        _this.load_percentage = event.data["z"]

      }
      else if(event.data["a"]) {
        _this.visibility_graph = new VisibilityGraph(
          level, 
          event.data["a"], /*poly_edges*/
          event.data["b"], /*vertices*/
          event.data["c"], /*edges*/
          event.data["d"], /*edge_list*/
          event.data["e"], /*shortes_paths*/
          event.data["f"]) /*visible_vertices*/
        _this.load_percentage = 1
        _this.load_complete()
      }
    }

  }(this)

  return level
}

LoaderGameState.prototype.load_complete = function() {

}
