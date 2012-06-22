LevelEditorState.prototype = new GameState

LevelEditorState.prototype.constructor = LevelEditorState

function LevelEditorState() {
  
  this.polygons = []

  this.outline_polygons = []

  this.accumulated_vertices = []
  
  this.selected_v = null
  this.selected_p = null
  
  this.image = new Image()

  this.image.src = 'snail.png'

  this.crop_coordinates = null

  this.img_w_ratio = canvasWidth/this.image.width
  this.img_h_ratio = canvasHeight/this.image.height

  this.draw_factor = 15

  this.drag_loc = null
  this.dragging = false

}

LevelEditorState.prototype.process = function(dt) {
  
}

LevelEditorState.prototype.draw = function(context) {
  if(this.image_vis) {
    if(!this.crop_coordinates)
      context.drawImage(this.image, 0, 0, canvasWidth, canvasHeight)
    else
      context.drawImage(this.image, this.crop_coordinates[0]/this.img_w_ratio, this.crop_coordinates[1]/this.img_h_ratio, (this.crop_coordinates[2] - this.crop_coordinates[0])/this.img_w_ratio, (this.crop_coordinates[3] - this.crop_coordinates[1])/this.img_h_ratio, 0, 0, canvasWidth, canvasHeight)
  }
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
    context.arc(this.polygons[i][0].x, this.polygons[i][0].y, 5, 0, 2*Math.PI, true)
    context.fillStyle = (this.selected_v && this.selected_v[0] == i && this.selected_v[1] == 0) ? "red" : "black"
    context.fill()
    for(var j = 1; j < this.polygons[i].length; j++)
    {
      context.beginPath()
      context.arc(this.polygons[i][j].x, this.polygons[i][j].y, 5, 0, 2*Math.PI, true)
      context.fillStyle = (this.selected_v && this.selected_v[0] == i && this.selected_v[1] == j) ? "red" : "black"
      context.fill()
    }
     
    context.globalAlpha = 1
  }
  
  for(var i= 0; i < this.accumulated_vertices.length; i++) {
    context.beginPath()
    context.fillStyle = (this.selected_av != null && this.selected_av == i) ? "red" : "black"
    context.arc(this.accumulated_vertices[i].x, this.accumulated_vertices[i].y, 5, 0, 2*Math.PI, true)
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
      context.arc(this.outline_polygons[i][j].x, this.outline_polygons[i][j].y, 5, 0, 2*Math.PI, true)
      context.fillStyle = "cyan"
      context.fill()
    }
     
    context.globalAlpha = 1
  }
  
}

LevelEditorState.prototype.on_mouse_move = function(x, y) {
  if(this.dragging) {
    for(var i = 0; i < this.polygons[this.selected_p].length; i++) {
      this.polygons[this.selected_p][i].x += (x - this.drag_loc.x)
      this.polygons[this.selected_p][i].y += (y - this.drag_loc.y)
    }
    this.drag_loc = {x: x, y: y}
    console.log("CHANGE LOC")
  }
  
}

LevelEditorState.prototype.on_mouse_up = function(x, y) {
  console.log("UP")
  this.dragging = false
  this.drag_loc = null
}

LevelEditorState.prototype.on_mouse_down = function(x, y) {
  console.log("DOWN")
  console.log(x+" "+y)
  if(this.selected_p != null && pointInPolygon(this.polygons[this.selected_p], {x: x, y: y})) {
    this.drag_loc = {x: x, y: y}
    this.dragging = true
    console.log("DRAGGING")
  }
}


LevelEditorState.prototype.on_click = function(x, y) {

  if(this.selected_v != null) {
    this.polygons[this.selected_v[0]][this.selected_v[1]].x = x
    this.polygons[this.selected_v[0]][this.selected_v[1]].y = y
    return
  }

  if(this.selected_av != null) {
    this.accumulated_vertices[this.selected_av].x = x
    this.accumulated_vertices[this.selected_av].y = y
    return
  }

  if(this.selected_p != null) {
    return
  }

  for(var i = 0; i < this.polygons.length; i++) {
    for(var j = 0; j < this.polygons[i].length; j++) {
      if(p_dist({x: this.polygons[i][j].x, y: this.polygons[i][j].y}, {x: x, y: y}) < 5) {
        this.selected_v = [i, j]
        return
      }
    }
  }

  for(var i = 0; i < this.polygons.length; i++) {
    if(pointInPolygon(this.polygons[i], {x: x, y: y})) {
      this.selected_p = i
      return
    }

  }

  for(var i = 0; i < this.accumulated_vertices.length; i++) {
    if(p_dist({x: this.accumulated_vertices[i].x, y: this.accumulated_vertices[i].y}, {x: x, y: y}) < 5) {
        this.selected_av = i
        return
      }
  }


  this.accumulated_vertices.push({x: x, y: y})
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

  if(keyCode == 70) { //F = full image
    this.crop_coordinates = null
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

  if(keyCode == 72) { //H = hide bg
    this.image_vis = !this.image_vis
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
    if(this.selected_p != null) {
      var poly = []
      for(var j = this.polygons[this.selected_p].length - 1; j >= 0; j--) {
        poly.push({x: canvasWidth - this.polygons[this.selected_p][j].x, y: this.polygons[this.selected_p][j].y})
      }
      this.polygons.push(poly)
      return
    }

    var k = this.polygons.length
    for(var i = 0; i < k; i++) {
      var poly = []
      for(var j = this.polygons[i].length - 1; j >= 0; j--) {
        poly.push({x: canvasWidth - this.polygons[i][j].x, y: this.polygons[i][j].y})
      }
      this.polygons.push(poly)
    }
  }

  if(keyCode == 90) { //Z = reflect vertically
    if(this.selected_p != null) {
      var poly = []
      for(var j = this.polygons[this.selected_p].length - 1; j >= 0; j--) {
        poly.push({x: this.polygons[this.selected_p][j].x, y: canvasHeight - this.polygons[this.selected_p][j].y})
      }
      this.polygons.push(poly)
      return
    }
    var k = this.polygons.length
    for(var i = 0; i < k; i++) {
      var poly = []
      for(var j = this.polygons[i].length - 1; j >= 0; j--) {
        poly.push({x: this.polygons[i][j].x, y: canvasHeight - this.polygons[i][j].y})
      }
      this.polygons.push(poly)
    }
  }
  console.log(keyCode)

  if(keyCode == 78) { //N = add polygon
    this.polygons.push(this.accumulated_vertices)
    this.accumulated_vertices = []
  }
  if(keyCode == 80) { //P = print polygons
    this.print_polygon()
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

