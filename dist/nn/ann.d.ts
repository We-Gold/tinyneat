import { ActivationType } from "./activations";
import { NNPlugin } from "./nnplugin";
declare const defaultConfig: {
    weightMutationRange: number;
    activation: ActivationType;
};
declare const ANNPlugin: (partialConfig?: Partial<typeof defaultConfig>) => NNPlugin;
export default ANNPlugin;
//# sourceMappingURL=ann.d.ts.map