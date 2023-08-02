import { Config } from "./config"
import {
	ConnectionGene,
	Genome,
	createGenomeFromGenes,
	crossGenomes,
	mutateAddConnection,
	mutateAddNode,
} from "./genome"
import { chooseRandom, random } from "./helpers"
import { InnovationHistory } from "./history"
import { createAdjacencyList, topologicalSort } from "./nn/nnplugin"
import { speciatePopulation } from "./species"

export const evolvePopulation = (
	population: Genome[],
	species: Genome[][],
	innovationHistory: InnovationHistory,
	config: Config,
) => {
	// Separate the current population into species
	speciatePopulation(population, species, config)

	// Adjust the compatibility threshold based on the number of species
	adjustCompatibilityThreshold(species, config)

	// Adjust the fitness of each organism to normalize based on species size
	calculateAdjustedFitnesses(species)

	// Allocate the appropriate number of offspring for each species
	const offspringAllocation = allocateOffspring(population, species)

	const nextPopulation = []

	for (const [i, s] of species.entries()) {
		// Sort the parents in descending order by fitness
		const sortedParents = s.sort(
			(a, b) => b.adjustedFitness - a.adjustedFitness, // This currently assumes positive fitness is ideal
		)

		// Choose the top performing species individuals to become parents
		const viableParents = sortedParents.slice(
			0,
			Math.max(
				s.length * config.survivalThreshold,
				config.minimumSpeciesSize,
			),
		)

		// Select the most fit member of the species to persist
		const champion = sortedParents[0]

		nextPopulation.push(
			createGenomeFromGenes(
				structuredClone(champion.genes),
				champion.maxGeneIndex,
				config,
			),
		)

		// Create the remaining offspring for the next generation
		for (
			let offspring = 0;
			offspring <
			Math.max(offspringAllocation[i] - 1, config.minimumSpeciesSize);
			offspring++
		) {
			const parent1: Genome = chooseRandom(viableParents)
			let parent2: Genome = chooseRandom(viableParents)

			// In rare cases, allow interspecies crossover
			if (random(config.interspeciesMatingRate)) {
				parent2 = chooseRandom(chooseRandom(species))
			}

			let childGenes: ConnectionGene[]

			let maxGeneIndex: number

			if (random(config.mateOnlyProbability)) {
				const result = crossGenomes(parent1, parent2, config)
				childGenes = result.newGenes
				maxGeneIndex = result.maxGeneIndex
			} else {
				if (random(config.mutateOnlyProbability)) {
					// Only clone a parent, without crossover
					childGenes = structuredClone(parent1.genes)
					maxGeneIndex = parent1.maxGeneIndex
				} else {
					const result = crossGenomes(parent1, parent2, config)
					childGenes = result.newGenes
					maxGeneIndex = result.maxGeneIndex
				}

				// Create an adjacency list for storing connections in a
				// more useful format
				const { inputToOutput, outputToInput } =
					createAdjacencyList(childGenes)

				// Sort the graph to effectively linearize it
				const topoSorted = topologicalSort(inputToOutput, outputToInput)

				// Randomly mutate genome (add connection)
				if (random(config.addLinkProbability)) {
					mutateAddConnection(
						childGenes,
						innovationHistory,
						topoSorted,
						maxGeneIndex,
						config.inputSize,
						config.outputSize,
						config,
					)
				} else if (random(config.addNodeProbability)) {
					// Adds a new node, so update the gene counter
					maxGeneIndex = mutateAddNode(
						childGenes,
						innovationHistory,
						maxGeneIndex,
						config,
					)
				}

				// Randomly mutate weights
				for (const gene of childGenes) {
					if (random(config.mutateWeightProbability))
						config.nnPlugin.mutateGeneWeight(gene)
				}
			}

			nextPopulation.push(
				createGenomeFromGenes(childGenes, maxGeneIndex, config),
			)
		}
	}

	return nextPopulation
}

const calculateAdjustedFitnesses = (species: Genome[][]) => {
	// Normalize the fitness of each species by the species size
	for (const s of species) {
		for (const genome of s) {
			genome.adjustedFitness = genome.fitness / s.length
		}
	}
}

const allocateOffspring = (population: Genome[], species: Genome[][]) => {
	// Calculate the average fitness of each species
	const speciesFitnessAverages = species.map(s => {
		return s.reduce((acc, curr) => acc + curr.adjustedFitness, 0) / s.length
	})

	// Sum all of the species average fitnesses
	const totalAverageFitness = speciesFitnessAverages.reduce(
		(acc, curr) => acc + curr,
		0,
	)

	// Calculate the proportion of the population to allocate to each species
	return speciesFitnessAverages.map(averageFitness =>
		Math.round((averageFitness / totalAverageFitness) * population.length),
	)
}

const adjustCompatibilityThreshold = (species: Genome[][], config: Config) => {
	// Modify the compatibility threshold to dynamically control the number of species
	if (species.length < config.targetSpecies) {
		config.compatibilityThreshold -= config.compatibilityModifier
	} else if (species.length > config.targetSpecies) {
		config.compatibilityThreshold += config.compatibilityModifier
	}

	// Prevent the compatibility threshold from getting too small
	if (config.compatibilityThreshold < config.compatibilityModifier)
		config.compatibilityThreshold = config.compatibilityModifier
}
