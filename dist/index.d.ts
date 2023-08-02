import { PartialConfig } from "./config";
import { Genome } from "./genome";
import * as plugins from "./plugins";
/**
 * Creates a NEAT interface using the given configuration.
 *
 * Change only the parts that need to be configured,
 * the rest will be filled in from the default configuration.
 */
declare const TinyNEAT: (partialConfig?: PartialConfig) => {
    getPopulation: () => Genome[];
    getPopulationIndexed: () => IterableIterator<[number, Genome]>;
    getCurrentGeneration: () => number;
    complete: () => boolean;
    evolve: () => void;
    getBestGenomes: () => Genome[];
};
export { TinyNEAT, plugins };
//# sourceMappingURL=index.d.ts.map