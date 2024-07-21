function line_intersect(line1, line2) {
    // line: [[x1, y1], [x2, y2]]
    const d2x = line2[1][0] - line2[0][0]
    const d2y = line2[1][1] - line2[0][1]

    const p10 = -(line1[0][0] - line2[0][0]) * d2y + (line1[0][1] - line2[0][1]) * d2x
    const p11 = -(line1[1][0] - line2[1][0]) * d2y + (line1[1][1] - line2[1][1]) * d2x

    if (p10 >= 0 && p11 <= 0 || p10 <= 0 && p11 >= 0) {
        const d1x = line1[1][0] - line1[0][0]
        const d1y = line1[1][1] - line1[0][1]

        const p20 = -(line2[0][0] - line1[0][0]) * d1y + (line2[0][1] - line1[0][1]) * d1x
        const p21 = -(line2[1][0] - line1[1][0]) * d1y + (line2[1][1] - line1[1][1]) * d1x


        const hit = p20 >= 0 && p21 <= 0 || p20 <= 0 && p21 >= 0

        if (hit) {
            const f = -p10 / (-d1x * d2y + d1y * d2x)
            const point = [
                d1x * f + line1[0][0],
                d1y * f + line1[0][1]
            ]
            return { hit, point }
        }
        return { hit }
    }
    return { hit: false }
}


function point_circle_intersect(p, circle) {
    const r = circle[1]
    const dx = circle[0][0] - p[0];
    if (dx < -r || dx > r) return { hit: false }
    const dy = circle[0][1] - p[1];
    if (dy < -r || dy > r) return { hit: false }
    const dd = dx * dx + dy * dy;
    const r2 = r * r
    const hit = dd <= r2;

    if (hit) {
        const dist = Math.sqrt(dd);
        const escapeFactor = circle[1] / dist - 1;
        const escape = [escapeFactor * dx, escapeFactor * dy];
        return { hit, dist, point: p, escape };
    }

    return { hit };
}


function line_circle_intersect(line, circle) {
    // line: [[x1, y1], [x2, y2]]
    // circle: [[x, y], r]
    const dx = line[1][0] - line[0][0];
    const dy = line[1][1] - line[0][1];

    const cx = circle[0][0];
    const cy = circle[0][1];
    const r = circle[1];

    const dx0 = cx - line[0][0];
    const dy0 = cy - line[0][1];

    const pd = dx0 * dx + dy0 * dy;

    if (pd >= 0) {

        const pdd = dx * dx + dy * dy;

        if (pd <= pdd) {
            const pn = dx0 * -dy + dy0 * dx;
            const hit = pn * pn < r * r * pdd;
            if (hit) {
                const n1_length = Math.sqrt(pdd);
                const dist = pn / n1_length;
                const f = pd / pdd;
                const px = line[0][0] + f * dx;
                const py = line[0][1] + f * dy;
                const point = [px, py];
                const escapeFactor = (r - Math.abs(dist)) / n1_length * Math.sign(dist);
                const escape = [escapeFactor * -dy, escapeFactor * dx];
                return { hit, dist, point, escape };
            }
        }
    }

    const intersect0 = point_circle_intersect(line[0], circle);
    if (intersect0.hit) return intersect0;

    return point_circle_intersect(line[1], circle);
}


function circle_circle_intersect(circle1, circle2) {
    // circle: [[x, y], r]
    const r_min = circle1[1] + circle2[1]
    const dx = circle1[0][0] - circle2[0][0]
    if (dx < -r_min || dx > r_min) return { hit: false }
    const dy = circle1[0][1] - circle2[0][1]
    if (dy < -r_min || dy > r_min) return { hit: false }
    const dd = dx * dx + dy * dy
    const hit = dd <= r_min * r_min
    if (hit) {
        const dist = Math.sqrt(dd)
        const f = 1 - r_min / dist
        const escape = [dx * f, dy * f]
        const point = [
            (circle1[0][0] * circle2[1] + circle2[0][0] * circle1[1]) / r_min,
            (circle1[0][1] * circle2[1] + circle2[0][1] * circle1[1]) / r_min,
        ]
        return { hit, dist, point, escape }
    }
    return { hit }
}

function drawline(ctx, line) {
    ctx.beginPath()
    ctx.moveTo(...line[0])
    ctx.lineTo(...line[1])
    ctx.stroke()
}

function drawcircle(ctx, circle) {
    ctx.beginPath()
    ctx.ellipse(...circle[0], circle[1], circle[1], 0, 0, Math.PI * 2)
    ctx.stroke()
}