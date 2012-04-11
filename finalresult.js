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
  
  left = keyState(37, v(-1, 0), v0)
  up = keyState(38, v(0, -1), v0)
  right = keyState(39, v(1, 0), v0)
  down = keyState(40, v(0, 1), v0)
  direction = Bacon.combineWith([up, left, right, down], ".add")
  position = direction.sample(20).filter(".isNonZero").scan(v0, ".add")  
  r = new Raphael(200, 200, 400, 400)
  man = r.image("images/man-left-1.png", 50, 50, 40, 40)
  position.onValue( function(pos) { man.attr( { x : pos.x, y : pos.y } ) } )
  angle = direction.filter(".isNonZero").map(".getAngleDeg")
  angle.onValue(function(a) { man.rotate(a + 180, true) } )
  animation = position.changes().bufferWithCount(5).scan(1, function(prev, _) { return prev % 2 + 1 })
  animation.onValue( function(i) { man.attr({ src : "images/man-left-" + i + ".png" }) }  )
})
