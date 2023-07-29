import {
	ANNConnectionGene,
	createAdjacencyList,
	mutateANNGeneWeight,
	topologicalSort,
} from "./ann"
import { Config } from "./config"
import {
	Genome,
	createGenomeFromGenes,
	crossGenomes,
	mutateAddConnection,
	mutateAddNode,
} from "./genome"
import { chooseRandom, random } from "./helpers"
import { InnovationHistory } from "./history"
import { speciatePopulation } from "./species"

export const evolvePopulation = (
	population: Genome[],
	species: Genome[][],
	innovationHistory: InnovationHistory,
	config: Config
) => {
	// TODO: Consider adding a minimum species size

	// Separate the current population into species
	speciatePopulation(
		population,
		species,
		config.excessCoefficient,
		config.disjointCoefficient,
		config.weightDifferenceCoefficient,
		config.compatibilityThreshold
	)

	// Adjust the fitness of each organism to normalize based on species size
	calculateAdjustedFitnesses(species)

	// Allocate the appropriate number of offspring for each species
	const offspringAllocation = allocateOffspring(population, species)

	// TODO: Consider adding the ability to turn off champions

	const nextPopulation = []

	for (const [i, s] of species.entries()) {
		// Sort the parents in descending order by fitness
		const sortedParents = s.sort(
			(a, b) => b.adjustedFitness - a.adjustedFitness // This currently assumes positive fitness is ideal
		)

		// Choose the top performing species individuals to become parents
		let viableParents = sortedParents.slice(
			0,
			Math.max(
				s.length * config.survivalThreshold,
				config.minimumSpeciesSize
			)
		)

		// Select the most fit member of the species to persist
		const champion = sortedParents[0]

		nextPopulation.push(champion)

		// Create the remaining offspring for the next generation
		for (
			let offspring = 0;
			offspring < offspringAllocation[i] - 1;
			offspring++
		) {
			const parent1 = chooseRandom(viableParents)
			const parent2 = chooseRandom(viableParents)

			let childGenes: ANNConnectionGene[]

			if (random(config.mateOnlyProbability)) {
				childGenes = crossGenomes(
					parent1,
					parent2,
					config.mateByChoosingProbability
				)
			} else {
				if (random(config.mutateOnlyProbability)) {
					// Only clone a parent, without crossover
					childGenes = structuredClone(parent1.genes)
				} else {
					childGenes = crossGenomes(
						parent1,
						parent2,
						config.mateByChoosingProbability
					)
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
						config.ann.inputSize,
						config.ann.outputSize
					)
				} else if (random(config.addNodeProbability)) {
					mutateAddNode(childGenes, innovationHistory, topoSorted)
				}

				// Randomly mutate weights
				for (const gene of childGenes) {
					if (random(config.mutateWeightProbability))
						mutateANNGeneWeight(
							gene,
							config.ann.weightMutationRange
						)
				}
			}

			nextPopulation.push(createGenomeFromGenes(childGenes, config))
		}
	}
}

const calculateAdjustedFitnesses = (species: Genome[][]) => {
	for (const s of species) {
		for (const genome of s) {
			genome.adjustedFitness = genome.fitness / s.length
		}
	}
}

const allocateOffspring = (population: Genome[], species: Genome[][]) => {
	// Calculate the average fitness of each species
	const speciesFitnessAverages = species.map((s) => {
		return s.reduce((acc, curr) => acc + curr.adjustedFitness, 0) / s.length
	})

	const totalAverageFitness = speciesFitnessAverages.reduce(
		(acc, curr) => acc + curr,
		0
	)

	// Calculate the proportion of the population to allocate to each species
	return speciesFitnessAverages.map((averageFitness) =>
		Math.round((averageFitness / totalAverageFitness) * population.length)
	)
}

