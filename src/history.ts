export type Connection = readonly [input: number, output: number]

export type InnovationHistory = ReturnType<typeof createInnovationHistory>

/**
 * Creates an object to track new innovations created through mutation.
 */
export const createInnovationHistory = () => {
	// Track the number of innovations
	let nextInnovationNumber = 0

	// Create a map to link connections to
	const innovations: { [key: string]: number } = {}

	/**
	 * Track this connection and give it the next innovation number
	 */
	const addInnovation = (c: Connection) => {
		const innovationNumber = nextInnovationNumber++
		innovations[c.toString()] = innovationNumber
		return innovationNumber
	}

	/**
	 * Get or create a new innovation to track the current connection.
	 */
	const getInnovation = (c: Connection) =>
		innovations[c.toString()] ?? addInnovation(c)

	return { addInnovation, getInnovation }
}

