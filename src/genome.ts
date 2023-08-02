import { Config } from "./config"
import { chooseRandom, random } from "./helpers"
import { Connection, InnovationHistory } from "./history"

/**
 * Represents a connection between two node genes.
 * Extend this type to encode weight, recurrence, etc,
 * whatever is appropriate for the neural network plugin.
 */
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
	maxGeneIndex: number // Tracks the current highest node gene index
}

export const createEmptyGenome = (
	innovationHistory: InnovationHistory,
	config: Config,
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
				}) as ConnectionGene,
			)
		}
	}

	// Store the highest node gene index in the current genome
	const maxGeneIndex = config.inputSize + config.outputSize - 1

	return createGenomeFromGenes(genes, maxGeneIndex, config)
}

export const createGenomeFromGenes = (
	genes: ConnectionGene[],
	maxGeneIndex: number,
	config: Config,
) => {
	// Validate the neural network size
	if (config.inputSize < 1 || config.outputSize < 1)
		throw new Error(
			"Invalid neural network input or output size. Verify that there are at least 1 of each.",
		)

	const neuralNetwork = config.nnPlugin.createNetwork(
		config.inputSize,
		config.outputSize,
		genes,
	)

	return {
		genes,
		fitness: 0,
		adjustedFitness: 0,
		process: neuralNetwork.process,
		maxGeneIndex,
	}
}

export const calculateGenomeDistance = (
	genome1: Genome,
	genome2: Genome,
	config: Config,
) => {
	// Make sure that genome 1 is the larger genome
	if (genome2.genes.length > genome1.genes.length) {
		;[genome1, genome2] = [genome2, genome1]
	}

	const genome1Length = genome1.genes.length
	const genome2Length = genome2.genes.length

	// Create trackers for each of the factors in genome distance
	const excess = genome1Length - genome2Length
	let disjoint = 0
	let weightDelta = 0

	// Track the number of weights compared
	let weightsCompared = 0

	// Create pointers for the genes of each genome
	let g1 = 0
	let g2 = 0

	// Calculate the N factor for normalizing genome distance
	const N = genome1Length > config.largeNetworkSize ? genome1Length : 1

	while (g1 < genome1Length && g2 < genome2Length) {
		// Store weight delta when there are matching genes
		if (
			genome1.genes[g1].innovationNumber ===
			genome2.genes[g2].innovationNumber
		) {
			weightDelta += config.nnPlugin.calculateGeneDistance(
				genome1.genes[g1++],
				genome1.genes[g2++],
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
		(config.excessCoefficient * excess) / N +
		(config.disjointCoefficient * disjoint) / N +
		config.weightDifferenceCoefficient * (weightDelta / weightsCompared)
	)
}

/**
 * Disjoint and excess genes are inherited from the more fit parent, or if they are equally fit,
 * each gene is inherited from either parent randomly.
 * Disabled genes have a chance of being reenabled during crossover,
 * allowing networks to make use of older genes once again.
 */
export const crossGenomes = (
	genome1: Genome,
	genome2: Genome,
	config: Config,
) => {
	const equalFitness = genome2.adjustedFitness === genome1.adjustedFitness

	// Make sure that genome 1 is the fitter genome
	if (genome2.adjustedFitness > genome1.adjustedFitness) {
		;[genome1, genome2] = [genome2, genome1]
	}

	// Determine which gene index the child genome will inherit
	const maxGeneIndex = equalFitness
		? Math.max(genome1.maxGeneIndex, genome2.maxGeneIndex)
		: genome1.maxGeneIndex

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
			const newGene = config.nnPlugin.cloneGene(gene1) as ConnectionGene

			// Reenable a potentially disabled gene
			if (random(config.reenableConnectionProbability))
				newGene.enabled = true

			newGenes.push()
			g1++
		}
		// Store weight delta when there are matching genes
		else if (gene1.innovationNumber === gene2.innovationNumber) {
			// Store the crossed over gene
			let newGene

			if (random(config.mateByChoosingProbability)) {
				// Choose one of the genes to add to the new genome
				newGene = config.nnPlugin.cloneGene(
					Math.random() < 0.5 ? gene1 : gene2,
				) as ConnectionGene
			} else {
				// Add the averaged connection to the new genome
				newGene = config.nnPlugin.averageGenes(
					gene1,
					gene2,
				) as ConnectionGene
			}

			// Reenable a potentially disabled gene
			if (random(config.reenableConnectionProbability))
				newGene.enabled = true

			newGenes.push(newGene)

			g1++
			g2++
		}
		// Directly insert any disjoint connections from the fitter genome
		else if (gene1.innovationNumber > gene2.innovationNumber) {
			const newGene = config.nnPlugin.cloneGene(gene1) as ConnectionGene

			// Reenable a potentially disabled gene
			if (random(config.reenableConnectionProbability))
				newGene.enabled = true

			newGenes.push(newGene)

			g1++ // Avoid cloning the same gene twice
			g2++
		} else if (gene1.innovationNumber < gene2.innovationNumber) {
			if (equalFitness) {
				const newGene = config.nnPlugin.cloneGene(
					gene2,
				) as ConnectionGene

				// Reenable a potentially disabled gene
				if (random(config.reenableConnectionProbability))
					newGene.enabled = true

				newGenes.push(newGene)

				g2++ // Avoid cloning the same gene twice
			}
			g1++
		}
	}

	return { newGenes, maxGeneIndex }
}

export const mutateAddConnection = (
	genes: ConnectionGene[],
	innovationHistory: InnovationHistory,
	topoSorted: number[],
	maxGeneIndex: number,
	inputSize: number,
	outputSize: number,
	config: Config,
) => {
	// Create a list of indices corresponding to topoSorted
	const topoSortedIndices = Array.from(
		{ length: maxGeneIndex + 1 },
		(_, i) => i,
	)

	// Make sure that the input is not an output node
	const potentialInputIndices = topoSortedIndices.slice()
	potentialInputIndices.splice(inputSize, outputSize)

	let inputIndex = chooseRandom(potentialInputIndices)

	// Make sure that the output is not an input node
	const potentialOutputIndices = topoSortedIndices.slice(inputSize)

	// Choose an output index that comes after the input
	let outputIndex = chooseRandom(potentialOutputIndices)

	// Avoid creating a cyclic connection
	if (inputIndex === outputIndex) return

	// Make sure the connection is in order
	const actualInputIndex = topoSorted.findIndex(value => value === inputIndex)
	const actualOutputIndex = topoSorted.findIndex(
		value => value === outputIndex,
	)

	if (actualInputIndex > actualOutputIndex) {
		;[inputIndex, outputIndex] = [outputIndex, inputIndex]
	}

	const existingConnection = genes.find(
		gene =>
			gene.connection[0] === inputIndex &&
			gene.connection[1] === outputIndex,
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
		}) as ConnectionGene,
	)
}

export const mutateAddNode = (
	genes: ConnectionGene[],
	innovationHistory: InnovationHistory,
	maxGeneIndex: number,
	config: Config,
) => {
	const connectionGene: ConnectionGene = chooseRandom(genes)

	// Disable the current connection
	connectionGene.enabled = false

	// Determine the index/id of the new node
	const newNodeId = maxGeneIndex + 1

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
		}) as ConnectionGene,
	)

	genes.push(
		config.nnPlugin.configureCloneGene(
			{
				connection: outputConnection,
				enabled: true,
				innovationNumber:
					innovationHistory.getInnovation(outputConnection),
			},
			connectionGene,
		) as ConnectionGene,
	)

	return newNodeId
}
