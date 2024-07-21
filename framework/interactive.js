let mousex = 0
let mousey = 0
let mousepressed = false

document.addEventListener('mousemove', function (e) {
    mousex = e.x
    mousey = e.y
})

document.addEventListener('mousedown', function (e) {
    mousepressed = true
})

document.addEventListener('mouseup', function (e) {
    mousepressed = false
})

let keypressed = {}



document.addEventListener('keydown', function (e) {
    keypressed[e.key] = true
})

document.addEventListener('keyup', function (e) {
    keypressed[e.key] = false
})

window.addEventListener("blur", function () {
    keypressed = {}
    mousepressed = false
})

