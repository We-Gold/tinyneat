import { expect, test } from "vitest"
import { calculateGenomeDistance, createEmptyGenome } from "../src/genome"
import { createInnovationHistory } from "../src/history"
import { ANNPlugin } from "../src/plugins"
import { defaultConfig } from "../src/config"

const sizes = {
	"2->2": { inputSize: 2, outputSize: 2, weightMutationRange: 1.0 },
	"3->1": { inputSize: 3, outputSize: 1, weightMutationRange: 1.0 },
	"1->3": { inputSize: 1, outputSize: 3, weightMutationRange: 1.0 },
}

test.each(Object.entries(sizes))(
	"Empty genome has correct properties for size %s",
	(name, customConfig) => {
		const history = createInnovationHistory()

		const config = {
			...defaultConfig,
			...{
				inputSize: customConfig.inputSize,
				outputSize: customConfig.outputSize,
				nnPlugin: ANNPlugin({
					weightMutationRange: customConfig.weightMutationRange,
				}),
			},
		}

		const genome = createEmptyGenome(history, config)

		// Test basic properties of genome

		expect(genome.fitness).toBe(0)

		expect(genome.genes.length).toBe(config.inputSize * config.outputSize)

		// Test neural network feature

		const inputs = Array(config.inputSize).fill(0.5)

		const outputs = genome.process(inputs)

		expect(outputs).toHaveLength(config.outputSize)
	},
)

test("Genome distance is calculated correctly for empty genomes", () => {
	const history = createInnovationHistory()

	const config = {
		...defaultConfig,
		...{
			inputSize: 3,
			outputSize: 2,
			excessCoefficient: 1.0,
			disjointCoefficient: 1.0,
			weightDifferenceCoefficient: 0.0,
		},
	}

	const genome1 = createEmptyGenome(history, config)
	const genome2 = createEmptyGenome(history, config)

	const distance = calculateGenomeDistance(
		genome1,
		genome2,
		config,
	)

	expect(distance).toBe(0)
})
