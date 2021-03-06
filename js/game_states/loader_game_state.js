var constants = require('../data/constants.js');
var debugVars = require('../data/debug.js');

var GameState = require('../game_states/game_state.js');
var Level = require('../level/level.js');
var VisibilityGraph = require('../lib/visibility_graph.js');

var LoaderGameState = function() {
  //empty constructor
}
LoaderGameState.prototype = new GameState()

LoaderGameState.prototype.constructor = LoaderGameState

LoaderGameState.prototype.load_level = function(level_data) {
  var level = new Level(level_data, this)

  level.generate_obstacles()

  if(debugVars.use_minified_worker)
    var visibility_graph_worker = new Worker("js/lib/worker.js")
  else
    var visibility_graph_worker = new Worker("js/lib/visibility_graph_worker_real.js")
  visibility_graph_worker.postMessage({"a": level.boundary_polygons, /*polygons*/
     "b": level.obstacle_edges, /*obstacle_edges*/
     "c": constants.drawFactor, /*draw_factor*/
     "d": constants.levelWidth, /*levelWidth*/
     "e": constants.levelHeight}) /*levelHeight*/

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

module.exports = LoaderGameState;
