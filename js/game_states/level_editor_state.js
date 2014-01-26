  //A = align
  //C = crop
  //O = turn into outline
  //Q = cancel selected
  //D = delete
  //X = reflect horizontally
  //Z = reflect vertically
  //N = add polygon
  //P = print polygons
  //arrows = move selected polygon
  //+ = zoom in
  //- = zoom out


LevelEditorState.prototype = new GameState

LevelEditorState.prototype.constructor = LevelEditorState

function LevelEditorState() {

  this.polygons = []

  this.outline_polygons = []

  this.accumulated_vertices = []

  this.selected_v = null
  this.selected_p = null

  this.crop_coordinates = null


  this.drag_loc = null
  this.dragging = false
  this.levelWidth = 800
  this.levelHeight = 600
  this.bg_drawn = false

  this.zoom = 1
  this.camera_center = {x:imp_vars.levelWidth/2, y:imp_vars.levelHeight/2}

}

LevelEditorState.prototype.process = function(dt) {

}

LevelEditorState.prototype.draw = function(context, bg_ctx) {
  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, imp_vars.canvasWidth, imp_vars.canvasHeight);
    bg_ctx.fillStyle = "white"
    bg_ctx.fillRect(0, 0, imp_vars.canvasWidth, imp_vars.canvasHeight);
    this.bg_drawn = true
  }

  context.save();

  context.scale(this.zoom, this.zoom)
  context.translate((imp_vars.levelWidth/2 - this.camera_center.x*this.zoom)/this.zoom, (imp_vars.levelHeight/2 - this.camera_center.y*this.zoom)/this.zoom);

  context.beginPath()
  context.rect(0, 0, 800, 600)
  context.strokeStyle = "gray"
  context.stroke()

  for(var i = 0; i < this.polygons.length; i++) {
    context.beginPath()
    context.moveTo(this.polygons[i][0].x, this.polygons[i][0].y)
    for(var j = 1; j < this.polygons[i].length; j++)
    {
      context.lineTo(this.polygons[i][j].x, this.polygons[i][j].y)
    }
    context.closePath()
    context.strokeStyle = "black"
    context.stroke()
    context.fillStyle = (this.selected_p != null && this.selected_p == i) ? "red" : "black"
    context.globalAlpha = .5
    context.fill()
    context.globalAlpha = 1

    context.beginPath()
    context.arc(this.polygons[i][0].x, this.polygons[i][0].y, 5, 0, 2*Math.PI * 0.999)
    context.fillStyle = (this.selected_v && this.selected_v[0] == i && this.selected_v[1] == 0) ? "red" : "black"
    context.fill()
    for(var j = 1; j < this.polygons[i].length; j++)
    {
      context.beginPath()
      context.arc(this.polygons[i][j].x, this.polygons[i][j].y, 5, 0, 2*Math.PI * 0.999)
      context.fillStyle = (this.selected_v && this.selected_v[0] == i && this.selected_v[1] == j) ? "red" : "black"
      context.fill()
    }

    context.globalAlpha = 1
  }

  for(var i= 0; i < this.accumulated_vertices.length; i++) {
    context.beginPath()
    context.fillStyle = (this.selected_av != null && this.selected_av == i) ? "red" : "black"
    context.arc(this.accumulated_vertices[i].x, this.accumulated_vertices[i].y, 5, 0, 2*Math.PI * 0.999)
    context.fill()
  }

  for(var i = 0; i < this.outline_polygons.length; i++) {
    context.beginPath()
    context.moveTo(this.outline_polygons[i][0].x, this.outline_polygons[i][0].y)
    for(var j = 1; j < this.outline_polygons[i].length; j++)
    {
      context.lineTo(this.outline_polygons[i][j].x, this.outline_polygons[i][j].y)
    }
    context.closePath()
    context.strokeStyle = "cyan"
    context.stroke()
    context.fillStyle = "cyan"
    context.globalAlpha = .2
    context.fill()

    for(var j = 0; j < this.outline_polygons[i].length; j++)
    {
      context.beginPath()
      context.arc(this.outline_polygons[i][j].x, this.outline_polygons[i][j].y, 5, 0, 2*Math.PI * 0.999)
      context.fillStyle = "cyan"
      context.fill()
    }

    context.globalAlpha = 1
  }

  context.restore()

}

LevelEditorState.prototype.rotate_world = function(angle, center_point, duplicate) {
  var new_polygons = []
  if(center_point === undefined)
    center_point = {x: 400, y: 300}

  for(var i = 0; i < this.polygons.length; i++) {
    var new_polygon = []
    for(var j = 0; j < this.polygons[i].length; j++) {
      var pt = this.polygons[i][j]
      var r = p_dist(pt, center_point)
      var theta = _atan(center_point, pt)
      var new_pt = {x: center_point.x + r*Math.cos(angle + theta), y: center_point.y + r*Math.sin(angle + theta)}
      new_polygon.push(new_pt)
    }
    new_polygons.push(new_polygon)

  }
  if (duplicate) {
    this.polygons = this.polygons.concat(new_polygons)
  } else {
    this.polygons = new_polygons  
  }
}

LevelEditorState.prototype.scale_world = function(sx, sy, center_point) {
  var new_polygons = []
  if(center_point === undefined)
    center_point = {x: 400, y: 300}

  for(var i = 0; i < this.polygons.length; i++) {
    var new_polygon = []
    for(var j = 0; j < this.polygons[i].length; j++) {
      var pt = this.polygons[i][j]
      var r = p_dist(pt, center_point)
      var theta = _atan(center_point, pt)
      var new_pt = {x: center_point.x + sx*r*Math.cos(theta), y: center_point.y + sy*r*Math.sin(theta)}
      new_polygon.push(new_pt)
    }
    new_polygons.push(new_polygon)

  }
  this.polygons = new_polygons
}

LevelEditorState.prototype.scale_polygon = function(polygon, sx, sy, center_point) {
  if(center_point === undefined)
    center_point = {x: 400, y: 300}

  var new_polygon = []
  for(var j = 0; j < this.polygons[polygon].length; j++) {
    var pt = this.polygons[polygon][j]
    var r = p_dist(pt, center_point)
    var theta = _atan(center_point, pt)
    var new_pt = {x: center_point.x + sx*r*Math.cos(theta), y: center_point.y + sy*r*Math.sin(theta)}
    new_polygon.push(new_pt)
  }
  this.polygons.push(new_polygon);
}

LevelEditorState.prototype.scale_polygon_around_centroid = function(polygon, s) {
  var centroid = {x: 0, y: 0}
  for(var j = 0; j < this.polygons[polygon].length; j++) {
    centroid.x += this.polygons[polygon][j].x
    centroid.y += this.polygons[polygon][j].y
  }
  centroid.x /= this.polygons[polygon].length
  centroid.y /= this.polygons[polygon].length

  var new_polygon = []
  for(var j = 0; j < this.polygons[polygon].length; j++) {
    var pt = this.polygons[polygon][j]
    var r = p_dist(pt, centroid)
    var theta = _atan(centroid, pt)
    var new_pt = {x: centroid.x + s*r*Math.cos(theta), y: centroid.y + s*r*Math.sin(theta)}
    new_polygon.push(new_pt)
  }
  this.polygons[polygon] = new_polygon
}

LevelEditorState.prototype.scale_all_polygons_around_centroid = function(s) {
  for(var j = 0; j < this.polygons.length; j++) {
    this.scale_polygon_around_centroid(j, s)
  }
}

LevelEditorState.prototype.scale_these_polygons_around_centroid = function(arr, s) {
  for(var j = 0; j < arr.length; j++) {
    this.scale_polygon_around_centroid(arr[j], s)
  } 
}

LevelEditorState.prototype.translate_world = function(dx, dy) {
  var new_polygons = []

  for(var i = 0; i < this.polygons.length; i++) {
    var new_polygon = []
    for(var j = 0; j < this.polygons[i].length; j++) {
      var pt = this.polygons[i][j]
      var new_pt = {x: pt.x + dx, y: pt.y + dy}
      new_polygon.push(new_pt)
    }
    new_polygons.push(new_polygon)

  }
  this.polygons = new_polygons
}

LevelEditorState.prototype.duplicate_polygon = function(index, translation) {
  var new_polygon = []
    for(var j = 0; j < this.polygons[index].length; j++) {
      var pt = this.polygons[index][j]
      var new_pt = {x: pt.x + translation.x, y: pt.y + translation.y}
      new_polygon.push(new_pt)
    }
  this.polygons.push(new_polygon)

}

LevelEditorState.prototype.duplicate_translate_world = function(dx, dy) {
  var new_polygons = []

  for(var i = 0; i < this.polygons.length; i++) {
    var new_polygon = []
    for(var j = 0; j < this.polygons[i].length; j++) {
      var pt = this.polygons[i][j]
      var new_pt = {x: pt.x + dx, y: pt.y + dy}
      new_polygon.push(new_pt)
    }
    new_polygons.push(new_polygon)

  }
  this.polygons = this.polygons.concat(new_polygons)
}


LevelEditorState.prototype.rotate_polygon = function(index, angle, center_point) {
  if(center_point === undefined)
    center_point = {x: 400, y: 300}
  var new_polygon = []
  for(var j = 0; j < this.polygons[index].length; j++) {
    var pt = this.polygons[index][j]
    var r = p_dist(pt, center_point)
    var theta = _atan(center_point, pt)
    var new_pt = {x: center_point.x + r*Math.cos(angle + theta), y: center_point.y + r*Math.sin(angle + theta)}
    new_polygon.push(new_pt)
  }
  this.polygons.push(new_polygon)
}

LevelEditorState.prototype.transform_to_zoomed_space = function(pt) {

  var new_point = {x: (pt.x - (imp_vars.levelWidth/2 - this.camera_center.x*this.zoom))/this.zoom,
    y: (pt.y - (imp_vars.levelHeight/2 - this.camera_center.y*this.zoom))/this.zoom};
  return new_point
}

LevelEditorState.prototype.on_mouse_move = function(x, y) {
  var trans_point = this.transform_to_zoomed_space({x:x, y:y});

  if(this.dragging) {
    for(var i = 0; i < this.polygons[this.selected_p].length; i++) {
      this.polygons[this.selected_p][i].x += (trans_point.x - this.drag_loc.x)
      this.polygons[this.selected_p][i].y += (trans_point.y - this.drag_loc.y)
    }
    this.drag_loc = trans_point
  }

}

LevelEditorState.prototype.on_mouse_up = function(x, y) {
  this.dragging = false
  this.drag_loc = null
}

LevelEditorState.prototype.on_mouse_down = function(x, y) {
  var trans_point = this.transform_to_zoomed_space({x:x, y:y});
  if(this.selected_p != null && pointInPolygon(this.polygons[this.selected_p], trans_point)) {
    this.drag_loc = trans_point
    this.dragging = true
  }
}


LevelEditorState.prototype.on_click = function(x, y) {
  var trans_point = this.transform_to_zoomed_space({x:x, y:y});
  console.log(trans_point.x+" "+trans_point.y)

  if(this.selected_v != null) {
    this.polygons[this.selected_v[0]][this.selected_v[1]].x = trans_point.x
    this.polygons[this.selected_v[0]][this.selected_v[1]].y = trans_point.y
    return
  }

  if(this.selected_av != null) {
    this.accumulated_vertices[this.selected_av].x = trans_point.x
    this.accumulated_vertices[this.selected_av].y = trans_point.y
    return
  }

  if(this.selected_p != null) {
    return
  }

  for(var i = 0; i < this.polygons.length; i++) {
    for(var j = 0; j < this.polygons[i].length; j++) {
      if(p_dist({x: this.polygons[i][j].x, y: this.polygons[i][j].y}, trans_point) < 5/this.zoom) {
        this.selected_v = [i, j]
        return
      }
    }
  }

  for(var i = 0; i < this.polygons.length; i++) {
    if(pointInPolygon(this.polygons[i], trans_point)) {
      this.selected_p = i
      console.log("CLICKED ON POLYGON "+i)
      return
    }

  }

  for(var i = 0; i < this.accumulated_vertices.length; i++) {
    if(p_dist({x: this.accumulated_vertices[i].x, y: this.accumulated_vertices[i].y}, trans_point) < 5/this.zoom) {
        this.selected_av = i
        return
      }
  }


  this.accumulated_vertices.push(trans_point)
}

LevelEditorState.prototype.get_closest_coords = function(x, y) {
  var ans_x = 0
  var ans_y = 0
  for(var i= 0; i < this.polygons.length; i++) {
    for(var j = 0; j < this.polygons[i].length; j++) {
      if(Math.abs(this.polygons[i][j].x - x) != 0 && Math.abs(this.polygons[i][j].x - x) < Math.abs(x - ans_x)) {
        ans_x = this.polygons[i][j].x
      }
      if(Math.abs(this.polygons[i][j].y - y) != 0 && Math.abs(this.polygons[i][j].y - y) < Math.abs(y - ans_y)) {
        ans_y = this.polygons[i][j].y
      }
    }
  }
  for(var i= 0; i < this.outline_polygons.length; i++) {
    for(var j = 0; j < this.outline_polygons[i].length; j++) {
      if(Math.abs(this.outline_polygons[i][j].x - x) != 0 && Math.abs(this.outline_polygons[i][j].x - x) < Math.abs(x - ans_x)) {
        ans_x = this.outline_polygons[i][j].x
      }
      if(Math.abs(this.outline_polygons[i][j].y - y) != 0 && Math.abs(this.outline_polygons[i][j].y - y) < Math.abs(y - ans_y)) {
        ans_y = this.outline_polygons[i][j].y
      }
    }
  }

  for(var i = 0; i < this.accumulated_vertices.length; i++) {
    if(Math.abs(this.accumulated_vertices[i].x - x) != 0 && Math.abs(this.accumulated_vertices[i].x - x) < Math.abs(x - ans_x)) {
      ans_x = this.accumulated_vertices[i].x
    }
    if(Math.abs(this.accumulated_vertices[i].y - y) != 0 && Math.abs(this.accumulated_vertices[i].y - y) < Math.abs(y - ans_y)) {
      ans_y = this.accumulated_vertices[i].y
    }
  }

  return {x: ans_x, y: ans_y}

}

LevelEditorState.prototype.on_key_down = function(keyCode) {

  if(keyCode == 65) { //A = align
    if(this.selected_v != null) {
      var selected = this.polygons[this.selected_v[0]][this.selected_v[1]]
      var ans = this.get_closest_coords(selected.x, selected.y)
      selected.x = ans.x
      selected.y = ans.y

    }
    if(this.selected_av != null) {
      var selected = this.accumulated_vertices[this.selected_av]
      var ans = this.get_closest_coords(selected.x, selected.y)
      selected.x = ans.x
      selected.y = ans.y
    }

  }

  if(keyCode == 67) { //C = crop
    this.crop_coordinates = [Math.min(this.accumulated_vertices[0].x, this.accumulated_vertices[1].x), Math.min(this.accumulated_vertices[0].y, this.accumulated_vertices[1].y), Math.max(this.accumulated_vertices[0].x, this.accumulated_vertices[1].x), Math.max(this.accumulated_vertices[0].y, this.accumulated_vertices[1].y)]
    this.accumulated_vertices = []
  }

  if(keyCode == 79) {
    if(this.selected_p != null) {
      this.outline_polygons.push(this.polygons[this.selected_p])
      this.polygons.splice(this.selected_p, 1)
      this.selected_p = null
    }
  }

  if(keyCode == 81) { //Q = cancel selected
    this.selected_v = null
    this.selected_p = null
    this.selected_av = null
  }

  if(keyCode == 68) { //D = delete
    if(this.selected_p != null) {
      this.polygons.splice(this.selected_p, 1)
      this.selected_p = null
    }

    if(this.selected_v != null) {
      this.polygons[this.selected_v[0]].splice(this.selected_v[1], 1)
      this.selected_v = null
    }

    if(this.selected_av !=null) {
      this.accumulated_vertices.splice(this.selected_av, 1)
      this.selected_av = null
    }

  }

  if(keyCode == 88) { //X = reflect horizontally
    if(this.selected_av != null) {
      this.accumulated_vertices.push({x: imp_vars.levelWidth - this.accumulated_vertices[this.selected_av].x, y: this.accumulated_vertices[this.selected_av].y})
      return
    }

    if(this.selected_p != null) {
      var poly = []
      for(var j = this.polygons[this.selected_p].length - 1; j >= 0; j--) {
        poly.push({x: imp_vars.levelWidth - this.polygons[this.selected_p][j].x, y: this.polygons[this.selected_p][j].y})
      }
      this.polygons.push(poly)
      return
    }

    // var k = this.polygons.length
    // for(var i = 0; i < k; i++) {
    //   var poly = []
    //   for(var j = this.polygons[i].length - 1; j >= 0; j--) {
    //     poly.push({x: imp_vars.levelWidth - this.polygons[i][j].x, y: this.polygons[i][j].y})
    //   }
    //   this.polygons.push(poly)
    // }
  }

  if(keyCode == 90) { //Z = reflect vertically
    if(this.selected_av != null) {
      this.accumulated_vertices.push({x: this.accumulated_vertices[this.selected_av].x, y: imp_vars.levelHeight - this.accumulated_vertices[this.selected_av].y})
      return
    }

    if(this.selected_p != null) {
      var poly = []
      for(var j = this.polygons[this.selected_p].length - 1; j >= 0; j--) {
        poly.push({x: this.polygons[this.selected_p][j].x, y: imp_vars.levelHeight - this.polygons[this.selected_p][j].y})
      }
      this.polygons.push(poly)
      return
    }
    // var k = this.polygons.length
    // for(var i = 0; i < k; i++) {
    //   var poly = []
    //   for(var j = this.polygons[i].length - 1; j >= 0; j--) {
    //     poly.push({x: this.polygons[i][j].x, y: this.imp_vars.levelHeight - this.polygons[i][j].y})
    //   }
    //   this.polygons.push(poly)
    // }
  }
  console.log(keyCode)

  if(keyCode == 78) { //N = add polygon
    this.polygons.push(this.accumulated_vertices)
    this.accumulated_vertices = []
  }
  if(keyCode == 80) { //P = print polygons
    this.print_polygon()
  }

  if(keyCode >= 37 && keyCode <= 40) {
    var dx = 0;
    var dy = 0;
    if(keyCode == 37) dx = -1
    if(keyCode == 38) dy = -1
    if(keyCode == 39) dx = 1
    if(keyCode == 40) dy = 1

    if(this.selected_p != null) {
      for(var i = 0; i < this.polygons[this.selected_p].length; i++) {
        this.polygons[this.selected_p][i].x += dx
        this.polygons[this.selected_p][i].y += dy
      }
      return
    }


    if(this.selected_v != null) {
      this.polygons[this.selected_v[0]][this.selected_v[1]].x += dx
      this.polygons[this.selected_v[0]][this.selected_v[1]].y += dy
      return
    }

    if(this.selected_av != null) {
      this.accumulated_vertices[this.selected_av].x += dx
      this.accumulated_vertices[this.selected_av].y += dy
      return
    }
  }


  if(keyCode == 187) {
    this.zoom *=1.25
  }
  if(keyCode == 189) {
    this.zoom /=1.25
  }


}

LevelEditorState.prototype.on_key_up = function(keyCode) {
}

LevelEditorState.prototype.print_polygon = function() {
  var polygon_ans = []
  for(var i = 0; i < this.polygons.length; i++) {
    var temp_p = []
    for(var j = 0; j < this.polygons[i].length; j++) {
      temp_p.push([Math.round(this.polygons[i][j].x), Math.round(this.polygons[i][j].y)])
    }
    polygon_ans.push(temp_p)
  }
  console.log(JSON.stringify(polygon_ans))
  return JSON.stringify(polygon_ans)
}

LevelEditorState.prototype.print_accumulated_vertices = function() {
  var temp_p = []
  for(var i = 0; i < this.accumulated_vertices.length; i++) {
    temp_p.push([Math.round(this.accumulated_vertices[i].x), Math.round(this.accumulated_vertices[i].y)])
  }
  console.log(JSON.stringify(temp_p))
  return JSON.stringify(temp_p)
}

LevelEditorState.prototype.reverse_all_polygon_vertices = function() {
  for(var i = 0; i < this.polygons.length; i++) {
    this.reverse_polygon_vertice_order(i)
  }
}

LevelEditorState.prototype.reverse_polygon_vertice_order = function(index) {

  var new_polygon = []
  for(var j = this.polygons[index].length - 1; j >= 0 ; j--) {

    new_polygon.push(this.polygons[index][j])
  }
  this.polygons[index] = new_polygon
}


LevelEditorState.prototype.save = function(string) {
  localStorage[string] = this.print_polygon()
}

LevelEditorState.prototype.load = function(string) {
  var polygon_ans = JSON.parse(localStorage[string])
  this.polygons = []
  for(var i = 0; i < polygon_ans.length; i++) {
    var temp_p = []
    for(var j = 0; j < polygon_ans[i].length; j++) {

      temp_p.push({x: polygon_ans[i][j][0], y: polygon_ans[i][j][1]})
    }
    this.polygons.push(temp_p)
  }
}

LevelEditorState.prototype.load_level = function(string, mode) {
  var polygon_ans = null
  var difficulty_mode = mode ? mode : imp_vars.player_data.difficulty_mode

  if (difficulty_mode == "easy") {
    polygon_ans = imp_params.impulse_level_data[string].obstacle_v_easy
  }
  if (!polygon_ans) {
    polygon_ans = imp_params.impulse_level_data[string].obstacle_v
  }
  this.polygons = []
  for(var i = 0; i < polygon_ans.length; i++) {
    var temp_p = []
    for(var j = 0; j < polygon_ans[i].length; j++) {

      temp_p.push({x: polygon_ans[i][j][0], y: polygon_ans[i][j][1]})
    }
    this.polygons.push(temp_p)
  }
}

LevelEditorState.prototype.add_level = function(string) {
  var polygon_ans = null
  if (imp_vars.player_data.difficulty_mode == "easy") {
    polygon_ans = imp_params.impulse_level_data[string].obstacle_v_easy
  }
  if (!polygon_ans) {
    polygon_ans = imp_params.impulse_level_data[string].obstacle_v
  }
  for(var i = 0; i < polygon_ans.length; i++) {
    var temp_p = []
    for(var j = 0; j < polygon_ans[i].length; j++) {

      temp_p.push({x: polygon_ans[i][j][0], y: polygon_ans[i][j][1]})
    }
    this.polygons.push(temp_p)
  }
}


