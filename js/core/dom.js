var dom = {};

dom.centerCanvas = function() {
  var dim = utils.getWindowDimensions()

  if(imp_params.canvasWidth < dim.w)
  {
    offset_left = (dim.w-imp_params.canvasWidth)/2
    canvas_container.style.left =  Math.round(offset_left) + 'px'
    bg_canvas_container.style.left =  Math.round(offset_left) + 'px'
  }
  else
  {
    offset_left = 0
  }
  if(imp_params.canvasHeight < dim.h)
  {
    offset_top = (dim.h-imp_params.canvasHeight)/2
    canvas_container.style.top = Math.round(offset_top) + 'px'
    bg_canvas_container.style.top =  Math.round(offset_top) + 'px'
  }
  else
  {
    offset_top = 0
  }
  message.style.display = ""
};
