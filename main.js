const width = 1000
const height = 500


let canvas = document.createElement('canvas')
canvas.width = width
canvas.height = height

let ctx = canvas.getContext('2d')

document.body.append(canvas)



const margin = 50

// Game mechanism
let player_per_match = 10

let game_timer = 0
let game_time = 500

let round = 0
let total_round = 3

let AIAgents = []

let game = null

// Game Queue
let agent_in_queue = []

// Evolution
let total_amount = 40
let keep_amount = 20
let F = 0.5
let CR = 0.5


// Visualizatino
let high_score_history = []
const history_plot = new Plot(300, 150, document.body)
const scoreboard = new Scoreboard(document.body)
// Other setting
let speed_up = 1


function first_initialization() {
    for (let i = 0; i < total_amount; i++)
        AIAgents.push(new AIAgent(null, 0, 0))
    // initialize_new_epoch()
    initialize_round()
    initialize_game()
}

function initialize_round() {
    round += 1
    agent_in_queue = []
    for (let agent of AIAgents) agent_in_queue.push(agent)
}


function initialize_game() {
    if (game !== null) {
        game.dispose()
        game = null
    }
    game = new Game()
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

    const agent_queued = []

    for (let i = 0; i < player_per_match; i++) {
        const len = agent_in_queue.length
        if (len > 0) {
            const random_index = Math.floor(Math.random() * len)
            agent_queued.push(agent_in_queue[random_index])
            agent_in_queue.splice(random_index, 1)
        } else {
            let agent = new AIAgent(null, 0, 0)
            const random_index = Math.floor(Math.random() * AIAgents.length)
            agent.coefficients = AIAgents[random_index].coefficients
            agent_queued.push(agent)
        }
    }

    for (let agent of agent_queued) {
        agent.x = Math.random() * (width - margin * 2) + margin
        agent.y = Math.random() * (height - margin * 2) + margin
        agent.initialize(game)
        game.agents.push(agent)
        index += 1
    }

    game_timer = 0

}


function do_mutation() {

    AIAgents = AIAgents.sort((a, b) => b.score - a.score)
    AIAgents.splice(keep_amount, AIAgents.length - keep_amount).map(x => x.dispose())

    high_score_history.push(AIAgents[0].score)

    AIAgents.map((x, i) => x.index = i)
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
}

function initialize_new_epoch() {
    round = 0
    do_mutation()
    for (let agent of AIAgents) {
        agent.score = 0
    }
}


function is_round_finished() {
    return agent_in_queue.length == 0
}

function is_epoch_finished() {
    return round > total_round
}

function is_game_finished() {
    return game_timer > game_time
}



function main_loop() {
    setTimeout(() => {
        main_loop()
    }, 1000 / 50);

    for (let iteration = 0; iteration < speed_up; iteration++) {

        if (is_game_finished()) {

            if (is_round_finished()) {

                if (is_epoch_finished())
                    initialize_new_epoch()

                initialize_round()
            }

            initialize_game()
        }

        game.update()
        game_timer += 1
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    game.draw(canvas, ctx)
    high_score_history = history_plot.plot1d(high_score_history)
    scoreboard.update(AIAgents, agent_in_queue)
}

first_initialization()
main_loop()

