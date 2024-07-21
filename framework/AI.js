class AIAgent extends Agent {
    constructor() {
        super(...arguments)
        this.facing = 0
        this.sees = null
        this.FOV = 60 / 360
        this.RAY_SAMPLES = 16
        this.VIEW_DISTANCE = 300
        this.FEED_BACK_SIZE = 5
        this.KERNAL_SIZE = 6
        this.feed_back_signal = []

        this.coefficients = []

        this.ai_initiate()
    }

    update() {

        const see_agent = []
        const see_wall = []
        // const see_bullet = []

        for (let i = 0; i < this.RAY_SAMPLES; i++) {

            const f = i / (this.RAY_SAMPLES - 1) - 0.5
            const angle = f * Math.PI * 2 * this.FOV + this.facing

            const dx = this.VIEW_DISTANCE * Math.cos(angle)
            const dy = this.VIEW_DISTANCE * Math.sin(angle)
            const casts = this.game.ray_cast([
                [this.x, this.y],
                [this.x + dx, this.y + dy]])

            let agent = 0
            let wall = 0
            let bullet = 0

            for (let cast of casts) {
                if (cast.obj !== this) {
                    if (cast.obj instanceof Agent) {
                        agent += 1 - cast.depth / this.VIEW_DISTANCE
                    } else if (cast.obj instanceof Wall) {
                        wall = 1 - cast.depth / this.VIEW_DISTANCE
                        // wall = cast.depth / this.VIEW_DISTANCE
                        break // could not see through wall
                    }
                    // else if (cast.obj instanceof Bullet) {
                    //     bullet += 1 - cast.depth / this.VIEW_DISTANCE
                    // }
                }
            }


            see_agent[i] = agent
            see_wall[i] = wall
            // see_bullet.push(bullet)
        }

        this.sees = {
            see_agent,
            see_wall,
            // see_bullet 
        }


        this.human_control()
        this.ai_control()

        super.update()
    }


    human_control() {
        let dx = 0
        let dy = 0
        if (keypressed['w']) dy -= 1
        if (keypressed['s']) dy += 1
        if (keypressed['a']) dx -= 1
        if (keypressed['d']) dx += 1
        super.move(dx, dy)
        if (mousepressed) {
            super.fire(mousex - this.x, mousey - this.y)
        }
    }

    random_weight(w, h, min, max) {
        const weights = []
        for (let i = 0; i < h; i++) {
            const row = []
            for (let j = 0; j < w; j++) {
                row.push(Math.random() * (max - min) + min)
            }
            weights.push(row)
        }
        return weights
    }


    ai_initiate() {
        this.feed_back_signal = []
        for (let i = 0; i < this.FEED_BACK_SIZE; i++)
            this.feed_back_signal.push(0)

        this.coefficients = []
        this.coefficients.push(this.random_weight(
            this.RAY_SAMPLES * 2 + 1 + this.FEED_BACK_SIZE,
            this.KERNAL_SIZE,
            -1, 1
        ))
        this.coefficients.push(this.random_weight(
            this.KERNAL_SIZE,
            1,
            -1, 1
        ))
        this.coefficients.push(this.random_weight(
            this.KERNAL_SIZE,
            4 + this.FEED_BACK_SIZE, // foward/backward, side to side, rotate, fire,
            -1, 1
        ))
    }


    ai_control() {
        const input = [
            ...this.sees.see_agent,
            // ...this.sees.see_bullet,
            ...this.sees.see_wall,
            this.life / 100,
            ...this.feed_back_signal
        ]
        const layer1 = mat_mul(this.coefficients[0], input)
        const bias = layer1.map((x, i) => x + this.coefficients[1][0][i])
        const activate = bias.map(x => {
            if (x < 0) return 0
            return x
        })
        const output = mat_mul(
            this.coefficients[2],
            activate
        )

        const fdx = Math.cos(this.facing)
        const fdy = Math.sin(this.facing)

        const mdx = fdx * output[0] - fdy * output[1]
        const mdy = fdy * output[0] + fdx * output[1]

        const dr = output[2] * 0.1

        const fire = output[3] > 0

        // perform

        this.move(mdx, mdy)
        this.facing = (this.facing + dr) % (Math.PI * 2)
        if (fire) this.fire(fdx, fdy)


    }

    /**
    * @param {HTMLCanvasElement } canvas 
    * @param {CanvasRenderingContext2D } ctx 
    */
    draw(canvas, ctx) {
        // ctx.save()
        // if (this.sees) {
        //     ctx.beginPath()
        //     ctx.moveTo(this.x, this.y)

        //     for (let i = 0; i < this.RAY_SAMPLES; i++) {
        //         const f = i / (this.RAY_SAMPLES - 1) - 0.5
        //         const angle = f * Math.PI * 2 * this.FOV + this.facing
        //         const f2 = (1 - this.sees.see_wall[i])
        //         const dx = this.VIEW_DISTANCE * Math.cos(angle) * f2
        //         const dy = this.VIEW_DISTANCE * Math.sin(angle) * f2
        //         ctx.lineTo(dx + this.x, dy + this.y)
        //     }
        //     ctx.closePath()
        //     ctx.fillStyle = 'rgba(255, 128, 0, 0.1)'
        //     ctx.fill()
        // }
        // ctx.restore()
        super.draw(canvas, ctx)
    }
}