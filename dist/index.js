const I = (n) => {
  const e = {}, t = {};
  for (const o of n) {
    if (!o.enabled)
      continue;
    const [i, s] = o.connection;
    i in e || (e[i] = []), s in t || (t[s] = []), s in e || (e[s] = []), i in t || (t[i] = []), e[i].push(s), t[s].push(i);
  }
  return { inputToOutput: e, outputToInput: t };
}, w = (n, e) => {
  const t = {};
  for (const [s, l] of Object.entries(e))
    t[parseInt(s)] = l.length;
  const o = Object.entries(e).filter(([, s]) => s.length === 0).map(([s]) => +s), i = [];
  for (; o.length > 0; ) {
    const s = o.pop();
    i.push(s);
    for (const l of n[s])
      --t[l] === 0 && o.push(l);
  }
  return i.length === Object.keys(e).length ? i : [];
}, z = (n) => 1 / (1 + Math.exp(-n)), F = (n) => 2 / (1 + Math.exp(-n)) - 1, M = (n) => 1 / (1 + Math.exp(-4.9 * n)), E = (n) => Math.tanh(n), R = (n) => n > 0 ? n : 0, C = {
  sigmoid: z,
  modifiedSigmoid: M,
  tanh: E,
  relu: R,
  posAndNegSigmoid: F
}, g = (n) => Math.random() <= n, v = (n) => n[A(n)], A = (n) => Math.round(Math.random() * (n.length - 1)), N = (n) => (2 * Math.random() - 1) * n, T = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  chooseRandom: v,
  chooseRandomIndex: A,
  random: g,
  uniformRandomWeight: N
}, Symbol.toStringTag, { value: "Module" })), k = (n, e, t, o) => {
  const i = {};
  for (const c of t)
    i[c.connection.toString()] = c.weight;
  const { inputToOutput: s, outputToInput: l } = I(t), r = w(s, l);
  if (r.length === 0)
    throw new Error(
      "Received an unexpected graph structure, make sure the ANN is configured correctly."
    );
  return { process: (c) => {
    if (c.length !== n)
      throw new Error(
        `Received inputs of length ${c.length}, but expected length ${n}`
      );
    const u = Array(t.length).fill(0);
    for (const a of r)
      if (a < n)
        u[a] = c[a];
      else {
        let m = 0;
        for (const p of l[a])
          m += i[[p, a].toString()] * u[p];
        u[a] = o(m);
      }
    const d = Array(e).fill(0);
    for (let a = 0; a < u.length; a++)
      r[a] >= n && r[a] < n + e && (d[r[a] - n] = u[a]);
    return d;
  } };
}, B = (n, e) => n.weight - e.weight, L = (n, e) => {
  n.weight += N(e);
}, $ = (n) => ({ ...n }), W = (n, e) => {
  const t = (n.weight + e.weight) / 2;
  return { ...n, weight: t };
}, D = (n, e) => ({ ...n, weight: N(e) }), V = (n) => ({ ...n, weight: 1 }), q = (n, e) => ({ ...n, weight: e.weight }), H = {
  // Configuration options for the artificial neural network
  weightMutationRange: 1,
  // The maximum magnitude of a mutation that changes the weight of a connection
  activation: "posAndNegSigmoid"
}, _ = (n = {}) => {
  const e = { ...H, ...n };
  return {
    createNetwork: (t, o, i) => k(
      t,
      o,
      i,
      C[e.activation]
    ),
    calculateGeneDistance: B,
    mutateGeneWeight: (t) => L(t, e.weightMutationRange),
    cloneGene: $,
    averageGenes: W,
    configureRandomGene: (t) => D(t, e.weightMutationRange),
    configureNewGene: V,
    configureCloneGene: q
  };
}, O = (n) => ({ handleInitialPopulation: (o) => n.forEach((i) => {
  var s;
  return (s = i.handleInitialPopulation) == null ? void 0 : s.call(i, o);
}), handleEvolve: (o) => n.forEach((i) => {
  var s;
  return (s = i.handleEvolve) == null ? void 0 : s.call(i, o);
}) }), j = () => ({ handleInitialPopulation: (t) => {
  console.log("Beginning NEAT"), console.log("______________"), console.log(
    `Initial Population Size: ${t.config.initialPopulationSize}`
  ), console.log("Complete Config: "), console.log(t.config), console.log("");
}, handleEvolve: (t) => {
  var o;
  t.complete ? console.log(`NEAT completed at generation ${t.generation}:`) : console.log(`Results of generation ${t.generation}:`), console.log(`Population Size: ${t.population.length}`), console.log(`Number of Species: ${t.species.length}`), console.log(`Max Fitness: ${(o = t.bestGenomes) == null ? void 0 : o[0].fitness}`), t.complete && (console.log("Best Genomes: "), console.log(t.bestGenomes)), console.log("");
} }), ie = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ANNPlugin: _,
  Activation: C,
  ConsoleLogger: j,
  LoggingManager: O,
  createAdjacencyList: I,
  helpers: T,
  topologicalSort: w
}, Symbol.toStringTag, { value: "Module" })), J = {
  initialPopulationSize: 150,
  // Number of networks in the population
  maxGenerations: 100,
  // Stopping point for evolution
  maximumStagnation: 15,
  // Maximum number of generations a species is allowed to stay the same fitness before it is removed
  excessCoefficient: 1,
  // Coefficient representing how important excess genes are in measuring compatibility
  disjointCoefficient: 1,
  // Coefficient for disjoint genes
  weightDifferenceCoefficient: 0.4,
  // Coefficient for average weight difference (highly recommended for tuning)
  compatibilityThreshold: 3,
  // Threshold for speciation (highly recommended for tuning)
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
  minimumSpeciesSize: 2,
  // The minimum number of offspring a species can have
  hallOfFameSize: 10,
  // The number of top-performing individuals to store
  inputSize: 3,
  // The number of inputs to each neural network
  outputSize: 2,
  // The number of outputs of each neural network
  // Plugin for the specific type of neural network (ANN, RNN, etc)
  nnPlugin: _(),
  // Plugins for logging data
  loggingPlugins: [j()]
}, K = (n, e) => {
  const t = [];
  for (let i = 0; i < e.inputSize; i++)
    for (let s = 0; s < e.outputSize; s++) {
      const l = [i, e.inputSize + s], r = n.getInnovation(l);
      t.push(
        e.nnPlugin.configureRandomGene({
          connection: l,
          enabled: !0,
          innovationNumber: r
        })
      );
    }
  const o = e.inputSize + e.outputSize - 1;
  return y(t, o, e);
}, y = (n, e, t) => {
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
}, Q = (n, e, t) => {
  e.genes.length > n.genes.length && ([n, e] = [e, n]);
  const o = n.genes.length, i = e.genes.length, s = o - i;
  let l = 0, r = 0, h = 0, c = 0, u = 0;
  const d = o > t.largeNetworkSize ? o : 1;
  for (; c < o && u < i; )
    n.genes[c].innovationNumber === e.genes[u].innovationNumber ? (r += t.nnPlugin.calculateGeneDistance(
      n.genes[c++],
      n.genes[u++]
    ), h++) : n.genes[c].innovationNumber > e.genes[u].innovationNumber ? (l++, u++) : n.genes[c].innovationNumber < e.genes[u].innovationNumber && (l++, c++);
  return t.excessCoefficient * s / d + t.disjointCoefficient * l / d + t.weightDifferenceCoefficient * (r / h);
}, S = (n, e, t) => {
  const o = e.adjustedFitness === n.adjustedFitness;
  e.adjustedFitness > n.adjustedFitness && ([n, e] = [e, n]);
  const i = o ? Math.max(n.maxGeneIndex, e.maxGeneIndex) : n.maxGeneIndex, s = n.genes.length, l = e.genes.length, r = [];
  let h = 0, c = 0;
  for (; h < s; ) {
    const u = n.genes[h], d = e.genes[c];
    if (c >= l) {
      const a = t.nnPlugin.cloneGene(u);
      g(t.reenableConnectionProbability) && (a.enabled = !0), r.push(), h++;
    } else if (u.innovationNumber === d.innovationNumber) {
      let a;
      g(t.mateByChoosingProbability) ? a = t.nnPlugin.cloneGene(
        Math.random() < 0.5 ? u : d
      ) : a = t.nnPlugin.averageGenes(
        u,
        d
      ), g(t.reenableConnectionProbability) && (a.enabled = !0), r.push(a), h++, c++;
    } else if (u.innovationNumber > d.innovationNumber) {
      const a = t.nnPlugin.cloneGene(u);
      g(t.reenableConnectionProbability) && (a.enabled = !0), r.push(a), h++, c++;
    } else if (u.innovationNumber < d.innovationNumber) {
      if (o) {
        const a = t.nnPlugin.cloneGene(
          d
        );
        g(t.reenableConnectionProbability) && (a.enabled = !0), r.push(a), c++;
      }
      h++;
    }
  }
  return { newGenes: r, maxGeneIndex: i };
}, U = (n, e, t, o, i, s, l) => {
  const r = Array.from(
    { length: o + 1 },
    (b, x) => x
  ), h = r.slice();
  h.splice(i, s);
  let c = v(h);
  const u = r.slice(i);
  let d = v(u);
  if (c === d)
    return;
  const a = t.findIndex((b) => b === c), m = t.findIndex(
    (b) => b === d
  );
  a > m && ([c, d] = [d, c]);
  const p = n.find(
    (b) => b.connection[0] === c && b.connection[1] === d
  );
  if (p !== void 0) {
    p.enabled = !0;
    return;
  }
  const f = [c, d], G = e.getInnovation(f);
  n.push(
    l.nnPlugin.configureNewGene({
      connection: f,
      enabled: !0,
      innovationNumber: G
    })
  );
}, X = (n, e, t, o) => {
  const i = v(n);
  i.enabled = !1;
  const s = t + 1, l = [
    i.connection[0],
    s
  ], r = [
    s,
    i.connection[1]
  ];
  return n.push(
    o.nnPlugin.configureNewGene({
      connection: l,
      enabled: !0,
      innovationNumber: e.getInnovation(l)
    })
  ), n.push(
    o.nnPlugin.configureCloneGene(
      {
        connection: r,
        enabled: !0,
        innovationNumber: e.getInnovation(r)
      },
      i
    )
  ), s;
}, Y = (n, e, t) => {
  for (let i = 0; i < e.length; i++)
    e[i] = e[i].slice(0, 1);
  const o = e.map(() => ({
    distance: 1 / 0,
    i: 0
  }));
  for (const i of n) {
    let s = !1;
    for (const [l, r] of e.entries()) {
      const h = Q(
        r[0],
        i,
        t
      );
      h < t.compatibilityThreshold && !s && (r.push(i), h < o[l].distance && (o[l] = {
        distance: h,
        i: r.length - 1
      }), s = !0);
    }
    s || (e.push([i]), o.push({
      distance: 1 / 0,
      i: 0
    }));
  }
  for (const [i, s] of e.entries())
    s[0] = s.splice(o[i].i, 1)[0];
}, Z = (n, e, t, o) => {
  Y(n, e, o), ee(e);
  const i = ne(n, e), s = [];
  for (const [l, r] of e.entries()) {
    const h = r.sort(
      (d, a) => a.adjustedFitness - d.adjustedFitness
      // This currently assumes positive fitness is ideal
    ), c = h.slice(
      0,
      Math.max(
        r.length * o.survivalThreshold,
        o.minimumSpeciesSize
      )
    ), u = h[0];
    s.push(
      y(
        structuredClone(u.genes),
        u.maxGeneIndex,
        o
      )
    );
    for (let d = 0; d < Math.max(i[l] - 1, o.minimumSpeciesSize); d++) {
      const a = v(c);
      let m = v(c);
      g(o.interspeciesMatingRate) && (m = v(v(e)));
      let p, f;
      if (g(o.mateOnlyProbability)) {
        const G = S(a, m, o);
        p = G.newGenes, f = G.maxGeneIndex;
      } else {
        if (g(o.mutateOnlyProbability))
          p = structuredClone(a.genes), f = a.maxGeneIndex;
        else {
          const P = S(a, m, o);
          p = P.newGenes, f = P.maxGeneIndex;
        }
        const { inputToOutput: G, outputToInput: b } = I(p), x = w(G, b);
        g(o.addLinkProbability) ? U(
          p,
          t,
          x,
          f,
          o.inputSize,
          o.outputSize,
          o
        ) : g(o.addNodeProbability) && (f = X(
          p,
          t,
          f,
          o
        ));
        for (const P of p)
          g(o.mutateWeightProbability) && o.nnPlugin.mutateGeneWeight(P);
      }
      s.push(
        y(p, f, o)
      );
    }
  }
  return s;
}, ee = (n) => {
  for (const e of n)
    for (const t of e)
      t.adjustedFitness = t.fitness / e.length;
}, ne = (n, e) => {
  const t = e.map((i) => i.reduce((s, l) => s + l.adjustedFitness, 0) / i.length), o = t.reduce(
    (i, s) => i + s,
    0
  );
  return t.map(
    (i) => Math.round(i / o * n.length)
  );
}, te = (n) => {
  const e = Array(n);
  let t = -1 / 0;
  return { tryAdding: (s) => {
    var r;
    if (s.fitness < t)
      return;
    const l = e.findIndex(
      (h) => h && h.fitness <= s.fitness
    );
    l === -1 ? e.unshift(s) : l === e.length - 1 ? e.push(s) : e.splice(l, 0, s), e.length > n && e.pop(), t = ((r = e.at(-1)) == null ? void 0 : r.fitness) ?? -1 / 0;
  }, getBestGenomes: () => e };
}, oe = () => {
  let n = 0;
  const e = {}, t = (i) => {
    const s = n++;
    return e[i.toString()] = s, s;
  };
  return { addInnovation: t, getInnovation: (i) => e[i.toString()] ?? t(i) };
}, se = (n = {}) => {
  var m;
  const e = { ...J, ...n }, t = O(e.loggingPlugins);
  let o = Array(e.initialPopulationSize);
  const i = [], s = oe(), l = te(e.hallOfFameSize);
  for (let p = 0; p < e.initialPopulationSize; p++)
    o[p] = K(s, e);
  (m = t.handleInitialPopulation) == null || m.call(t, { population: o, config: e });
  const r = () => o, h = () => o.entries();
  let c = 0;
  const u = () => c, d = () => c >= e.maxGenerations;
  return {
    getPopulation: r,
    getPopulationIndexed: h,
    getCurrentGeneration: u,
    complete: d,
    evolve: () => {
      var p;
      switch (e.fitnessSort) {
        case "max":
          break;
        case "min":
          o.forEach((f) => f.fitness *= -1);
      }
      o.forEach((f) => l.tryAdding(f)), o = Z(
        o,
        i,
        s,
        e
      ), c++, (p = t.handleEvolve) == null || p.call(t, {
        population: o,
        config: e,
        generation: c,
        species: i,
        bestGenomes: l.getBestGenomes(),
        complete: d()
      });
    },
    getBestGenomes: l.getBestGenomes
  };
};
export {
  se as TinyNEAT,
  ie as plugins
};
