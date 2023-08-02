/**
 * NEAT uses probability for mutation, crossover, and other features.
 * This provides a helper for taking or not taking a random action with a given probability.
 */
export declare const random: (probability: number) => boolean;
/**
 * Choose and return a random element of a given array.
 */
export declare const chooseRandom: <Type>(array: Type[]) => Type;
/**
 * Choose and return a random index of a given array.
 */
export declare const chooseRandomIndex: <Type>(array: Type[]) => number;
/**
 * Produce a random weight from -magnitude to +magnitude with
 * uniform probability (limited by pseudorandomness).
 */
export declare const uniformRandomWeight: (magnitude: number) => number;
//# sourceMappingURL=helpers.d.ts.map