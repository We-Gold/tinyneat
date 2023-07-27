import { defaultConfig } from "./config"
import { createEmptyGenome } from "./genome"
import { createInnovationHistory } from "./history"

// Create the TinyNEAT method export
export default (config = defaultConfig) => {
	// Create a list to store the population in
	let population = Array(config.populationSize)

	// Create a list to store innovations (key is the pair of nodes)
	const innovationHistory = createInnovationHistory()

	// Create the initial population of individuals
	for (let i = 0; i < config.populationSize; i++) {
		population[i] = createEmptyGenome(config, innovationHistory)
	}

	// Create helper methods for the population
	const getPopulation = () => population
	const getPopulationIndexed = () => population.entries()

	// Track the current generation
	let generation = 0

	// Create a method to check if the evolution is complete
	// TODO find some way to add custom stopping points
	const complete = () => generation >= config.maxGenerations

	return { getPopulation, getPopulationIndexed, complete }
}

