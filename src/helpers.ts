export const random = (probability: number) => Math.random() <= probability

export const chooseRandom = (array: any[]) => array[chooseRandomIndex(array)]

export const chooseRandomIndex = (array: any[]) =>
	Math.round(Math.random() * (array.length - 1))

export const uniformRandomWeight = (magnitude: number) =>
	(2 * Math.random() - 1) * magnitude

