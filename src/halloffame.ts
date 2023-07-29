import { Genome } from "./genome"

export const createHallOfFame = (size: number) => {
	const bestGenomes: Genome[] = Array(size)

	let minFitness = -Infinity

	const tryAdding = (contestant: Genome) => {
		// Avoid any genomes worse than all the hall of fame
		if (contestant.fitness < minFitness) return

		const index = bestGenomes.findIndex(
			(element) => element.fitness <= contestant.fitness
		)

		if (index === -1) {
			// Contestant has the highest fitness, so it goes at the beginning
			bestGenomes.unshift(contestant)
		} else if (index === bestGenomes.length - 1) {
			// Contestant has the lowest fitness, so it goes at the end
			bestGenomes.push(contestant)
		} else {
			// Contestant fits somewhere in the middle
			bestGenomes.splice(index, 0, contestant)
		}

		// Truncate the list if it exceeds the given size
		if (bestGenomes.length > size) bestGenomes.pop()

		// Store the minimum fitness in the hall of fame
		minFitness = bestGenomes.at(-1)?.fitness ?? -Infinity
	}

	const getBestGenomes = () => bestGenomes

	return { tryAdding, getBestGenomes }
}

