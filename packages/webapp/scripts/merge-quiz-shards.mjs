// Merge persona-quiz subagent shard files into the cumulative graph JSON.
// Filters tag weights against /tmp/recswipe-prod-tags.json.
// Usage: node merge-quiz-shards.mjs <graph-json-path> <shard-dir> <level-tag>
//        e.g. node merge-quiz-shards.mjs ../components/persona-quiz/personaQuizQuestionGraph.json /tmp/persona-quiz-shards L1
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
} from 'fs';
import { resolve } from 'path';

const [, , graphPath, shardDir, levelTag] = process.argv;
const validTags = new Set(
  JSON.parse(readFileSync('/tmp/recswipe-prod-tags.json', 'utf-8')),
);

const filterWeights = (weights) => {
  if (!weights || typeof weights !== 'object') return {};
  const out = {};
  for (const [tag, w] of Object.entries(weights)) {
    if (!validTags.has(tag)) continue;
    const n = typeof w === 'number' ? w : Number(w);
    if (!Number.isFinite(n) || n <= 0) continue;
    out[tag] = Math.max(1, Math.min(2, Math.round(n)));
  }
  return out;
};

const cleanQuestion = (q) => ({
  ...q,
  options: q.options.map((opt) => ({
    ...opt,
    tagWeights: filterWeights(opt.tagWeights),
  })),
});

const existing = existsSync(graphPath)
  ? JSON.parse(readFileSync(graphPath, 'utf-8'))
  : [];
const byId = new Map(existing.map((q) => [q.id, q]));

// Only the answer-shard files written by question-authoring agents.
// Format: `<bucket>-L<n>.json` or `<bucket>-L<n>-<chunk>.json` (when the level
// is split across multiple agents) where bucket ∈ {product, infra, data, specialty}.
const shardFilePattern = new RegExp(
  `^(product|infra|data|specialty)-${levelTag}(-[A-Z]+)?\\.json$`,
);
const shardFiles = readdirSync(shardDir).filter((f) => shardFilePattern.test(f));
let added = 0;
let droppedTags = 0;
for (const file of shardFiles) {
  const raw = JSON.parse(readFileSync(resolve(shardDir, file), 'utf-8'));
  for (const q of raw) {
    const cleaned = cleanQuestion(q);
    for (let i = 0; i < q.options.length; i += 1) {
      const before = Object.keys(q.options[i].tagWeights ?? {}).length;
      const after = Object.keys(cleaned.options[i].tagWeights).length;
      droppedTags += before - after;
    }
    if (!byId.has(cleaned.id)) added += 1;
    byId.set(cleaned.id, cleaned);
  }
}

const merged = [...byId.values()];
writeFileSync(graphPath, `${JSON.stringify(merged, null, 2)}\n`);
console.log(
  `Merged ${shardFiles.length} shards (${levelTag}) → ${merged.length} total nodes (+${added} new, ${droppedTags} invalid tags dropped)`,
);
