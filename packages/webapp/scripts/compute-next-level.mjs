// Compute parent tag profiles for nodes at a given depth in the persona-quiz graph.
// Output: JSON with { bucketId, nodeId, path, parentTags, yesNextId, noNextId, parentPrompt } per node.
// Usage: node compute-next-level.mjs <graph-json-path> <target-depth>
//   target-depth: 1 (root) … 5 (terminal). Children of the previous level.
import { readFileSync } from 'fs';

const [, , graphPath, depthStr] = process.argv;
const targetDepth = Number(depthStr);
const TOTAL_DEPTH = 9;

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
  const numPaths = 2 ** (targetDepth - 1);
  for (let i = 0; i < numPaths; i += 1) {
    const path = [];
    for (let bit = targetDepth - 2; bit >= 0; bit -= 1) {
      path.push(((i >> bit) & 1) === 1 ? 'y' : 'n');
    }
    const nodeId = nodeIdFor(prefix, path);

    // Walk from root, accumulating tags along the chosen branches.
    let parentTags = { ...bucket.seedTags };
    const parentPrompts = [];
    for (let p = 0; p < path.length; p += 1) {
      const ancestorId = nodeIdFor(prefix, path.slice(0, p));
      const ancestor = byId.get(ancestorId);
      if (!ancestor) {
        throw new Error(`Missing ancestor ${ancestorId} for ${nodeId}`);
      }
      const optIdx = path[p] === 'y' ? 0 : 1;
      parentTags = applyWeights(parentTags, ancestor.options[optIdx].tagWeights);
      parentPrompts.push(`${ancestor.prompt}  →  ${path[p] === 'y' ? 'YES' : 'NO'}`);
    }

    const isTerminal = targetDepth === TOTAL_DEPTH;
    const yesNextId = isTerminal ? null : nodeIdFor(prefix, [...path, 'y']);
    const noNextId = isTerminal ? null : nodeIdFor(prefix, [...path, 'n']);

    // Format parent tags sorted by weight, top 12 for prompt brevity.
    const sortedTags = Object.entries(parentTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 12)
      .map(([t, w]) => `${t}(${w})`)
      .join(', ');

    out.push({
      bucketId: bucket.id,
      bucketLabel: bucket.label,
      nodeId,
      path: path.join('') || '(root)',
      parentTagsRaw: parentTags,
      parentTagsCompact: sortedTags,
      yesNextId,
      noNextId,
      parentPath: parentPrompts.length ? parentPrompts.join('\n   then  ') : '(this is the bucket entry)',
      isTerminal,
    });
  }
}

console.log(JSON.stringify(out, null, 2));
