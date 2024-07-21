const width = 1000
const height = 500



let canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height

let ctx = canvas.getContext('2d')

document.body.append(canvas)

// let agent = new PlayerAgent(game, 50, 50)
// game.agents.push(agent)

const margin = 50

let AIAgents = []

for (let i = 0; i < 20; i++)
    AIAgents.push(new AIAgent(null, 0, 0))

function initialize_game() {
    const game = new Game()

    for (let i = 0; i < 4; i++)
        game.walls.push(new Wall(
            Math.random() * (width - margin * 2) + margin,
            Math.random() * (height - margin * 2) + margin,
            Math.random() * (width - margin * 2) + margin,
            Math.random() * (height - margin * 2) + margin,
        ))
    game.walls.push(new Wall(0, 0, width, 0))
    game.walls.push(new Wall(0, 0, 0, height))
    game.walls.push(new Wall(0, height, width, height))
    game.walls.push(new Wall(width, 0, width, height))

    let index = 0
    for (let agent of AIAgents) {
        agent.index = index
        agent.x = Math.random() * (width - margin * 2) + margin
        agent.y = Math.random() * (height - margin * 2) + margin
        agent.initialize(game)
        agent.score = 0
        game.agents.push(agent)
        index += 1
    }

    return game
}

let game = initialize_game()
let game_timer = 0
let game_time = 500
let SPEED_UP = 1
function main_loop() {
    requestAnimationFrame(main_loop)

    for (let iteration = 0; iteration < SPEED_UP; iteration++) {
        if (game_timer > game_time) {

            let total_amount = 20
            let keep_amount = 10
            let F = 0.95

            AIAgents = AIAgents.sort((a, b) => b.score - a.score).slice(0, keep_amount)
            console.log(AIAgents[0].score)
            // Evolution
            for (let i = 0; i < total_amount - keep_amount; i++) {

                let index = []
                for (let j = 0; j < keep_amount; j++) index.push(j)

                index = index.filter(x => x !== i)

                const a = index[Math.floor(Math.random() * index.length)]
                index = index.filter(x => x !== a)

                const b = index[Math.floor(Math.random() * index.length)]
                index = index.filter(x => x !== b)

                const c = index[Math.floor(Math.random() * index.length)]

                const A = AIAgents[a]
                const B = AIAgents[b]
                const C = AIAgents[c]

                let new_agent = new AIAgent(null, 0, 0)
                // let mutate_coefficients = add(A.coefficients, mul(F, sub(B.coefficients, C.coefficients)))
                let mutate_coefficients = add(
                    mul(0.5, C.coefficients),
                    mul(0.5, B.coefficients)
                )

                mutate_coefficients = add(
                    mul(0.5, A.coefficients),
                    mul(0.5, mutate_coefficients)
                )

                new_agent.coefficients = add(
                    mul(0.1, new_agent.coefficients),
                    mul(0.9, mutate_coefficients)
                )

                AIAgents.push(new_agent)
                // break
            }


            game = initialize_game()
            game_timer = 0
        }


        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.update()
        game_timer += 1
    }

    game.draw(canvas, ctx)
}

main_loop()

