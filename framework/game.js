class GameObject {
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(canvas, ctx) { }
    update() { }
    ray_cast() { return { hit: false, point: [0, 0] } }
    collide() { }
}


class Bullet extends GameObject {
    constructor(agent, x, y, dx, dy, damage) {
        super()
        this.x = x
        this.y = y
        this.dx = dx
        this.dy = dy
        this.agent = agent
        this.life = 40
        this.damage = damage
    }

    update() {
        this.x += this.dx
        this.y += this.dy
        this.life -= 1
    }

    geometry() {
        return [[this.x, this.y], [this.x + this.dx, this.y + this.dy]]
    }

    ray_cast(line) {
        return line_circle_intersect(line, this.geometry())
    }

    terminate() {
        this.life = 0
        this.damage = 0
    }

    draw(canvas, ctx) {
        drawline(ctx, this.geometry())
    }
}

class Weapon {
    constructor(agent) {
        this.agent = agent
        this.bullet_speed = 10
        this.cool_down_time = 5
        this.cool_down_timer = this.cool_down_time
        this.damage = 10

        this.ammo_full = 20
        this.ammo = this.ammo_full
        this.reload_time = 100
        this.reload_timer = 0
    }

    update() {
        if (this.cool_down_timer < this.cool_down_time)
            this.cool_down_timer += 1
        if (this.reload_time > 0)
            this.reload_timer -= 1

        if (this.ammo <= 0) {
            this.reload_timer = this.reload_time
            this.ammo = this.ammo_full
        }
    }

    fire(dx, dy) {
        if (this.cool_down_timer >= this.cool_down_time && this.reload_timer <= 0) {
            this.cool_down_timer = 0
            let d = Math.sqrt(dx * dx + dy * dy)
            dx = dx / d * this.bullet_speed
            dy = dy / d * this.bullet_speed
            this.ammo -= 1
            return new Bullet(this.agent, this.agent.x, this.agent.y, dx, dy, this.damage)
        } return false
    }
}

class Agent extends GameObject {
    constructor(game, x, y) {
        super()
        this.game = game
        this.x = x
        this.y = y
        this.life = 100
        this.size = 10
        this.score = 0
        this.weapon = new Weapon(this)
        this.moving_speed = 5
        this.index = 0
        this.color = [
            Math.random(),
            Math.random(),
            Math.random(),
        ]
    }

    initialize(game) {
        this.game = game
        this.life = 100
        this.weapon = new Weapon(this)
    }

    geometry() {
        return [[this.x, this.y], this.size]
    }

    ray_cast(line) {
        return line_circle_intersect(line, this.geometry())
    }

    fire(dx, dy) {
        const bullet = this.weapon.fire(dx, dy)
        if (bullet) this.game.bullets.push(bullet)
    }

    update() {
        this.weapon.update()

        // Score calculation
        // this.score += this.life / 100 * 0.01
    }

    collide(object, intersect) {
        if (object instanceof Bullet) {
            this.life -= object.damage

            // Score opponent
            object.agent.score += 1
            if (this.life <= 0) object.agent.score += this.score * 0.1

            object.terminate()
        } else if (object instanceof Wall) {
            this.x += intersect.escape[0]
            this.y += intersect.escape[1]
        } else if (object instanceof Agent) {
            this.x += intersect.escape[0] / 2
            this.y += intersect.escape[1] / 2
        }
    }
    /**
     * @param {HTMLCanvasElement} canvas 
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(canvas, ctx) {
        ctx.save()
        if (this.index == 0) {
            let circle = this.geometry()
            circle[1] *= 2
            drawcircle(ctx, circle)
        }
        ctx.lineWidth = this.life / 100 * 10
        drawcircle(ctx, this.geometry())
        // ctx.fillText(Math.floor(this.score), this.x, this.y)
        ctx.fillStyle = `rgb(${this.color[0] * 255}, ${this.color[1] * 255}, ${this.color[2] * 255})`
        ctx.fill()
        ctx.restore()

    }

    move(dx, dy) {
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d <= 1e-3) return
        dx = dx / d * this.moving_speed
        dy = dy / d * this.moving_speed
        this.x += dx
        this.y += dy
    }
}


class Wall extends GameObject {
    constructor(x1, y1, x2, y2) {
        super()
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
    }

    geometry() {
        return [[this.x1, this.y1], [this.x2, this.y2]]
    }

    ray_cast(line) {
        return line_intersect(line, this.geometry())
    }

    collide(object, intersect) {
        if (object instanceof Bullet) object.terminate()
    }
    draw(canvas, ctx) {
        drawline(ctx, this.geometry())
    }
}


class Game extends GameObject {
    constructor() {
        super()
        this.agents = []
        this.walls = []
        this.bullets = []
    }

    update() {
        this.agents = this.agents.filter(x => x.life > 0)
        this.bullets = this.bullets.filter(x => x.life > 0)

        this.agents.map(x => x.update())
        this.bullets.map(x => x.update())

        let collides = []
        for (let agent of this.agents) {
            for (let wall of this.walls) {
                let intersect = line_circle_intersect(
                    wall.geometry(),
                    agent.geometry()
                )
                if (intersect.hit) collides.push([agent, wall, intersect])
            }

            for (let agent2 of this.agents) {
                if (agent2 == agent) continue
                let intersect = circle_circle_intersect(
                    agent2.geometry(),
                    agent.geometry()
                )
                if (intersect.hit) collides.push([agent, agent2, intersect])
            }
        }

        for (let collide of collides) {
            collide[0].collide(collide[1], collide[2])
        }


        for (let bullet of this.bullets) {
            let hits = []
            for (let wall of this.walls) {
                let intersect = line_intersect(
                    wall.geometry(),
                    bullet.geometry()
                )
                if (intersect.hit) {
                    let dx = intersect.point[0] - bullet.geometry()[0][0]
                    let dy = intersect.point[1] - bullet.geometry()[0][1]
                    let dist = dx * dx + dy * dy
                    hits.push({ obj: wall, intersect, dist })
                }
            }
            for (let agent of this.agents) {
                if (bullet.agent == agent) continue
                let intersect = line_circle_intersect(
                    bullet.geometry(),
                    agent.geometry()
                )
                if (intersect.hit) {
                    let dx = intersect.point[0] - bullet.geometry()[0][0]
                    let dy = intersect.point[1] - bullet.geometry()[0][1]
                    let dist = dx * dx + dy * dy
                    hits.push({ obj: agent, intersect, dist })
                }
            }
            hits.sort((a, b) => a.dist - b.dist).map(x => {
                x.obj.collide(bullet)
            })
        }


    }
    /**
     * @param {HTMLCanvasElement } canvas 
     * @param {CanvasRenderingContext2D } ctx 
     */
    draw(canvas, ctx) {
        this.agents.map(x => x.draw(canvas, ctx))
        this.bullets.map(x => x.draw(canvas, ctx))
        this.walls.map(x => x.draw(canvas, ctx))
    }


    ray_cast(line) {
        let casts = []
        casts = casts.concat(
            this.agents.map(x => ({ obj: x, ...x.ray_cast(line) })),
            this.walls.map(x => ({ obj: x, ...x.ray_cast(line) })),
            // this.bullets.map(x => ({ obj: x, ...x.ray_cast(line) })),
        ).filter(x => x.hit)
        casts.map(x => {
            const dx = x.point[0] - line[0][0]
            const dy = x.point[1] - line[0][1]
            x.depth = Math.sqrt(dx * dx + dy * dy)
        })
        casts.sort(x => x.depth)
        return casts
    }
}


