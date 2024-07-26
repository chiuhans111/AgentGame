class Scoreboard {
    constructor(root) {
        this.div = document.createElement('div')
        this.div.style.display = 'flex'
        this.div.style.flexWrap = 'wrap'

        root.append(this.div)
        this.canvas_list = []
    }

    update(agents, agent_in_queue) {
        this.div.innerHTML = ''
        for (let i = 0; i < agents.length; i++) {
            const row = document.createElement('div')
            row.style.display = 'flex'
            row.style.width = '100px'

            const agent = agents[i]
            if (this.canvas_list.length <= i) {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                canvas.style.width = '40px'
                canvas.style.height = '40px'
                canvas.width = 40
                canvas.height = 40
                this.canvas_list.push([canvas, ctx])
            }
            const [canvas, ctx] = this.canvas_list[i]
            ctx.reset()
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.translate(canvas.width / 2 - agent.x, canvas.height / 2 - agent.y)

            if(agent_in_queue.includes(agent)){
                row.style.backgroundColor = '#ffffdd'
            }
            if (agent.game !== null && agent.game.agents !== null) {
                row.style.backgroundColor = '#ffddaa'
                agent.game.draw(canvas, ctx)
            }
            else agent.draw(canvas, ctx)
            row.append(canvas)

            const info = document.createElement('p')
            info.textContent = Math.round(agent.score)
            row.append(info)
            this.div.append(row)
        }
    }
}