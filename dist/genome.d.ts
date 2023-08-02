import { Config } from "./config";
import { Connection, InnovationHistory } from "./history";
/**
 * Represents a connection between two node genes.
 * Extend this type to encode weight, recurrence, etc,
 * whatever is appropriate for the neural network plugin.
 */
export interface ConnectionGene {
    connection: Connection;
    enabled: boolean;
    innovationNumber: number;
}
export interface Genome {
    genes: ConnectionGene[];
    fitness: number;
    adjustedFitness: number;
    process: (inputs: number[]) => number[];
    maxGeneIndex: number;
}
export declare const createEmptyGenome: (innovationHistory: InnovationHistory, config: Config) => {
    genes: ConnectionGene[];
    fitness: number;
    adjustedFitness: number;
    process: (inputs: number[]) => number[];
    maxGeneIndex: number;
};
export declare const createGenomeFromGenes: (genes: ConnectionGene[], maxGeneIndex: number, config: Config) => {
    genes: ConnectionGene[];
    fitness: number;
    adjustedFitness: number;
    process: (inputs: number[]) => number[];
    maxGeneIndex: number;
};
export declare const calculateGenomeDistance: (genome1: Genome, genome2: Genome, config: Config) => number;
/**
 * Disjoint and excess genes are inherited from the more fit parent, or if they are equally fit,
 * each gene is inherited from either parent randomly.
 * Disabled genes have a chance of being reenabled during crossover,
 * allowing networks to make use of older genes once again.
 */
export declare const crossGenomes: (genome1: Genome, genome2: Genome, config: Config) => {
    newGenes: ConnectionGene[];
    maxGeneIndex: number;
};
export declare const mutateAddConnection: (genes: ConnectionGene[], innovationHistory: InnovationHistory, topoSorted: number[], maxGeneIndex: number, inputSize: number, outputSize: number, config: Config) => void;
export declare const mutateAddNode: (genes: ConnectionGene[], innovationHistory: InnovationHistory, maxGeneIndex: number, config: Config) => number;
//# sourceMappingURL=genome.d.ts.map