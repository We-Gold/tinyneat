import p5 from "./p5.js"
import { Car } from "./src/car.js"
import { SensorDisplay } from "./src/sensor_display.js"
import { TinyNEAT, plugins } from "../../dist/index.js"

let bg
let cars
let sensorDisplay
let w = 600
let h = 400

const POPULATION_SIZE = 100
const MAX_STEPS = 400

const FRAME_RATE = 60

const INITIAL_ANGLE = -90

let step = 0
let shortCircuit = false

const tn = TinyNEAT({
	maxGenerations: 15,
	initialPopulationSize: POPULATION_SIZE,
	inputSize: 16,
	outputSize: 1,
	compatibilityThreshold: 4.5,
	addLinkProbability: 0.1,
	addNodeProbability: 0.2,
	mutateWeightProbability: 0.4,
	interspeciesMatingRate: 0.01,
	largeNetworkSize: 30,
	maximumStagnation: 5,
	nnPlugin: plugins.ANNPlugin({ activation: "posAndNegSigmoid" }),
})

const MAP = "90s" // "loop" or "90s"

function preload(p) {
	bg = p.loadImage(`graphics/maps/${MAP}.jpg`)
}

function setup(p) {
	p.createCanvas(w, h)
	p.frameRate(FRAME_RATE)
	p.pixelDensity(1)

	// Create initial car population
	cars = Array.from(
		Array(POPULATION_SIZE),
		() => new Car(p, 50, 200, INITIAL_ANGLE),
	)

	sensorDisplay = new SensorDisplay(p, 20, 20)
}

function draw(p) {
	p.image(bg, 0, 0, w, h)

	p.loadPixels()

	if (++step % MAX_STEPS === 0 || shortCircuit) {
		step = 0
		shortCircuit = false

		tn.evolve()

		// Create new cars for the new population
		cars = Array.from(
			Array(tn.getPopulation().length),
			() => new Car(p, 50, 200, INITIAL_ANGLE),
		)

		if (tn.complete()) p.noLoop()
	}

	const population = tn.getPopulation()

	let carsOffTrack = 0

	for (const [i, car] of cars.entries()) {
		// Skip any cars that leave the track fully
		if (car.isOffTrack()) {
			carsOffTrack++
			continue
		}

		car.move()
		car.sense()

		const outputs = population[i].process(car.getInputs())

		population[i].fitness += car.receiveOutput(outputs[0])

		car.render()
	}

	if (carsOffTrack === cars.length) shortCircuit = true

	// Things to draw on top of the map and car
	sensorDisplay.showSensors(cars[0].sensors)

	p.textSize(16)
	p.fill(255)
	p.text(`FPS: ${Math.round(p.frameRate())}`, w - 130, 20)
}

const sketch = p => {
	// Initialize the setup and draw methods
	p.setup = () => setup(p)
	p.draw = () => draw(p)
	p.preload = () => preload(p)
}

new p5(sketch)
