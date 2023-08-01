import { Logger } from "./logging/loggingmanager"
import { ANNPlugin, ConsoleLogger } from "./plugins"

export type FitnessSort = "max" | "min"

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

	fitnessSort: <FitnessSort>"max",

	largeNetworkSize: 20, // A network with this many genes is considered to be large
	minimumSpeciesSize: 2, // The minimum number of offspring a species can have

	hallOfFameSize: 10, // The number of top-performing individuals to store

	inputSize: 3, // The number of inputs to each neural network
	outputSize: 2, // The number of outputs of each neural network

	// Plugin for the specific type of neural network (ANN, RNN, etc)
	nnPlugin: ANNPlugin(),

	// Plugins for logging data
	loggingPlugins: <Logger[]>[ConsoleLogger()],
}

export type Config = typeof defaultConfig
export type PartialConfig = Partial<Config>

