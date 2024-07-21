class PlayerAgent extends Agent {
    constructor() {
        super(...arguments)
    }

    update() {
        let dx = 0
        let dy = 0
        if (keypressed['w']) dy -= 1
        if (keypressed['s']) dy += 1
        if (keypressed['a']) dx -= 1
        if (keypressed['d']) dx += 1
        super.move(dx, dy)
        if(mousepressed){
            super.fire(mousex-this.x, mousey-this.y)
        }
        super.update()
    }
}