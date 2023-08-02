export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

export const posAndNegSigmoid = (x: number) => 2 / (1 + Math.exp(-x)) - 1

export const modifiedSigmoid = (x: number) => 1 / (1 + Math.exp(-4.9 * x))

export const tanh = (x: number) => Math.tanh(x)

export const relu = (x: number) => (x > 0 ? x : 0)

/**
 * A set of built-in activation methods
 */
export type ActivationType =
	| "sigmoid"
	| "modifiedSigmoid"
	| "tanh"
	| "relu"
	| "posAndNegSigmoid"

/**
 * A dictionary that provides access to each of the built-in activation methods.
 */
export const Activation: Record<ActivationType, (x: number) => number> = {
	sigmoid,
	modifiedSigmoid,
	tanh,
	relu,
	posAndNegSigmoid,
}
