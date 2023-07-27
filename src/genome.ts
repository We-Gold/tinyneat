import { ANNConnectionGene, createANN } from "./ann"
import { defaultConfig } from "./config"
import { Connection, createInnovationHistory } from "./history"

// TODO make this specific to each network type through the plugin system
export const createEmptyGenome = (
	config: typeof defaultConfig,
	innovationHistory: ReturnType<typeof createInnovationHistory>
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

	const neuralNetwork = createANN(
		config.ann.inputSize,
		config.ann.outputSize,
		genes
	)

	return { genes, fitness: 0, process: neuralNetwork.process }
}

const uniformRandomWeight = (magnitude: number) =>
	(2 * Math.random() - 1) * magnitude

