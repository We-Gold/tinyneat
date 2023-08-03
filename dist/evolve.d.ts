import { Config } from "./config";
import { ConnectionGene, Genome } from "./genome";
import { InnovationHistory } from "./history";
import { Species } from "./species";
export declare const evolvePopulation: (population: Genome[], previousSpecies: Species[], innovationHistory: InnovationHistory, config: Config, generation: number) => {
    nextPopulation: {
        genes: ConnectionGene[];
        fitness: number;
        adjustedFitness: number;
        process: (inputs: number[]) => number[];
        maxGeneIndex: number;
    }[];
    nextSpecies: {
        population: Genome[];
        recordFitness: number;
        recordGeneration: number;
        createdGeneration: number;
        representative: Genome;
    }[];
};
//# sourceMappingURL=evolve.d.ts.map