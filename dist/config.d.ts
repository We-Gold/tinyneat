import { Logger } from "./logging/loggingmanager";
export type FitnessSort = "max" | "min";
export declare const defaultConfig: {
    initialPopulationSize: number;
    maxGenerations: number;
    maximumStagnation: number;
    excessCoefficient: number;
    disjointCoefficient: number;
    weightDifferenceCoefficient: number;
    compatibilityThreshold: number;
    survivalThreshold: number;
    mutateOnlyProbability: number;
    mateOnlyProbability: number;
    addNodeProbability: number;
    addLinkProbability: number;
    mutateWeightProbability: number;
    interspeciesMatingRate: number;
    mateByChoosingProbability: number;
    mateByAveragingProbability: number;
    reenableConnectionProbability: number;
    fitnessSort: FitnessSort;
    largeNetworkSize: number;
    minimumSpeciesSize: number;
    hallOfFameSize: number;
    inputSize: number;
    outputSize: number;
    nnPlugin: import("./nn/nnplugin").NNPlugin;
    loggingPlugins: Logger[];
};
export type Config = typeof defaultConfig;
export type PartialConfig = Partial<Config>;
//# sourceMappingURL=config.d.ts.map