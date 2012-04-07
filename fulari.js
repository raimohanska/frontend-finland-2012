function show(value) { $("#big").text(value != undefined ? value.toString() : "") }

function keyUps(keycode) { return $("body").asEventStream("keyup").filter( function (e) { return e.keyCode == keycode} ) }
function keyDowns(keycode) { return $("body").asEventStream("keydown").filter( function (e) { return e.keyCode == keycode} ) }
function keyState(keyCode, downValue, upValue) { return keyDowns(keyCode).map(downValue).merge(keyUps(keyCode).map(upValue)).toProperty(upValue) }

function v(x, y) { return new Vector2D(x, y) }
var v0 = v(0, 0)

$(function() {
  left = keyState(37, v(-1, 0), v0)
  up = keyState(38, v(0, -1), v0)
  right = keyState(39, v(1, 0), v0)
  down = keyState(40, v(0, 1), v0)
  dir = Bacon.combineWith([up, down, left, right], ".add")
  pos = dir.sample(20).filter(".isNonZero").scan(v0, ".add")

  r = new Raphael(50, 50, 200, 200)
  man = r.image("images/man-left-1.png", 50, 50, 40, 40)
  pos.onValue(function(pos) { man.attr( { x : pos.x, y : pos.y } ) })

  rotation = dir.filter(".isNonZero").map(".getAngleDeg")
  rotation.onValue(function(angle) { man.rotate(angle + 180, true) })
  
  animation = pos.changes().bufferWithCount(5).scan(1, function(a, _) { return a % 2 + 1 })
  animation.onValue(function(n) { man.attr({ src : "images/man-left-" + n + ".png" }) })
})
