/**
 * NEAT uses probability for mutation, crossover, and other features.
 * This provides a helper for taking or not taking a random action with a given probability.
 */
export const random = (probability: number) => Math.random() <= probability

/**
 * Choose and return a random element of a given array.
 */
export const chooseRandom = (array: any[]) => array[chooseRandomIndex(array)]

/**
 * Choose and return a random index of a given array.
 */
export const chooseRandomIndex = (array: any[]) =>
	Math.round(Math.random() * (array.length - 1))

/**
 * Produce a random weight from -magnitude to +magnitude with
 * uniform probability (limited by pseudorandomness).
 */
export const uniformRandomWeight = (magnitude: number) =>
	(2 * Math.random() - 1) * magnitude

