import { Genome } from "./genome";
/**
 * Create an object that tracks the top performing individuals.
 */
export declare const createHallOfFame: (size: number) => {
    tryAdding: (contestant: Genome) => void;
    getBestGenomes: () => Genome[];
};
//# sourceMappingURL=halloffame.d.ts.map