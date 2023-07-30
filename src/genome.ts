// import {
// 	averageGenes,
// 	calculateGeneDistance,
// 	cloneGene,
// 	configureCloneGene,
// 	configureNewGene,
// 	configureRandomGene,
// 	createNetwork,
// } from "./nn/ann"
import { Config } from "./config"
import { chooseRandom, random } from "./helpers"
import { Connection, InnovationHistory } from "./history"

export interface ConnectionGene {
	connection: Connection
	enabled: boolean
	innovationNumber: number
}

export interface Genome {
	genes: ConnectionGene[]
	fitness: number
	adjustedFitness: number
	process: (inputs: number[]) => number[]
}

export const createEmptyGenome = (
	innovationHistory: InnovationHistory,
	config: Config
) => {
	// Genes are indexed in the flattened form of: [inputs, outputs, hidden]
	const genes: ConnectionGene[] = []

	// Create a connection between every input and every output
	for (let i = 0; i < config.inputSize; i++) {
		for (let o = 0; o < config.outputSize; o++) {
			const connection: Connection = [i, config.inputSize + o]
			const innovationNumber = innovationHistory.getInnovation(connection)

			genes.push(
				config.nnPlugin.configureRandomGene({
					connection,
					enabled: true,
					innovationNumber,
				}) as ConnectionGene
			)
		}
	}

	return createGenomeFromGenes(genes, config)
}

export const createGenomeFromGenes = (
	genes: ConnectionGene[],
	config: Config
) => {
	// Validate the neural network size
	if (config.inputSize < 1 || config.outputSize < 1)
		throw new Error(
			"Invalid neural network input or output size. Verify that there are at least 1 of each."
		)

	const neuralNetwork = config.nnPlugin.createNetwork(
		config.inputSize,
		config.outputSize,
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
	weightDifferenceCoefficient: number,
	config: Config
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
			weightDelta += config.nnPlugin.calculateGeneDistance(
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
	config: Config
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

	const newGenes: ConnectionGene[] = []

	// Create pointers for each of the genomes
	let g1 = 0
	let g2 = 0

	while (g1 < genome1Length) {
		const gene1 = genome1.genes[g1]
		const gene2 = genome2.genes[g2]

		// Handle any excess genes
		if (g2 >= genome2Length) {
			newGenes.push(config.nnPlugin.cloneGene(gene1) as ConnectionGene)
			g1++
		}
		// Store weight delta when there are matching genes
		else if (gene1.innovationNumber === gene2.innovationNumber) {
			if (random(config.mateByChoosingProbability)) {
				// Choose one of the genes to add to the new genome
				newGenes.push(
					config.nnPlugin.cloneGene(
						Math.random() < 0.5 ? gene1 : gene2
					) as ConnectionGene
				)
			} else {
				// Add the averaged connection to the new genome
				newGenes.push(
					config.nnPlugin.averageGenes(gene1, gene2) as ConnectionGene
				)
			}

			g1++
			g2++
		}
		// Directly insert any disjoint connections from the fitter genome
		else if (gene1.innovationNumber > gene2.innovationNumber) {
			newGenes.push(config.nnPlugin.cloneGene(gene1) as ConnectionGene)
			g2++
		} else if (gene1.innovationNumber < gene2.innovationNumber) {
			if (equalFitness)
				newGenes.push(
					config.nnPlugin.cloneGene(gene2) as ConnectionGene
				)
			g1++
		}
	}

	return newGenes
}

export const mutateAddConnection = (
	genes: ConnectionGene[],
	innovationHistory: InnovationHistory,
	topoSorted: number[],
	inputSize: number,
	outputSize: number,
	config: Config
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

	genes.push(
		config.nnPlugin.configureNewGene({
			connection,
			enabled: true,
			innovationNumber,
		}) as ConnectionGene
	)
}

export const mutateAddNode = (
	genes: ConnectionGene[],
	innovationHistory: InnovationHistory,
	topoSorted: number[],
	config: Config
) => {
	const connectionGene: ConnectionGene = chooseRandom(genes)

	// Disable the current connection
	connectionGene.enabled = false

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

	genes.push(
		config.nnPlugin.configureNewGene({
			connection: inputConnection,
			enabled: true,
			innovationNumber: innovationHistory.getInnovation(inputConnection),
		}) as ConnectionGene
	)

	genes.push(
		config.nnPlugin.configureCloneGene(
			{
				connection: outputConnection,
				enabled: true,
				innovationNumber:
					innovationHistory.getInnovation(outputConnection),
			},
			connectionGene
		) as ConnectionGene
	)
}

