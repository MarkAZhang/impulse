var ImpulseButton = function(x, y, w, h, action, border, color) {
  if(!action) return
    this.init(x, y, w, h, action, border, color)
}

ImpulseButton.prototype.init = function(x, y, w, h, action, border, color) {
  this.x = x
  this.y = y
  this.w = w
  this.h = h
  this.action = action
  this.active = true
  this.border = border
  this.color = color
  this.hover = false
  this.hover_color = null
  this.hover_overlay;
}

ImpulseButton.prototype.draw = function(context) {
  context.save()
  if(this.border) {
    context.beginPath()
    context.strokeStyle = this.active ? (this.hover && this.hover_color ? this.hover_color : this.color) : "gray"
    context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
    context.lineWidth = 4 //this.w * 0.03
    context.stroke()
  }
  /*if (this.bg_color) {
    context.beginPath()
    context.rect(this.x - this.w/2, this.y - this.h/2, this.w, this.h)
    context.fillStyle = this.bg_color
    context.fill() 
  }*/
  this.additional_draw(context)
  
  context.restore()
}

ImpulseButton.prototype.post_draw = function(context) {
  if (this.hover_overlay) {
    this.hover_overlay.draw(context)
  }
}
ImpulseButton.prototype.additional_draw = function(context) {}

ImpulseButton.prototype.on_mouse_move = function(x,y) {
    if(x >= this.x - this.w/2 && x <= this.x + this.w/2 && y >= this.y - this.h/2 && y <= this.y + this.h/2)
    {
      if(this.active)
      {
        this.hover = true

      }
      this.mouseOver = true
    }
    else
    {
      this.hover = false
      this.mouseOver = false
    }

    if (this.hover_overlay) {
      this.hover_overlay.set_visible(this.mouseOver);
      this.hover_overlay.set_position(x, y);
    }
}

ImpulseButton.prototype.on_click = function(x,y) {
  if(this.active)
  {
    if(x >= this.x -this.w/2 && x <= this.x + this.w/2 && y >= this.y - this.h/2 && y <= this.y + this.h/2)
    {
      this.action()
      return true
    }
  }
  return false
}

ImpulseButton.prototype.set_active = function(active) {
  this.active = active
  if(!this.active) this.color = "gray"
}

ImpulseButton.prototype.on_key_down = function(keyCode) {
  if (this.active && (this.keyCode && this.keyCode == keyCode) || (this.sKeyCode && this.sKeyCode == keyCode)) {
    this.action()
  }
}

ImpulseButton.prototype.add_hover_overlay = function(hover_overlay) {
  this.hover_overlay = hover_overlay;
}