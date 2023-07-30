import p5 from "./p5.js"
import { Car } from "./src/car"
import { SensorDisplay } from "./src/sensor_display"
import TinyNEAT from "../../dist/index.js"

let bg
let cars
let sensorDisplay
let w = 600
let h = 400
let training = false

const POPULATION_SIZE = 200
const MAX_STEPS = 300

const FRAME_RATE = 60

let step = 0

// TODO: Verify missing data in plugin specific config
const tn = TinyNEAT({maxGenerations: 100, initialPopulationSize: POPULATION_SIZE, ann: {inputSize: 16, outputSize: 1, weightMutationRange: 1.0}})

const MAP = "loop" // or "90s"

function preload(p) {
	bg = p.loadImage(`graphics/maps/${MAP}.jpg`)
}

function setup(p) {
	p.createCanvas(w, h)
	p.frameRate(FRAME_RATE)
	p.pixelDensity(1)
	// cars = [new Car(p, 50, 200, -90), new Car(p, 50, 250, -90)]

    // Create initial car population
    cars = Array.from(Array(POPULATION_SIZE), () => new Car(p, 50, 200, -90))

	sensorDisplay = new SensorDisplay(p, 20, 20)
}

function draw(p) {
	p.image(bg, 0, 0, w, h)

    p.loadPixels()

    if (++step % MAX_STEPS === 0) {
        step = 0

        tn.evolve()
        // Create new cars for the new population
        cars = Array.from(Array(tn.getPopulation().length), () => new Car(p, 50, 200, -90))

        console.log(`Best genomes of generation ${tn.getCurrentGeneration()}:`)

        const bestGenomes = tn.getBestGenomes()

        console.log(bestGenomes)

        console.log(`Best fitness: ${bestGenomes[0].fitness}`)
    }

    const population = tn.getPopulation()

    for (const [i, car] of cars.entries()) {
        car.move()
        car.sense()
        // car.stayInLane()
        const outputs = population[i].process(car.getInputs())

        population[i].fitness += car.receiveOutput(outputs[0])


        // Render every 20th car
        if (i % 20 === 0) {
            car.render()
        }
    }
	
	// Things to draw on top of the map and car
	sensorDisplay.showSensors(cars[0].sensors)

	p.textSize(16)
	p.fill(255)
	// p.text(`Generation: ${0}`, w - 130, 20)
	p.text(`FPS: ${Math.round(p.frameRate())}`, w - 130, 20)
	// textSize(15)
	// fill(255, 0, 0)
	// text("Speed: " + car.vel, w - 70, 20)

	// if (!training && !car.modelTrained) {
	// 	textSize(15)
	// 	fill(255, 0, 0)
	// 	text("AI Status: Gathering Data", w - 180, 40)
	// }

	// if (training && !car.modelTrained) {
	// 	textSize(15)
	// 	fill(255, 0, 0)
	// 	text("AI Status: Training", w - 130, 40)
	// }

	// if (training && car.modelTrained) {
	// 	textSize(15)
	// 	fill(255, 0, 0)
	// 	text("AI Status: Active", w - 112, 40)
	// }

	// if (
	// 	!training &&
	// 	frameCount % 30 == 0 &&
	// 	car.memory.mem.length == car.memory.memSize
	// ) {
		// training = true
		// car.initModel()
	// }
}

const sketch = (p) => {
	// Initialize the setup and draw methods
	p.setup = () => setup(p)
	p.draw = () => draw(p)
    p.preload = () => preload(p)
}

const P5 = new p5(sketch)
