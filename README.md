![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/We-Gold/tinyneat/main?label=npm%20version&color=green&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Ftinyneat)
![npm bundle size](https://img.shields.io/bundlephobia/min/tinyneat?color=green)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/We-Gold/tinyneat/issues)
![CI](https://github.com/We-Gold/tinyneat/actions/workflows/ci.yaml/badge.svg)
![ViewCount](https://views.whatilearened.today/views/github/We-Gold/tinyneat.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![NPM Downloads](https://img.shields.io/npm/dw/tinyneat)

## What is TinyNEAT?

TinyNEAT is a simple and extensible NEAT (NeuroEvolution of Augmenting Topologies) implementation in JavaScript.

_[Skip To Documentation](#documentation)_

#### Motivation

With many websites and web-based games being written in JavaScript, having a solid starting place for using NEAT to train AI agents seems pretty useful.

The goal is that this library is able to fit into any particular use case, and that the implementation of the environment is entirely up to the user.

#### Features

-   Tiny Size (less than 20 KB!)
-   Plugin System
    -   Neural Networks
    -   Logging
-   Examples Provided
-   Fully Configurable
-   Complete TypeScript Support

## Basic Example

```js
import { TinyNEAT } from "tinyneat"

const tn = TinyNEAT(config)

// Loop until the configured fitness or generation threshold has been met.
// Will never end if neither is configured.
while (!tn.complete()) {
	const populationIndexed = tn.getPopulationIndexed()

	// Reset the environment for a new generation
	env.reset(populationIndexed.length)

	// Environment loop for one generation
	for (let step = 0; step < maxGenerationSteps; step++) {
		for (const [i, genome] of populationIndexed) {
			const inputs = env.getInputs(i)

			const outputs = genome.process(inputs)

			// Environment either supports outputs or takes argmax action
			const stepFitness = env.receiveAgentAction(i, outputs)

			// Fitness is either calculated at the end of the generation
			// or iteratively throughout.
			genome.fitness += stepFitness
		}
	}

	// Run evolution to produce the next generation
	tn.evolve()
}

// Reset the environment for a testing round
env.reset(1)

// Test the best genome in a round
const bestGenome = tn.getBestGenomes()[0]

for (let step = 0; step < maxGenerationSteps; step++) {
	// Get the inputs for the singular agent
	const inputs = env.getInputs(0)

	const outputs = bestGenome.process(inputs)

	bestGenome.fitness += env.receiveAgentAction(i, outputs)
}

console.log(`Best fitness: ${tn.getBestGenomes()[0].fitness}`)
```

## Environment Recommendations

Environments are not managed by TinyNEAT. We do recommend one of two environment structures. One, is an OpenAI gym-type environment, where each agent has their own environment. The other is an environment that manages each agent individually inside a single environment.

Environments are expected to iterate automatically, manage agents, and calculate fitness values. After each generation, TinyNEAT will handle the rest, as long as fitness values have been calculated for each genome (they are initialized to 0). TinyNEAT will build neural networks and provide evaluate methods.

## Documentation

See our reference documentation [here](https://wegold.me/tinyneat/docs).

### Configuration

The following is the default configuration of TinyNEAT. For any changes, for example the number of inputs to the networks, pass an object with these updated properties to the `TinyNEAT` method.

```js
// Closely based on parameters of the original NEAT paper
export const defaultConfig = {
	initialPopulationSize: 150, // Number of networks in the population
	maxGenerations: 100, // Stopping point for evolution

	maximumStagnation: 15, // Maximum number of generations a species is allowed to stay the same fitness before it is removed
	excessCoefficient: 1.0, // Coefficient representing how important excess genes are in measuring compatibility
	disjointCoefficient: 1.0, // Coefficient for disjoint genes
	weightDifferenceCoefficient: 0.4, // Coefficient for average weight difference (highly recommended for tuning)
	compatibilityThreshold: 3.0, // Threshold for speciation (highly recommended for tuning)
	survivalThreshold: 0.2, // Percentage of each species allowed to reproduce
	mutateOnlyProbability: 0.25, // Probability that a reproduction will only result from mutation and not crossover
	mateOnlyProbability: 0.2, // Probability an offspring will be created only through crossover without mutation
	addNodeProbability: 0.03, // Probability a new node gene will be added to the genome
	addLinkProbability: 0.05, // Probability a new connection will be added
	mutateWeightProbability: 0.3, // Probability a weight will be mutated
	interspeciesMatingRate: 0.01, // Percentage of crossovers allowed to occur between parents of different species
	mateByChoosingProbability: 0.6, // Probability that genes will be chosen one at a time from either parent during crossover
	mateByAveragingProbability: 0.4, // Probability that matching genes will be averaged during crossover
	reenableConnectionProbability: 0.01, // Probability that a connection is randomly reenabled during crossover

	fitnessSort: "max", // Whether a higher or a lower fitness is better

	largeNetworkSize: 20, // A network with this many genes is considered to be large
	minimumSpeciesSize: 2, // The minimum number of offspring a species can have

	hallOfFameSize: 10, // The number of top-performing individuals to store

	inputSize: 3, // The number of inputs to each neural network
	outputSize: 2, // The number of outputs of each neural network

	// Plugin for the specific type of neural network (ANN, RNN, etc)
	nnPlugin: ANNPlugin(),

	// Plugins for logging data
	loggingPlugins: [ConsoleLogger()],
}
```

### Usage vs. Plugin Development

TinyNEAT supports both standard usage and plugins that add custom functionality. Certain plugins are built-in, such as the standard feedforward neural network and a few default loggers.

There are only two external entry points to the library. See below:

```js
import { TinyNEAT, plugins } from "tinyneat"
```

The `TinyNEAT` method (with configuration) creates and manages the population of NEAT individuals and provides all necessary methods. See [Basic Example](#basic-example) for what this looks like.

This was done so that multiple NEAT instances can be created with no conflicts.

**Besides the `TinyNEAT` method and `plugins`, nearly all other items in the documentation are internal.** These are only applicable for building plugins.

## Plugin Development

TinyNEAT currently supports two types of plugins: Neural Network Plugins and Logging Plugins.

### Neural Network Plugins

These plugins extend TinyNEAT's capabilities, enabling any type of neural network desired. While a only a standard ANN
plugin is provided, additional plugins can be developed. See the documentation (`NNPlugin`) for the proper interface, and see the configuration section for how to include a Neural Network Plugin.

A plugin could even use Tensorflow.js, Brain.js, or another neural network library, as long as it works in conjunction with NEAT.

### Logging Plugins

These plugins enable custom logging features. TinyNEAT emits two events, one when the initial population is created, and one on each evolution. For more specific information, see the `Logger` interface in the documentation.

Also, see `consolelogger.ts` for a basic example.

## Library Development

If you are interested in contributing to the library, or have public plugin code you would like linked on this page, create an issue or pull request.

For local installation, simply clone the repository and run `npm i` to install all of the development dependencies.

All scripts are listed in `package.json`.
