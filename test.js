function test_line_intersect() {
    let line1 = [[10, 300], [500, 200]]
    let line2 = [[30, 40], [mousex, mousey]]
    drawline(ctx, line1)
    drawline(ctx, line2)
    let intersect = line_intersect(line1, line2)
    if (intersect.hit) {
        ctx.beginPath()
        ctx.ellipse(...intersect.point, 5, 5, 0, 0, Math.PI * 2)
        ctx.stroke()
    }
}

function test_line_circle_intersect() {
    let line = [[10, 300], [500, 200]]
    let circle = [[mousex, mousey], 20]
    let intersect = line_circle_intersect(line, circle)
    drawline(ctx, line)
    if (intersect.hit) {
        drawcircle(ctx, [intersect.point, 5])
        drawcircle(ctx, [add(circle[0], intersect.escape), circle[1]])
    } else {
        drawcircle(ctx, circle)
    }
}

function test_circle_circle_intersect() {
    let circle1 = [[mousex, mousey], 20]
    let circle2 = [[100, 100], 30]

    let intersect = circle_circle_intersect(circle2, circle1)
    drawcircle(ctx, circle2)

    if (intersect.hit) {
        drawcircle(ctx, [intersect.point, 5])
        drawcircle(ctx, [add(circle1[0], intersect.escape), circle1[1]])
    } else {
        drawcircle(ctx, circle1)
    }
}



function test_update() {
    requestAnimationFrame(test_update)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    test_line_intersect()
    test_line_circle_intersect()
    test_circle_circle_intersect()
}

// test_update()