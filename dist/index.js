const w = (n) => {
  const e = {}, t = {};
  for (const o of n) {
    if (!o.enabled)
      continue;
    const [s, i] = o.connection;
    s in e || (e[s] = []), i in t || (t[i] = []), i in e || (e[i] = []), s in t || (t[s] = []), e[s].push(i), t[i].push(s);
  }
  return { inputToOutput: e, outputToInput: t };
}, I = (n, e) => {
  const t = {};
  for (const [i, r] of Object.entries(e))
    t[parseInt(i)] = r.length;
  const o = Object.entries(e).filter(([, i]) => i.length === 0).map(([i]) => +i), s = [];
  for (; o.length > 0; ) {
    const i = o.pop();
    s.push(i);
    for (const r of n[i])
      --t[r] === 0 && o.push(r);
  }
  return s.length === Object.keys(e).length ? s : [];
}, z = (n) => 1 / (1 + Math.exp(-n)), T = (n) => 2 / (1 + Math.exp(-n)) - 1, E = (n) => 1 / (1 + Math.exp(-4.9 * n)), k = (n) => Math.tanh(n), R = (n) => n > 0 ? n : 0, C = {
  sigmoid: z,
  modifiedSigmoid: E,
  tanh: k,
  relu: R,
  posAndNegSigmoid: T
}, b = (n) => Math.random() <= n, v = (n) => n[A(n)], A = (n) => Math.round(Math.random() * (n.length - 1)), N = (n) => (2 * Math.random() - 1) * n, B = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  chooseRandom: v,
  chooseRandomIndex: A,
  random: b,
  uniformRandomWeight: N
}, Symbol.toStringTag, { value: "Module" })), L = (n, e, t, o) => {
  const s = {};
  for (const a of t)
    s[a.connection.toString()] = a.weight;
  const { inputToOutput: i, outputToInput: r } = w(t), l = I(i, r);
  if (l.length === 0)
    throw new Error(
      "Received an unexpected graph structure, make sure the ANN is configured correctly."
    );
  return { process: (a) => {
    if (a.length !== n)
      throw new Error(
        `Received inputs of length ${a.length}, but expected length ${n}`
      );
    const d = Array(t.length).fill(0);
    for (const c of l)
      if (c < n)
        d[c] = a[c];
      else {
        let g = 0;
        for (const f of r[c])
          g += s[[f, c].toString()] * d[f];
        d[c] = o(g);
      }
    const p = Array(e).fill(0);
    for (let c = 0; c < d.length; c++)
      l[c] >= n && l[c] < n + e && (p[l[c] - n] = d[c]);
    return p;
  } };
}, $ = (n, e) => n.weight - e.weight, W = (n, e) => {
  n.weight += N(e);
}, D = (n) => ({ ...n }), V = (n, e) => {
  const t = (n.weight + e.weight) / 2;
  return { ...n, weight: t };
}, q = (n, e) => ({ ...n, weight: N(e) }), H = (n) => ({ ...n, weight: 1 }), J = (n, e) => ({ ...n, weight: e.weight }), K = {
  // Configuration options for the artificial neural network
  weightMutationRange: 1,
  // The maximum magnitude of a mutation that changes the weight of a connection
  activation: "posAndNegSigmoid"
}, M = (n = {}) => {
  const e = { ...K, ...n };
  return {
    createNetwork: (t, o, s) => L(
      t,
      o,
      s,
      C[e.activation]
    ),
    calculateGeneDistance: $,
    mutateGeneWeight: (t) => W(t, e.weightMutationRange),
    cloneGene: D,
    averageGenes: V,
    configureRandomGene: (t) => q(t, e.weightMutationRange),
    configureNewGene: H,
    configureCloneGene: J
  };
}, O = (n) => ({ handleInitialPopulation: (o) => n.forEach((s) => {
  var i;
  return (i = s.handleInitialPopulation) == null ? void 0 : i.call(s, o);
}), handleEvolve: (o) => n.forEach((s) => {
  var i;
  return (i = s.handleEvolve) == null ? void 0 : i.call(s, o);
}) }), F = () => ({ handleInitialPopulation: (t) => {
  console.log("Beginning NEAT"), console.log("______________"), console.log(
    `Initial Population Size: ${t.config.initialPopulationSize}`
  ), console.log("Complete Config: "), console.log(t.config), console.log("");
}, handleEvolve: (t) => {
  var o;
  t.complete ? console.log(`NEAT completed at generation ${t.generation}:`) : console.log(`Results of generation ${t.generation}:`), console.log(`Population Size: ${t.population.length}`), console.log(`Number of Species: ${t.species.length}`), console.log(`Max Fitness: ${(o = t.bestGenomes) == null ? void 0 : o[0].fitness}`), t.complete && (console.log("Best Genomes: "), console.log(t.bestGenomes)), console.log("");
} }), re = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ANNPlugin: M,
  Activation: C,
  ConsoleLogger: F,
  LoggingManager: O,
  createAdjacencyList: w,
  helpers: B,
  topologicalSort: I
}, Symbol.toStringTag, { value: "Module" })), Q = {
  initialPopulationSize: 50,
  // Number of networks in the population
  targetSpecies: 10,
  // Desired number of species to maintain
  maxGenerations: 100,
  // Stopping point for evolution
  maximumStagnation: 15,
  // Maximum number of generations a species is allowed to stay the same fitness before it is removed
  excessCoefficient: 2,
  // Coefficient representing how important excess genes are in measuring compatibility
  disjointCoefficient: 2,
  // Coefficient for disjoint genes
  weightDifferenceCoefficient: 1,
  // Coefficient for average weight difference (highly recommended for tuning)
  compatibilityThreshold: 6,
  // Threshold for speciation (highly recommended for tuning)
  compatibilityModifier: 0.3,
  // Rate to change the compatibility threshold at when target species count is not met
  survivalThreshold: 0.2,
  // Percentage of each species allowed to reproduce
  mutateOnlyProbability: 0.25,
  // Probability that a reproduction will only result from mutation and not crossover
  mateOnlyProbability: 0.2,
  // Probability an offspring will be created only through crossover without mutation
  addNodeProbability: 0.03,
  // Probability a new node gene will be added to the genome
  addLinkProbability: 0.05,
  // Probability a new connection will be added
  mutateWeightProbability: 0.3,
  // Probability a weight will be mutated
  interspeciesMatingRate: 0.01,
  // Percentage of crossovers allowed to occur between parents of different species
  mateByChoosingProbability: 0.6,
  // Probability that genes will be chosen one at a time from either parent during crossover
  mateByAveragingProbability: 0.4,
  // Probability that matching genes will be averaged during crossover
  reenableConnectionProbability: 0.01,
  // Probability that a connection is randomly reenabled during crossover
  fitnessSort: "max",
  largeNetworkSize: 20,
  // A network with this many genes is considered to be large
  minimumSpeciesSize: 1,
  // The minimum number of offspring a species can have
  hallOfFameSize: 10,
  // The number of top-performing individuals to store
  inputSize: 1,
  // The number of inputs to each neural network
  outputSize: 1,
  // The number of outputs of each neural network
  // Plugin for the specific type of neural network (ANN, RNN, etc)
  nnPlugin: M(),
  // Plugins for logging data
  loggingPlugins: [F()]
}, U = (n, e) => {
  const t = [];
  for (let s = 0; s < e.inputSize; s++)
    for (let i = 0; i < e.outputSize; i++) {
      const r = [s, e.inputSize + i], l = n.getInnovation(r);
      t.push(
        e.nnPlugin.configureRandomGene({
          connection: r,
          enabled: !0,
          innovationNumber: l
        })
      );
    }
  const o = e.inputSize + e.outputSize - 1;
  return x(t, o, e);
}, x = (n, e, t) => {
  if (t.inputSize < 1 || t.outputSize < 1)
    throw new Error(
      "Invalid neural network input or output size. Verify that there are at least 1 of each."
    );
  const o = t.nnPlugin.createNetwork(
    t.inputSize,
    t.outputSize,
    n
  );
  return {
    genes: n,
    fitness: 0,
    adjustedFitness: 0,
    process: o.process,
    maxGeneIndex: e
  };
}, X = (n, e, t) => {
  e.genes.length > n.genes.length && ([n, e] = [e, n]);
  const o = n.genes.length, s = e.genes.length, i = o - s;
  let r = 0, l = 0, u = 0, a = 0, d = 0;
  const p = o > t.largeNetworkSize ? o : 1;
  for (; a < o && d < s; )
    n.genes[a].innovationNumber === e.genes[d].innovationNumber ? (l += t.nnPlugin.calculateGeneDistance(
      n.genes[a++],
      n.genes[d++]
    ), u++) : n.genes[a].innovationNumber > e.genes[d].innovationNumber ? (r++, d++) : n.genes[a].innovationNumber < e.genes[d].innovationNumber && (r++, a++);
  return t.excessCoefficient * i / p + t.disjointCoefficient * r / p + t.weightDifferenceCoefficient * (l / u);
}, S = (n, e, t) => {
  const o = e.adjustedFitness === n.adjustedFitness;
  e.adjustedFitness > n.adjustedFitness && ([n, e] = [e, n]);
  const s = o ? Math.max(n.maxGeneIndex, e.maxGeneIndex) : n.maxGeneIndex, i = n.genes.length, r = e.genes.length, l = [];
  let u = 0, a = 0;
  for (; u < i; ) {
    const d = n.genes[u], p = e.genes[a];
    if (a >= r) {
      const c = t.nnPlugin.cloneGene(d);
      b(t.reenableConnectionProbability) && (c.enabled = !0), l.push(), u++;
    } else if (d.innovationNumber === p.innovationNumber) {
      let c;
      b(t.mateByChoosingProbability) ? c = t.nnPlugin.cloneGene(
        Math.random() < 0.5 ? d : p
      ) : c = t.nnPlugin.averageGenes(
        d,
        p
      ), b(t.reenableConnectionProbability) && (c.enabled = !0), l.push(c), u++, a++;
    } else if (d.innovationNumber > p.innovationNumber) {
      const c = t.nnPlugin.cloneGene(d);
      b(t.reenableConnectionProbability) && (c.enabled = !0), l.push(c), u++, a++;
    } else if (d.innovationNumber < p.innovationNumber) {
      if (o) {
        const c = t.nnPlugin.cloneGene(
          p
        );
        b(t.reenableConnectionProbability) && (c.enabled = !0), l.push(c), a++;
      }
      u++;
    }
  }
  return { newGenes: l, maxGeneIndex: s };
}, Y = (n, e, t, o, s, i, r) => {
  const l = Array.from(
    { length: o + 1 },
    (h, y) => y
  ), u = l.slice();
  u.splice(s, i);
  let a = v(u);
  const d = l.slice(s);
  let p = v(d);
  if (a === p)
    return;
  const c = t.findIndex((h) => h === a), g = t.findIndex(
    (h) => h === p
  );
  c > g && ([a, p] = [p, a]);
  const f = n.find(
    (h) => h.connection[0] === a && h.connection[1] === p
  );
  if (f !== void 0) {
    f.enabled = !0;
    return;
  }
  const G = [a, p], m = e.getInnovation(G);
  n.push(
    r.nnPlugin.configureNewGene({
      connection: G,
      enabled: !0,
      innovationNumber: m
    })
  );
}, Z = (n, e, t, o) => {
  const s = v(n);
  s.enabled = !1;
  const i = t + 1, r = [
    s.connection[0],
    i
  ], l = [
    i,
    s.connection[1]
  ];
  return n.push(
    o.nnPlugin.configureNewGene({
      connection: r,
      enabled: !0,
      innovationNumber: e.getInnovation(r)
    })
  ), n.push(
    o.nnPlugin.configureCloneGene(
      {
        connection: l,
        enabled: !0,
        innovationNumber: e.getInnovation(l)
      },
      s
    )
  ), i;
}, ee = (n, e, t, o) => {
  for (let i = 0; i < e.length; i++)
    e[i].population = [];
  for (const i of n) {
    let r = !1;
    for (const l of e)
      if (X(
        l.representative,
        i,
        t
      ) < t.compatibilityThreshold && !r) {
        l.population.push(i), i.fitness > l.recordFitness && (l.recordFitness = i.fitness, l.recordGeneration = o), r = !0;
        break;
      }
    r || e.push(ne(i, o));
  }
  return e.filter((i) => i.population.length > 0);
}, ne = (n, e) => ({
  population: [n],
  recordFitness: n.fitness,
  recordGeneration: e,
  createdGeneration: e,
  representative: n
}), te = (n, e, t, o, s) => {
  const i = ee(
    n,
    e,
    o,
    s
  );
  se(i, o), oe(i);
  const r = ie(
    n,
    i,
    o,
    s
  ), l = [];
  for (const [u, a] of i.entries()) {
    const d = a.population.sort(
      (g, f) => f.adjustedFitness - g.adjustedFitness
      // This currently assumes positive fitness is ideal
    ), p = d.slice(
      0,
      Math.max(
        a.population.length * o.survivalThreshold,
        o.minimumSpeciesSize
      )
    ), c = d[0];
    l.push(
      x(
        structuredClone(c.genes),
        c.maxGeneIndex,
        o
      )
    );
    for (let g = 0; g < Math.max(r[u] - 1, o.minimumSpeciesSize); g++) {
      const f = v(p);
      let G = v(p);
      b(o.interspeciesMatingRate) && (G = v(v(i).population));
      let m, h;
      if (b(o.mateOnlyProbability)) {
        const y = S(f, G, o);
        m = y.newGenes, h = y.maxGeneIndex;
      } else {
        if (b(o.mutateOnlyProbability))
          m = structuredClone(f.genes), h = f.maxGeneIndex;
        else {
          const P = S(f, G, o);
          m = P.newGenes, h = P.maxGeneIndex;
        }
        const { inputToOutput: y, outputToInput: _ } = w(m), j = I(y, _);
        b(o.addLinkProbability) ? Y(
          m,
          t,
          j,
          h,
          o.inputSize,
          o.outputSize,
          o
        ) : b(o.addNodeProbability) && (h = Z(
          m,
          t,
          h,
          o
        ));
        for (const P of m)
          b(o.mutateWeightProbability) && o.nnPlugin.mutateGeneWeight(P);
      }
      l.push(
        x(m, h, o)
      );
    }
  }
  return { nextPopulation: l, nextSpecies: i };
}, oe = (n) => {
  for (const e of n)
    for (const t of e.population)
      t.adjustedFitness = t.fitness / e.population.length;
}, ie = (n, e, t, o) => {
  const s = e.map((l) => l.population.reduce((u, a) => u + a.adjustedFitness, 0) / l.population.length), i = s.reduce(
    (l, u) => l + u,
    0
  );
  return s.map(
    (l) => Math.round(l / i * n.length)
  ).map((l, u) => o - e[u].recordGeneration >= t.maximumStagnation ? Math.floor(l / 2) : l);
}, se = (n, e) => {
  n.length < e.targetSpecies ? e.compatibilityThreshold -= e.compatibilityModifier : n.length > e.targetSpecies && (e.compatibilityThreshold += e.compatibilityModifier), e.compatibilityThreshold < e.compatibilityModifier && (e.compatibilityThreshold = e.compatibilityModifier);
}, le = (n) => {
  const e = Array(n);
  let t = -1 / 0;
  return { tryAdding: (i) => {
    var l;
    if (i.fitness < t)
      return;
    const r = e.findIndex(
      (u) => u && u.fitness <= i.fitness
    );
    r === -1 ? e.unshift(i) : r === e.length - 1 ? e.push(i) : e.splice(r, 0, i), e.length > n && e.pop(), t = ((l = e.at(-1)) == null ? void 0 : l.fitness) ?? -1 / 0;
  }, getBestGenomes: () => e };
}, ae = () => {
  let n = 0;
  const e = {}, t = (s) => {
    const i = n++;
    return e[s.toString()] = i, i;
  };
  return { addInnovation: t, getInnovation: (s) => e[s.toString()] ?? t(s) };
}, ce = (n = {}) => {
  var g;
  const e = { ...Q, ...n }, t = O(e.loggingPlugins);
  let o = Array(e.initialPopulationSize), s = [];
  const i = ae(), r = le(e.hallOfFameSize);
  for (let f = 0; f < e.initialPopulationSize; f++)
    o[f] = U(i, e);
  (g = t.handleInitialPopulation) == null || g.call(t, { population: o, config: e });
  const l = () => o, u = () => o.entries();
  let a = 0;
  const d = () => a, p = () => a >= e.maxGenerations;
  return {
    getPopulation: l,
    getPopulationIndexed: u,
    getCurrentGeneration: d,
    complete: p,
    evolve: () => {
      var m;
      switch (e.fitnessSort) {
        case "max":
          break;
        case "min":
          o.forEach((h) => h.fitness *= -1);
      }
      o.forEach((h) => r.tryAdding(h));
      const { nextPopulation: f, nextSpecies: G } = te(
        o,
        s,
        i,
        e,
        a
      );
      o = f, s = G, a++, (m = t.handleEvolve) == null || m.call(t, {
        population: o,
        config: e,
        generation: a,
        species: s,
        bestGenomes: r.getBestGenomes(),
        complete: p()
      });
    },
    getBestGenomes: r.getBestGenomes
  };
};
export {
  ce as TinyNEAT,
  re as plugins
};
