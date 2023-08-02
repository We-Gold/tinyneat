import { Config } from "./config";
import { ConnectionGene, Genome } from "./genome";
import { InnovationHistory } from "./history";
export declare const evolvePopulation: (population: Genome[], species: Genome[][], innovationHistory: InnovationHistory, config: Config) => {
    genes: ConnectionGene[];
    fitness: number;
    adjustedFitness: number;
    process: (inputs: number[]) => number[];
    maxGeneIndex: number;
}[];
//# sourceMappingURL=evolve.d.ts.map