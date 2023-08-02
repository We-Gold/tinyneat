export declare const sigmoid: (x: number) => number;
export declare const posAndNegSigmoid: (x: number) => number;
export declare const modifiedSigmoid: (x: number) => number;
export declare const tanh: (x: number) => number;
export declare const relu: (x: number) => number;
/**
 * A set of built-in activation methods
 */
export type ActivationType = "sigmoid" | "modifiedSigmoid" | "tanh" | "relu" | "posAndNegSigmoid";
/**
 * A dictionary that provides access to each of the built-in activation methods.
 */
export declare const Activation: Record<ActivationType, (x: number) => number>;
//# sourceMappingURL=activations.d.ts.map