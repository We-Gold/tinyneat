import { Config } from "./config"
import { Genome, calculateGenomeDistance } from "./genome"

/**
 * Speciate the current population. Species are stored as arrays, where the first
 * element is the representative
 */
export const speciatePopulation = (
	population: Genome[],
	species: Genome[][],
	// excessCoefficient: number,
	// disjointCoefficient: number,
	// weightDifferenceCoefficient: number,
	// compatibilityThreshold: number,
	config: Config
) => {
	// Remove all genomes from the previous geneation besides the
	// representative for each species
	for (let i = 0; i < species.length; i++) {
		species[i] = species[i].slice(0, 1)
	}

	// Create another array to track the closest representatives for
	// each species from the next generation
	const nextRepresentative = species.map((_) => ({
		distance: Infinity,
		i: 0,
	}))

	for (const genome of population) {
		let placed = false

		// Check all species to see if this matches one
		for (const [index, s] of species.entries()) {
			const distanceBetweenGenomes = calculateGenomeDistance(
				s[0],
				genome,
				config.excessCoefficient,
				config.disjointCoefficient,
				config.weightDifferenceCoefficient,
				config
			)

			// Add the genome to the appropriate species and track the closest
			// individual to the representative
			if (distanceBetweenGenomes <= config.compatibilityThreshold) {
				s.push(genome)

				if (distanceBetweenGenomes < nextRepresentative[index].distance)
					nextRepresentative[index] = {
						distance: distanceBetweenGenomes,
						i: s.length - 1,
					}

				placed = true
			}
		}

		// Create a new species if no matches were found
		if (!placed) {
			species.push([genome])
			nextRepresentative.push({
				distance: Infinity,
				i: 0,
			})
		}
	}

	// Replace the previous representative with the new one
	for (const [index, s] of species.entries()) {
		s[0] = s.splice(nextRepresentative[index].i, 1)[0]
	}
}

