import { ConnectionGene } from "../genome"

/**
 * Defines the interface for any neural network plugin.
 * Each method is required. See ann.ts for an example.
 *
 * Note: All methods that return {} actually return
 * a type that extends ConnectionGene, with any plugin-specific
 * data.
 */
export interface NNPlugin {
	createNetwork: (
		inputSize: number,
		outputSize: number,
		genes: ConnectionGene[]
	) => { process: (inputs: number[]) => number[] }
	calculateGeneDistance: (
		gene1: ConnectionGene,
		gene2: ConnectionGene
	) => number
	mutateGeneWeight: (gene: ConnectionGene) => void
	cloneGene: (gene: ConnectionGene) => {}
	averageGenes: (gene1: ConnectionGene, gene2: ConnectionGene) => {}
	configureRandomGene: (gene: ConnectionGene) => {}
	configureNewGene: (gene: ConnectionGene) => {}
	configureCloneGene: (
		gene: ConnectionGene,
		originalGene: ConnectionGene
	) => {}
}

/**
 * Create a list that maps nodes to all of the nodes that lead from them,
 * and a list that maps nodes to all of the nodes that lead to them.
 */
export const createAdjacencyList = (genes: ConnectionGene[]) => {
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
 *
 * This essentially provides an ordering for executing the neural network,
 * however, this is only applicable for directed acyclic graphs.
 */
export const topologicalSort = (
	inputToOutput: { [key: number]: number[] },
	outputToInput: { [key: number]: number[] }
) => {
	// Store the number of connections into each node
	const inDegrees: { [key: number]: number } = {}

	for (const [key, value] of Object.entries(outputToInput)) {
		inDegrees[parseInt(key)] = value.length
	}

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

