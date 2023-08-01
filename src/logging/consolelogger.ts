import { EvolveData, InitialPopulationData, Logger } from "./loggingmanager"

/**
 * Creates a basic logger that reports the current generation and maximum fitness,
 * along with a simple report at the end of evolution.
 */
const ConsoleLogger = (): Logger => {
	const handleInitialPopulation = (data: InitialPopulationData) => {
		console.log(`Beginning NEAT`)
		console.log(`______________`)
		console.log(
			`Initial Population Size: ${data.config.initialPopulationSize}`
		)
		console.log(`Complete Config: `)
		console.log(data.config)
		console.log(``)
	}

	const handleEvolve = (data: EvolveData) => {
		if (data.complete)
			console.log(`NEAT completed at generation ${data.generation}:`)
		else console.log(`Results of generation ${data.generation}:`)

		console.log(`Population Size: ${data.population.length}`)
		console.log(`Number of Species: ${data.species.length}`)
		console.log(`Max Fitness: ${data.bestGenomes?.[0].fitness}`)

		if (data.complete) {
			console.log(`Best Genomes: `)
			console.log(data.bestGenomes)
		}

		console.log(``)
	}

	return { handleInitialPopulation, handleEvolve }
}

export default ConsoleLogger

