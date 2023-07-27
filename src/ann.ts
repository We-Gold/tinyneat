import { modifiedSigmoid } from "./activations"
import { Connection } from "./history"

export type ANNConnectionGene = {
	connection: Connection
	weight: number
	enabled: boolean
	innovationNumber: number
}

export const createANN = (
	inputSize: number,
	outputSize: number,
	genes: ANNConnectionGene[],
	activation = modifiedSigmoid
) => {
	// Create a map between connections and weights
	const weights: { [key: string]: number } = {}

	for (const gene of genes) {
		weights[gene.connection.toString()] = gene.weight
	}

	// Create an adjacency list for storing connections in a
	// more useful format
	const { inputToOutput, outputToInput } = createAdjacencyList(genes)

	// Sort the graph to effectively linearize it
	const topoSorted = topologicalSort(inputToOutput, outputToInput)

	if (topoSorted.length === 0)
		throw new Error(
			"Received an unexpected graph structure, make sure the ANN is configured correctly."
		)

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

		const outputs = Array(outputSize).fill(0)

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

const createAdjacencyList = (genes: ANNConnectionGene[]) => {
	// Create lists to store input to output relationships and vice versa
	const inputToOutput: { [key: number]: number[] } = {}
	const outputToInput: { [key: number]: number[] } = {}

	// Add all connections to the adjacency list
	for (const gene of genes) {
		if (!gene.enabled) continue

		const [input, output] = gene.connection

		// Create lists if they are not already defined for these nodes
		if (!(input in inputToOutput)) inputToOutput[input] = []
		if (!(output in outputToInput)) outputToInput[output] = []
		if (!(output in inputToOutput)) inputToOutput[output] = []
		if (!(input in outputToInput)) outputToInput[input] = []

		inputToOutput[input].push(output)
		outputToInput[output].push(input)
	}

	return { inputToOutput, outputToInput }
}

/**
 * Use Kahn's algorithm to topologically sort the nodes of the network.
 */
const topologicalSort = (
	inputToOutput: { [key: number]: number[] },
	outputToInput: { [key: number]: number[] }
) => {
	// Store the number of connections into each node
	const inDegrees = Object.values(outputToInput).map(
		(neighbors) => neighbors.length
	)

	// Isolate the nodes without neighbors
	const nodesWithoutNeighbors = Object.entries(outputToInput)
		.filter(([, neighbors]) => neighbors.length === 0)
		.map(([i]) => +i)

	// Create a list to store the sorted nodes
	const topologicalOrdering = []

	while (nodesWithoutNeighbors.length > 0) {
		// Get the top node of the list, and help typescript know
		// that this is always a number (it doesn't understand length)
		const node = nodesWithoutNeighbors.pop() as number

		// Add the current node to the ordering
		topologicalOrdering.push(node)

		// Decrement the inDegrees of the neighbors of the
		// neighbors of the current node
		for (const neighbor of inputToOutput[node]) {
			// Decrement the inDegrees and check if it has no neighbors
			if (--inDegrees[neighbor] === 0) {
				nodesWithoutNeighbors.push(neighbor)
			}
		}
	}

	// Verify that the graph is the correct format for topo sort
	return topologicalOrdering.length === Object.keys(outputToInput).length
		? topologicalOrdering
		: []
}

// export const createConnection = (
// 	connection: readonly [input: number, output: number],
// 	config: typeof defaultConfig
// ): ANNConnectionGene => {}

