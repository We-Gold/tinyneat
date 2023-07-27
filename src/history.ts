export type Connection = readonly [input: number, output: number]

export const createInnovationHistory = () => {
	// Track the number of innovations
	let nextInnovationNumber = 0

	// Create a map to link connections to
	const innovations: { [key: string]: number } = {}

	const addInnovation = (c: Connection) => {
		const innovationNumber = nextInnovationNumber++
		innovations[c.toString()] = innovationNumber
		return innovationNumber
	}

	const getInnovation = (c: Connection) =>
		innovations[c.toString()] ?? addInnovation(c)

	return { addInnovation, getInnovation }
}

