import { Activation, ActivationType } from "./activations"
import { ConnectionGene } from "../genome"
import { uniformRandomWeight } from "../helpers"
import { NNPlugin, createAdjacencyList, topologicalSort } from "./nnplugin"

interface ANNConnectionGene extends ConnectionGene {
	weight: number
}

const createNetwork = (
	inputSize: number,
	outputSize: number,
	genes: ConnectionGene[],
	activation: (x: number) => number
) => {
	// Create a map between connections and weights
	const weights: { [key: string]: number } = {}

	for (const gene of genes) {
		weights[gene.connection.toString()] = (gene as ANNConnectionGene).weight
	}

	// Create an adjacency list for storing connections in a
	// more useful format
	const { inputToOutput, outputToInput } = createAdjacencyList(genes)

	// Sort the graph to effectively linearize it
	const topoSorted = topologicalSort(inputToOutput, outputToInput)

	if (topoSorted.length === 0) {
		throw new Error(
			"Received an unexpected graph structure, make sure the ANN is configured correctly."
		)
	}

	const process = (inputs: number[]) => {
		// Verify that the input shape is correct
		if (inputs.length !== inputSize)
			throw new Error(
				`Received inputs of length ${inputs.length}, but expected length ${inputSize}`
			)

		const nodeValues = Array(genes.length).fill(0)

		// Evaluate all nodes in the network
		for (const nodeIndex of topoSorted) {
			// Fill any input nodes first
			if (nodeIndex < inputSize) nodeValues[nodeIndex] = inputs[nodeIndex]
			else {
				let sum = 0

				for (const neighbor of outputToInput[nodeIndex]) {
					sum +=
						weights[[neighbor, nodeIndex].toString()] *
						nodeValues[neighbor]
				}

				nodeValues[nodeIndex] = activation(sum)
			}
		}

		const outputs: number[] = Array(outputSize).fill(0)

		// Fill in all output values
		for (let i = 0; i < nodeValues.length; i++) {
			// Check that the current value is an output
			if (
				topoSorted[i] >= inputSize &&
				topoSorted[i] < inputSize + outputSize
			) {
				outputs[topoSorted[i] - inputSize] = nodeValues[i]
			}
		}

		return outputs
	}

	return { process }
}

const calculateGeneDistance = (
	gene1: ConnectionGene,
	gene2: ConnectionGene
) => {
	return (
		(gene1 as ANNConnectionGene).weight -
		(gene2 as ANNConnectionGene).weight
	)
}

const mutateGeneWeight = (gene: ConnectionGene, magnitude: number) => {
	;(gene as ANNConnectionGene).weight += uniformRandomWeight(magnitude)
}

const cloneGene = (gene: ConnectionGene) => ({ ...gene })

const averageGenes = (gene1: ConnectionGene, gene2: ConnectionGene) => {
	const averageWeight =
		((gene1 as ANNConnectionGene).weight +
			(gene2 as ANNConnectionGene).weight) /
		2

	// Return the gene with averaged weight, assumes the genes are the same otherwise
	return { ...gene1, weight: averageWeight }
}

const configureRandomGene = (gene: ConnectionGene, magnitude: number) => {
	return { ...gene, weight: uniformRandomWeight(magnitude) }
}

const configureNewGene = (gene: ConnectionGene) => {
	return { ...gene, weight: 1.0 }
}

const configureCloneGene = (
	gene: ConnectionGene,
	originalGene: ConnectionGene
) => {
	return { ...gene, weight: (originalGene as ANNConnectionGene).weight }
}

// Define the default config for the plugin
const defaultConfig: {
	weightMutationRange: number
	activation: ActivationType
} = {
	// Configuration options for the artificial neural network
	weightMutationRange: 1.0, // The maximum magnitude of a mutation that changes the weight of a connection
	activation: "posAndNegSigmoid",
}

// Create the standard Artificial Neural Network plugin
const ANNPlugin = (
	partialConfig: Partial<typeof defaultConfig> = {}
): NNPlugin => {
	// Fill in any missing details from the config using defaults
	const config: typeof defaultConfig = { ...defaultConfig, ...partialConfig }

	return {
		createNetwork: (
			inputSize: number,
			outputSize: number,
			genes: ConnectionGene[]
		) =>
			createNetwork(
				inputSize,
				outputSize,
				genes,
				Activation[config.activation]
			),
		calculateGeneDistance,
		mutateGeneWeight: (gene: ConnectionGene) =>
			mutateGeneWeight(gene, config.weightMutationRange),
		cloneGene,
		averageGenes,
		configureRandomGene: (gene: ConnectionGene) =>
			configureRandomGene(gene, config.weightMutationRange),
		configureNewGene,
		configureCloneGene,
	}
}

export default ANNPlugin

