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

  this.draw_factor = 15

  this.drag_loc = null
  this.dragging = false
  this.levelWidth = 800
  this.levelHeight = 600
  this.bg_drawn = false

  this.zoom = 1
  this.camera_center = {x:levelWidth/2, y:levelHeight/2}

}

LevelEditorState.prototype.process = function(dt) {

}

LevelEditorState.prototype.draw = function(context, bg_ctx) {
  if(!this.bg_drawn) {
    bg_ctx.clearRect(0, 0, canvas.width, canvas.height);
    bg_ctx.fillStyle = "white"
    bg_ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.bg_drawn = true
  }

  ctx.save();

  ctx.scale(this.zoom, this.zoom)
  ctx.translate((levelWidth/2 - this.camera_center.x*this.zoom)/this.zoom, (levelHeight/2 - this.camera_center.y*this.zoom)/this.zoom);

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

LevelEditorState.prototype.rotate_world = function(angle, center_point) {
  var new_polygons = []

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

LevelEditorState.prototype.rotate_polygon = function(index, angle, center_point) {
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

  var new_point = {x: (pt.x - (levelWidth/2 - this.camera_center.x*this.zoom))/this.zoom,
    y: (pt.y - (levelHeight/2 - this.camera_center.y*this.zoom))/this.zoom};
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
      this.accumulated_vertices.push({x: levelWidth - this.accumulated_vertices[this.selected_av].x, y: this.accumulated_vertices[this.selected_av].y})
      return
    }

    if(this.selected_p != null) {
      var poly = []
      for(var j = this.polygons[this.selected_p].length - 1; j >= 0; j--) {
        poly.push({x: levelWidth - this.polygons[this.selected_p][j].x, y: this.polygons[this.selected_p][j].y})
      }
      this.polygons.push(poly)
      return
    }

    // var k = this.polygons.length
    // for(var i = 0; i < k; i++) {
    //   var poly = []
    //   for(var j = this.polygons[i].length - 1; j >= 0; j--) {
    //     poly.push({x: levelWidth - this.polygons[i][j].x, y: this.polygons[i][j].y})
    //   }
    //   this.polygons.push(poly)
    // }
  }

  if(keyCode == 90) { //Z = reflect vertically
    if(this.selected_av != null) {
      this.accumulated_vertices.push({x: this.accumulated_vertices[this.selected_av].x, y: this.levelHeight - this.accumulated_vertices[this.selected_av].y})
      return
    }

    if(this.selected_p != null) {
      var poly = []
      for(var j = this.polygons[this.selected_p].length - 1; j >= 0; j--) {
        poly.push({x: this.polygons[this.selected_p][j].x, y: this.levelHeight - this.polygons[this.selected_p][j].y})
      }
      this.polygons.push(poly)
      return
    }
    // var k = this.polygons.length
    // for(var i = 0; i < k; i++) {
    //   var poly = []
    //   for(var j = this.polygons[i].length - 1; j >= 0; j--) {
    //     poly.push({x: this.polygons[i][j].x, y: this.levelHeight - this.polygons[i][j].y})
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

  if(keyCode == 37) {
    for(var i = 0; i < this.polygons[this.selected_p].length; i++) {
      this.polygons[this.selected_p][i].x -= 1
    }

  }
  if(keyCode == 38) {
    for(var i = 0; i < this.polygons[this.selected_p].length; i++) {
      this.polygons[this.selected_p][i].y -= 1
    }

  }
  if(keyCode == 39) {
    for(var i = 0; i < this.polygons[this.selected_p].length; i++) {
      this.polygons[this.selected_p][i].x += 1
    }

  }
  if(keyCode == 40) {
    for(var i = 0; i < this.polygons[this.selected_p].length; i++) {
      this.polygons[this.selected_p][i].y += 1
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

LevelEditorState.prototype.load_level = function(string) {
  var polygon_ans = impulse_level_data[string].obstacle_v
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
  var polygon_ans = impulse_level_data[string].obstacle_v
  for(var i = 0; i < polygon_ans.length; i++) {
    var temp_p = []
    for(var j = 0; j < polygon_ans[i].length; j++) {

      temp_p.push({x: polygon_ans[i][j][0], y: polygon_ans[i][j][1]})
    }
    this.polygons.push(temp_p)
  }
}


