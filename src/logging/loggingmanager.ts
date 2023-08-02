import { Config } from "../config"
import { Genome } from "../genome"

export type InitialPopulationData = {
	population: readonly Genome[]
	config: Config
}

export type EvolveData = {
	generation: number
	population: readonly Genome[]
	species: readonly Genome[][]
	bestGenomes: readonly Genome[]
	config: Config
	complete: boolean
}

/**
 * Defines the interface for a logging plugin.
 * All methods are optional.
 */
export interface Logger {
	handleInitialPopulation?: (data: InitialPopulationData) => void
	handleEvolve?: (data: EvolveData) => void
}

/**
 * Create the logging manager from a list of loggers.
 * The logging manager implements the same interface
 * as individual loggers.
 */
export const LoggingManager = (loggers: Logger[]): Logger => {
	const handleInitialPopulation = (data: InitialPopulationData) =>
		loggers.forEach(logger => logger.handleInitialPopulation?.(data))

	const handleEvolve = (data: EvolveData) =>
		loggers.forEach(logger => logger.handleEvolve?.(data))

	return { handleInitialPopulation, handleEvolve }
}
