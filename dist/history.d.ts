export type Connection = readonly [input: number, output: number];
export type InnovationHistory = ReturnType<typeof createInnovationHistory>;
/**
 * Creates an object to track new innovations created through mutation.
 */
export declare const createInnovationHistory: () => {
    addInnovation: (c: Connection) => number;
    getInnovation: (c: Connection) => number;
};
//# sourceMappingURL=history.d.ts.map