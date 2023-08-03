import { Config } from "./config";
import { Genome } from "./genome";
/**
 * Speciate the current population. Each species has a permanent
 * representative, and if no members exist in this population,
 * the species goes extinct.
 */
export declare const speciatePopulation: (population: Genome[], previousSpecies: Species[], config: Config, generation: number) => {
    population: Genome[];
    recordFitness: number;
    recordGeneration: number;
    createdGeneration: number;
    representative: Genome;
}[];
declare const createSpecies: (representative: Genome, generation: number) => {
    population: Genome[];
    recordFitness: number;
    recordGeneration: number;
    createdGeneration: number;
    representative: Genome;
};
export type Species = ReturnType<typeof createSpecies>;
export {};
//# sourceMappingURL=species.d.ts.map