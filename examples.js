function show(value) { 
  $("#big").text(value != undefined ? value.toString() : "") 
}
function keyUps(keyCode) { 
  return $("body").asEventStream("keyup").filter(function(e) { return e.keyCode == keyCode }) 
}
function keyDowns(keyCode) { 
  return $("body").asEventStream("keydown").filter(function(e) { return e.keyCode == keyCode }) 
}
function keyState(keyCode, downValue, upValue) { 
  return keyDowns(keyCode).map(downValue)
    .merge(keyUps(keyCode).map(upValue)).toProperty(upValue) 
}

function v(x, y) { return new Vector2D(x, y) }
var v0 = v(0, 0)

$(function() {
  

  
})
