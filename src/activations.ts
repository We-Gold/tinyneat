export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

export const modifiedSigmoid = (x: number) => 1 / (1 + Math.exp(-4.9 * x))

export const tanh = (x: number) => Math.tanh(x)

export const relu = (x: number) => (x > 0 ? x : 0)

