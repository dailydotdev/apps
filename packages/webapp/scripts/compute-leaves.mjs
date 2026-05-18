// Enumerate all leaf paths in the persona-quiz graph + accumulated tag profile.
// Output: JSON array of { bucketId, signature, path, topTags, parentPath, finalQuestion, finalAnswer }.
// Usage: node compute-leaves.mjs <graph-json-path>
import { readFileSync } from 'fs';

const [, , graphPath] = process.argv;
const Q1_ID = 'q1_domain';
const YES_NO_DEPTH = 9;

const BUCKETS = {
  q_p: { id: 'product', label: 'Building things people see and use', seedTags: { frontend: 1, 'web-development': 1 } },
  q_i: { id: 'infra', label: 'Building the stuff underneath products', seedTags: { backend: 1, infrastructure: 1 } },
  q_d: { id: 'data', label: 'Working with data, models, or AI', seedTags: { 'data-science': 1, 'machine-learning': 1, ai: 1 } },
  q_s: { id: 'specialty', label: 'Niche / non-eng (games, embedded, leadership, founder)', seedTags: { 'game-development': 1, embedded: 1 } },
};

const graph = JSON.parse(readFileSync(graphPath, 'utf-8'));
const byId = new Map(graph.map((q) => [q.id, q]));

const nodeIdFor = (prefix, path) =>
  path.length === 0 ? `${prefix}_root` : `${prefix}_${path.join('')}`;

const applyWeights = (base, w) => {
  const next = { ...base };
  for (const [t, n] of Object.entries(w ?? {})) next[t] = (next[t] ?? 0) + n;
  return next;
};

const out = [];
for (const [prefix, bucket] of Object.entries(BUCKETS)) {
  // 2^DEPTH leaf paths per bucket (e.g. 32 for depth 5)
  const numLeaves = 2 ** YES_NO_DEPTH;
  for (let i = 0; i < numLeaves; i += 1) {
    const path = [];
    for (let bit = YES_NO_DEPTH - 1; bit >= 0; bit -= 1) {
      path.push(((i >> bit) & 1) === 1 ? 'y' : 'n');
    }

    // Walk root → ... → terminal, accumulating tags and building signature.
    let tags = { ...bucket.seedTags };
    const sigParts = [`${Q1_ID}:${bucket.id}`];
    const promptChain = [];
    let finalQuestion = null;
    let finalAnswer = null;
    for (let p = 0; p < path.length; p += 1) {
      const ancestorId = nodeIdFor(prefix, path.slice(0, p));
      const ancestor = byId.get(ancestorId);
      if (!ancestor) {
        throw new Error(`Missing ancestor ${ancestorId} for leaf path ${prefix}_${path.join('')}`);
      }
      const optIdx = path[p] === 'y' ? 0 : 1;
      const opt = ancestor.options[optIdx];
      tags = applyWeights(tags, opt.tagWeights);
      sigParts.push(`${ancestorId}:${opt.id}`);
      promptChain.push(`${ancestor.prompt} → ${opt.id.toUpperCase()}`);
      if (p === path.length - 1) {
        finalQuestion = ancestor.prompt;
        finalAnswer = opt.id;
      }
    }

    const topTags = Object.entries(tags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([t, w]) => `${t}(${w})`);

    out.push({
      bucketId: bucket.id,
      bucketLabel: bucket.label,
      signature: sigParts.join('|'),
      path: path.join(''),
      topTags,
      parentPath: promptChain.join('\n  → '),
      finalQuestion,
      finalAnswer,
    });
  }
}

console.log(JSON.stringify(out, null, 2));
