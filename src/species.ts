import { Config } from "./config"
import { Genome, calculateGenomeDistance } from "./genome"

/**
 * Speciate the current population. Each species has a permanent
 * representative, and if no members exist in this population,
 * the species goes extinct.
 */
export const speciatePopulation = (
	population: Genome[],
	previousSpecies: Species[],
	config: Config,
	generation: number,
) => {
	// Remove all genomes from the previous generation besides the
	// representative for each species
	for (let i = 0; i < previousSpecies.length; i++) {
		previousSpecies[i].population = []
	}

	for (const genome of population) {
		let placed = false

		// Check all species to see if this matches one
		for (const s of previousSpecies) {
			const distanceBetweenGenomes = calculateGenomeDistance(
				s.representative,
				genome,
				config,
			)

			// Add the genome to the appropriate species and track the closest
			// individual to the representative
			if (
				distanceBetweenGenomes < config.compatibilityThreshold &&
				!placed
			) {
				s.population.push(genome)

				// Track the record fitness for this species
				if (genome.fitness > s.recordFitness) {
					s.recordFitness = genome.fitness
					s.recordGeneration = generation
				}

				placed = true

				// Early exit as we have found an appropriate spot for the genome
				break
			}
		}

		// Create a new species if no matches were found
		if (!placed) {
			previousSpecies.push(createSpecies(genome, generation))
		}
	}

	// Persist all species that maintained a population
	const species = previousSpecies.filter(s => s.population.length > 0)

	return species
}

const createSpecies = (representative: Genome, generation: number) => ({
	population: [representative],
	recordFitness: representative.fitness,
	recordGeneration: generation,
	createdGeneration: generation,
	representative,
})

export type Species = ReturnType<typeof createSpecies>
