import { ANNConnectionGene, calculateGeneDistance, createNetwork } from "./ann"
import { Config } from "./config"
import { chooseRandom, random, uniformRandomWeight } from "./helpers"
import { Connection, InnovationHistory } from "./history"

export interface ConnectionGene {
	connection: Connection
	weight: number
	enabled: boolean
	innovationNumber: number
}

export interface Genome {
	genes: ConnectionGene[]
	fitness: number
	adjustedFitness: number
	process: (inputs: number[]) => number[]
}

// TODO make this specific to each network type through the plugin system
// Perhaps have a specific network creator object that is returned with the necessary details
export const createEmptyGenome = (
	innovationHistory: InnovationHistory,
	config: Config
) => {
	// Genes are indexed in the flattened form of: [inputs, outputs, hidden]
	const genes: ANNConnectionGene[] = []

	// Create a connection between every input and every output
	for (let i = 0; i < config.ann.inputSize; i++) {
		for (let o = 0; o < config.ann.outputSize; o++) {
			const connection: Connection = [i, config.ann.inputSize + o]
			const innovationNumber = innovationHistory.getInnovation(connection)

			genes.push({
				connection,
				weight: uniformRandomWeight(config.ann.weightMutationRange),
				enabled: true,
				innovationNumber,
			})
		}
	}

	return createGenomeFromGenes(genes, config)
}

export const createGenomeFromGenes = (
	genes: ANNConnectionGene[],
	config: Config
) => {
	// Validate the neural network size
	if (config.ann.inputSize < 1 || config.ann.outputSize < 1)
		throw new Error(
			"Invalid neural network input or output size. Verify that there are at least 1 of each."
		)

	const neuralNetwork = createNetwork(
		config.ann.inputSize,
		config.ann.outputSize,
		genes
	)

	return {
		genes,
		fitness: 0,
		adjustedFitness: 0,
		process: neuralNetwork.process,
	}
}

export const calculateGenomeDistance = (
	genome1: Genome,
	genome2: Genome,
	excessCoefficient: number,
	disjointCoefficient: number,
	weightDifferenceCoefficient: number
) => {
	// Make sure that genome 1 is the larger genome
	if (genome2.genes.length > genome1.genes.length) {
		;[genome1, genome2] = [genome2, genome1]
	}

	const genome1Length = genome1.genes.length
	const genome2Length = genome2.genes.length

	let excess = genome1Length - genome2Length
	let disjoint = 0
	let weightDelta = 0

	// Track the number of weights compared
	let weightsCompared = 0

	// Create pointers for the genes of each genome
	let g1 = 0
	let g2 = 0

	// Calculate the N factor for normalizing genome distance
	const largeGenomeThreshold = 20
	const N = genome1Length > largeGenomeThreshold ? genome1Length : 1

	while (g1 < genome1Length && g2 < genome2Length) {
		// Store weight delta when there are matching genes
		if (
			genome1.genes[g1].innovationNumber ===
			genome2.genes[g2].innovationNumber
		) {
			weightDelta += calculateGeneDistance(
				genome1.genes[g1++],
				genome1.genes[g2++]
			)
			weightsCompared++
		}
		// Count any disjoint genes
		else if (
			genome1.genes[g1].innovationNumber >
			genome2.genes[g2].innovationNumber
		) {
			disjoint++
			g2++
		} else if (
			genome1.genes[g1].innovationNumber <
			genome2.genes[g2].innovationNumber
		) {
			disjoint++
			g1++
		}
	}

	return (
		(excessCoefficient * excess) / N +
		(disjointCoefficient * disjoint) / N +
		weightDifferenceCoefficient * (weightDelta / weightsCompared)
	)
}

export const crossGenomes = (
	genome1: Genome,
	genome2: Genome,
	mateByChoosingProbability: number
	// mateByAveragingProbability: number
) => {
	// NOTE: Currently doesn't handle an equal fitness any differently
	/*
    Disjoint and excess genes are inherited from the more fit parent, or if they are equally fit, 
    each gene is inherited from either parent randomly. 
    Disabled genes have a chance of being reenabled during crossover,
    allowing networks to make use of older genes once again.
    */

	const equalFitness = genome2.adjustedFitness === genome1.adjustedFitness

	// Make sure that genome 1 is the fitter genome
	if (genome2.adjustedFitness > genome1.adjustedFitness) {
		;[genome1, genome2] = [genome2, genome1]
	}

	const genome1Length = genome1.genes.length
	const genome2Length = genome2.genes.length

	const newGenes: ANNConnectionGene[] = []

	// Create pointers for each of the genomes
	let g1 = 0
	let g2 = 0

	while (g1 < genome1Length) {
		const gene1 = genome1.genes[g1]
		const gene2 = genome2.genes[g2]

		// Handle any excess genes
		if (g2 >= genome2Length) {
			newGenes.push({ ...gene1 })
			g1++
		}
		// Store weight delta when there are matching genes
		else if (gene1.innovationNumber === gene2.innovationNumber) {
			if (random(mateByChoosingProbability)) {
				// Choose one of the genes to add to the new genome
				newGenes.push({
					...(Math.random() < 0.5 ? gene1 : gene2),
				})
			} else {
				const averageWeight = (gene1.weight + gene2.weight) / 2

				// Add the averaged connection to the new genome
				newGenes.push({
					...gene1,
					weight: averageWeight,
				})
			}

			g1++
			g2++
		}
		// Directly insert any disjoint connections from the fitter genome
		else if (gene1.innovationNumber > gene2.innovationNumber) {
			newGenes.push({ ...gene1 })
			g2++
		} else if (gene1.innovationNumber < gene2.innovationNumber) {
			if (equalFitness) newGenes.push({ ...gene2 })
			g1++
		}
	}

	return newGenes
}

export const mutateAddConnection = (
	genes: ANNConnectionGene[],
	innovationHistory: InnovationHistory,
	topoSorted: number[],
	inputSize: number,
	outputSize: number
) => {
	// Create a list of indices corresponding to topoSorted
	const topoSortedIndices = Array.from(
		{ length: topoSorted.length },
		(_, i) => i
	)

	// Make sure that the input is not an output node
	const potentialInputIndices = topoSortedIndices.slice()
	potentialInputIndices.splice(inputSize, outputSize)

	const inputIndex = topoSorted[chooseRandom(potentialInputIndices)]

	// Make sure that the output is not an input node
	const potentialOutputIndices = topoSortedIndices.slice(
		Math.max(inputIndex + 1, inputSize)
	)

	// Choose an output index that comes after the input
	const outputIndex = topoSorted[chooseRandom(potentialOutputIndices)]

	const existingConnection = genes.find(
		(gene) =>
			gene.connection[0] === inputIndex &&
			gene.connection[1] === outputIndex
	)

	// Enable the connection if it already exists
	if (existingConnection !== undefined) {
		existingConnection.enabled = true
		return
	}

	const connection: Connection = [inputIndex, outputIndex]

	const innovationNumber = innovationHistory.getInnovation(connection)

	genes.push({
		connection,
		weight: 1.0,
		enabled: true,
		innovationNumber,
	})
}

export const mutateAddNode = (
	genes: ANNConnectionGene[],
	innovationHistory: InnovationHistory,
	topoSorted: number[]
) => {
	const connectionGene: ANNConnectionGene = chooseRandom(genes)

	// Disable the current connection
	connectionGene.enabled = false

	// TODO: Handle crossover that leaves only a disabled node

	// Determine the index/id of the new node
	const newNodeId = topoSorted.length

	const inputConnection: Connection = [
		connectionGene.connection[0],
		newNodeId,
	]
	const outputConnection: Connection = [
		newNodeId,
		connectionGene.connection[1],
	]

	genes.push({
		connection: inputConnection,
		weight: 1.0,
		enabled: true,
		innovationNumber: innovationHistory.getInnovation(inputConnection),
	})

	genes.push({
		connection: outputConnection,
		weight: connectionGene.weight,
		enabled: true,
		innovationNumber: innovationHistory.getInnovation(outputConnection),
	})
}

