import { defaultConfig } from "./config"
import { evolvePopulation } from "./evolve"
import { Genome, createEmptyGenome } from "./genome"
import { createHallOfFame } from "./halloffame"
import { createInnovationHistory } from "./history"
import { speciatePopulation } from "./species"

// Create the TinyNEAT method export
export default (config = defaultConfig) => {
	// Create a list to store the population in
	let population = Array(config.initialPopulationSize)

	// Create a list for storing species
	let species: Genome[][] = []

	// Create a list to store innovations (key is the pair of nodes)
	const innovationHistory = createInnovationHistory()

	// Create a hall of fame to track the best performing individuals
	const hallOfFame = createHallOfFame(config.hallOfFameSize)

	// Create the initial population of individuals
	for (let i = 0; i < config.initialPopulationSize; i++) {
		population[i] = createEmptyGenome(innovationHistory, config)
	}

	// Create helper methods for the population
	const getPopulation = () => population
	const getPopulationIndexed = () => population.entries()

	// Track the current generation
	let generation = 0

	// Create a method to check if the evolution is complete
	// TODO find some way to add custom stopping points
	const complete = () => generation >= config.maxGenerations

	const evolve = () => {
		// Update the hall of fame
		population.forEach((genome) => hallOfFame.tryAdding(genome))

		species = speciatePopulation(
			population,
			species,
			config.excessCoefficient,
			config.disjointCoefficient,
			config.weightDifferenceCoefficient,
			config.compatibilityThreshold
		)

		evolvePopulation(population, species, innovationHistory, config)
	}

	return {
		getPopulation,
		getPopulationIndexed,
		complete,
		evolve,
		getBestGenomes: hallOfFame.getBestGenomes,
	}
}

