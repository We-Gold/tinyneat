import { expect, test } from "vitest"
import { createEmptyGenome } from "../src/genome"
import { defaultConfig } from "../src/config"
import { createInnovationHistory } from "../src/history"

const sizes = {
    "2->2": {inputSize: 2, outputSize: 2, weightMutationRange: 1.0},
    "3->1": {inputSize: 3, outputSize: 1, weightMutationRange: 1.0},
    "1->3": {inputSize: 1, outputSize: 3, weightMutationRange: 1.0}
}

test.each(Object.entries(sizes))("Empty genome has correct properties for size %s", (name, ann) => {
    const history = createInnovationHistory()

    const config = {...defaultConfig, ann}

    const genome = createEmptyGenome(history, config)

    // Test basic properties of genome

    expect(genome.fitness).toBe(0)

    expect(genome.genes.length).toBe(config.ann.inputSize * config.ann.outputSize)

    // Test neural network feature
    
    const inputs = Array(config.ann.inputSize).fill(0.5)

    const outputs = genome.process(inputs)

    expect(outputs).toHaveLength(config.ann.outputSize)
})