import { ConnectionGene } from "../genome";
/**
 * Defines the interface for any neural network plugin.
 * Each method is required. See ann.ts for an example.
 *
 * Note: All methods that return object actually return
 * a type that extends ConnectionGene, with any plugin-specific
 * data.
 */
export interface NNPlugin {
    createNetwork: (inputSize: number, outputSize: number, genes: ConnectionGene[]) => {
        process: (inputs: number[]) => number[];
    };
    calculateGeneDistance: (gene1: ConnectionGene, gene2: ConnectionGene) => number;
    mutateGeneWeight: (gene: ConnectionGene) => void;
    cloneGene: (gene: ConnectionGene) => object;
    averageGenes: (gene1: ConnectionGene, gene2: ConnectionGene) => object;
    configureRandomGene: (gene: ConnectionGene) => object;
    configureNewGene: (gene: ConnectionGene) => object;
    configureCloneGene: (gene: ConnectionGene, originalGene: ConnectionGene) => object;
}
/**
 * Create a list that maps nodes to all of the nodes that lead from them,
 * and a list that maps nodes to all of the nodes that lead to them.
 */
export declare const createAdjacencyList: (genes: ConnectionGene[]) => {
    inputToOutput: {
        [key: number]: number[];
    };
    outputToInput: {
        [key: number]: number[];
    };
};
/**
 * Use Kahn's algorithm to topologically sort the nodes of the network.
 *
 * This essentially provides an ordering for executing the neural network,
 * however, this is only applicable for directed acyclic graphs.
 */
export declare const topologicalSort: (inputToOutput: {
    [key: number]: number[];
}, outputToInput: {
    [key: number]: number[];
}) => number[];
//# sourceMappingURL=nnplugin.d.ts.map