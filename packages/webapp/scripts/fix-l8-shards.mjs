// Some L8 subagents emitted a shorthand schema (`nodeId`, `yes`/`no` arrays of
// `{tag, weight}`) instead of the full PersonaQuizQuestion shape. Adapt them
// using the parent-data files that already contain yesNextId / noNextId.
import { readFileSync, writeFileSync, existsSync } from 'fs';

const SHARDS = [
  { bucket: 'product', chunk: 'B' },
  { bucket: 'infra', chunk: 'A' },
  { bucket: 'infra', chunk: 'B' },
  { bucket: 'data', chunk: 'A' },
  { bucket: 'data', chunk: 'B' },
  { bucket: 'specialty', chunk: 'A' },
  { bucket: 'specialty', chunk: 'B' },
];

const SHARD_DIR = '/tmp/persona-quiz-shards';

let totalFixed = 0;
for (const { bucket, chunk } of SHARDS) {
  const shardPath = `${SHARD_DIR}/${bucket}-L8-${chunk}.json`;
  const dataPath = `${SHARD_DIR}/L8-${bucket}-${chunk}-data.json`;
  if (!existsSync(shardPath) || !existsSync(dataPath)) {
    console.warn(`Skipping ${shardPath} — file missing`);
    continue;
  }
  const raw = JSON.parse(readFileSync(shardPath, 'utf-8'));
  const parentData = JSON.parse(readFileSync(dataPath, 'utf-8'));
  const nextById = new Map(
    parentData.map((p) => [p.nodeId, { yes: p.yesNextId, no: p.noNextId }]),
  );

  const toWeights = (arr) => {
    if (!arr) return {};
    if (Array.isArray(arr)) {
      const out = {};
      for (const e of arr) {
        if (e && typeof e.tag === 'string' && typeof e.weight === 'number') {
          out[e.tag] = e.weight;
        }
      }
      return out;
    }
    if (typeof arr === 'object') return arr;
    return {};
  };

  const adapted = raw.map((q) => {
    if (q.options) return q; // already in the right shape
    const id = q.id ?? q.nodeId;
    const nexts = nextById.get(id);
    if (!nexts) {
      throw new Error(`No parent data entry for ${id} in ${dataPath}`);
    }
    return {
      id,
      axis: `${bucket}_L8`,
      prompt: q.prompt,
      cols: 2,
      options: [
        { id: 'yes', label: 'Yes', tagWeights: toWeights(q.yes), next: nexts.yes },
        { id: 'no', label: 'No', tagWeights: toWeights(q.no), next: nexts.no },
      ],
    };
  });

  writeFileSync(shardPath, `${JSON.stringify(adapted, null, 2)}\n`);
  totalFixed += adapted.length;
  console.log(`Fixed ${bucket}-L8-${chunk}: ${adapted.length} nodes`);
}
console.log(`Total adapted entries: ${totalFixed}`);
