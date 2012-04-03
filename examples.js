var left = 37, up = 38, right = 39, down = 40
function show(value) { $("#big").text(value ? value.toString() : "") }
function concat(xs, ys) { return xs.concat(ys) }
function head(xs) { return xs.length ? xs[0] : undefined }

function keyDowns(keyCode) { return $("body").asEventStream("keydown").filter(function(e) { return e.keyCode == keyCode }) }
function keyUps(keyCode) { return $("body").asEventStream("keyup").filter(function(e) { return e.keyCode == keyCode }) }

function keyState(keyCode, downValue, upValue) {
  return keyDowns(keyCode).map(downValue).merge(keyUps(keyCode).map(upValue)).toProperty(upValue)
}
