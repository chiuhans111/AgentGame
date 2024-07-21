const width = 1000
const height = 500



let canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height

let ctx = canvas.getContext('2d')

document.body.append(canvas)



const margin = 50

let AIAgents = []

let total_amount = 10
let keep_amount = 5
let F = 0.5
let CR = 0.5

for (let i = 0; i < total_amount; i++)
    AIAgents.push(new AIAgent(null, 0, 0))

function initialize_game() {
    const game = new Game()

    // let agent = new PlayerAgent(game, 50, 50)
    // game.agents.push(agent)

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
        game.agents.push(agent)
        index += 1
    }

    return game
}
let game = initialize_game()
let game_timer = 0
let game_time = 200
let speed_up = 1
let round = 0
let total_round = 10

function main_loop() {
    requestAnimationFrame(main_loop)

    for (let iteration = 0; iteration < speed_up; iteration++) {

        if (game_timer > game_time) {
            round += 1
            if (round >= total_round) {
                round = 0


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

                    const I = AIAgents[i]
                    const A = AIAgents[a]
                    const B = AIAgents[b]
                    const C = AIAgents[c]

                    let new_agent = new AIAgent(null, 0, 0)

                    let mutation = sub(
                        add(A.coefficients, mul(F, sub(B.coefficients, C.coefficients))),
                        I.coefficients
                    ).map(coeff => coeff.map(row => row.map(value => {
                        if (Math.random() < CR) return value
                        return 0
                    })))


                    // let mutate_coefficients = add(
                    //     mul(0.5, C.coefficients),
                    //     mul(0.5, B.coefficients)
                    // )

                    // mutate_coefficients = add(
                    //     mul(0.5, A.coefficients),
                    //     mul(0.5, mutate_coefficients)
                    // )

                    new_agent.coefficients = add(
                        mul(0.05, new_agent.coefficients),
                        mul(0.95, add(I.coefficients, mutation))
                    )

                    AIAgents.push(new_agent)
                    // break
                }

                for (let agent of AIAgents) {
                    agent.score = 0
                }
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

