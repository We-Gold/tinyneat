import { Config, PartialConfig, defaultConfig } from "./config"
import { evolvePopulation } from "./evolve"
import { Genome, createEmptyGenome } from "./genome"
import { createHallOfFame } from "./halloffame"
import { createInnovationHistory } from "./history"
import * as plugins from "./plugins"

/**
 * Creates a NEAT interface using the given configuration.
 *
 * Change only the parts that need to be configured,
 * the rest will be filled in from the default configuration.
 */
const TinyNEAT = (partialConfig: PartialConfig = {}) => {
	// Fill in any missing details from the config using defaults
	const config: Config = { ...defaultConfig, ...partialConfig }

	// Create the logging manager to handle all logging plugins
	const loggingManger = plugins.LoggingManager(config.loggingPlugins)

	// Create a list to store the population in
	let population: Genome[] = Array(config.initialPopulationSize)

	// Create a list for storing species
	const species: Genome[][] = []

	// Create a list to store innovations (key is the pair of nodes)
	const innovationHistory = createInnovationHistory()

	// Create a hall of fame to track the best performing individuals
	const hallOfFame = createHallOfFame(config.hallOfFameSize)

	// Create the initial population of individuals
	for (let i = 0; i < config.initialPopulationSize; i++) {
		population[i] = createEmptyGenome(innovationHistory, config)
	}

	// Dispatch the initial population event
	loggingManger.handleInitialPopulation?.({ population, config })

	// Create helper methods for the population
	const getPopulation = () => population
	const getPopulationIndexed = () => population.entries()

	// Track the current generation
	let generation = 0

	const getCurrentGeneration = () => generation

	// Create a method to check if the evolution is complete
	// TODO find some way to add custom stopping points
	const complete = () => generation >= config.maxGenerations

	const evolve = () => {
		// Modify the fitness depending on the fitness strategy
		switch (config.fitnessSort) {
			case "max":
				break
			case "min":
				population.forEach(genome => (genome.fitness *= -1))
		}

		// Update the hall of fame
		population.forEach(genome => hallOfFame.tryAdding(genome))

		population = evolvePopulation(
			population,
			species,
			innovationHistory,
			config,
		)

		generation++

		// Dispatch the evolve event
		loggingManger.handleEvolve?.({
			population,
			config,
			generation,
			species,
			bestGenomes: hallOfFame.getBestGenomes(),
			complete: complete(),
		})
	}

	return {
		getPopulation,
		getPopulationIndexed,
		getCurrentGeneration,
		complete,
		evolve,
		getBestGenomes: hallOfFame.getBestGenomes,
	}
}

export { TinyNEAT, plugins }
