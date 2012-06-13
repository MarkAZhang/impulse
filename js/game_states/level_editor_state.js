LevelEditorState.prototype = new GameState

LevelEditorState.prototype.constructor = LevelEditorState

function LevelEditorState() {
  
  this.polygons = []

  this.accumulated_vertices = []
  
  this.selected_v = null
  this.selected_p = null
  
  this.image = new Image()

  this.image.src = 'snail.png'

  this.crop_coordinates = null

  this.img_w_ratio = canvasWidth/this.image.width
  this.img_h_ratio = canvasHeight/this.image.height

  this.draw_factor = 15

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
  
}

LevelEditorState.prototype.on_mouse_move = function(x, y) {
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

LevelEditorState.prototype.on_key_down = function(keyCode) {

  if(keyCode == 67) { //C = crop
    this.crop_coordinates = [Math.min(this.accumulated_vertices[0].x, this.accumulated_vertices[1].x), Math.min(this.accumulated_vertices[0].y, this.accumulated_vertices[1].y), Math.max(this.accumulated_vertices[0].x, this.accumulated_vertices[1].x), Math.max(this.accumulated_vertices[0].y, this.accumulated_vertices[1].y)]
    this.accumulated_vertices = []
  }

  if(keyCode == 70) { //F = full image
    this.crop_coordinates = null
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
      temp_p.push([this.polygons[i][j].x, this.polygons[i][j].y])
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

