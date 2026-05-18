// Walk the question graph and replace `next: null` on nodes that are not at
// the new TOTAL_DEPTH with the correct child id (q_<prefix>_<path>y /
// q_<prefix>_<path>n). Used when extending an existing graph to a deeper level.
// Usage: node extend-terminals.mjs <graph-json-path>
import { readFileSync, writeFileSync } from 'fs';

const [, , graphPath] = process.argv;
const TOTAL_DEPTH = 9;

const graph = JSON.parse(readFileSync(graphPath, 'utf-8'));

const updated = graph.map((q) => {
  // Skip Q1 (multi-choice) — its `next` points to bucket roots, not encoded by path
  if (q.id === 'q1_domain') return q;
  // Yes/no nodes have ids `q_<prefix>_<path>`. Derive path length from id.
  // e.g. q_p_root → depth 1, q_p_y → 2, q_p_yy → 3, q_p_yyyyy → 6
  const match = /^q_([a-z])_(.+)$/.exec(q.id);
  if (!match) return q;
  const [, bucketLetter, rest] = match;
  const depthLevel = rest === 'root' ? 1 : rest.length + 1;
  // If this node is at the new TOTAL_DEPTH, both options should be null (terminal).
  // Otherwise children should be q_<bucketLetter>_<rest+y> / q_<bucketLetter>_<rest+n>.
  if (depthLevel >= TOTAL_DEPTH) return q;
  const childBase = rest === 'root' ? '' : rest;
  const yesNext = `q_${bucketLetter}_${childBase}y`;
  const noNext = `q_${bucketLetter}_${childBase}n`;
  return {
    ...q,
    options: q.options.map((opt, idx) => ({
      ...opt,
      next: opt.next ?? (idx === 0 ? yesNext : noNext),
    })),
  };
});

writeFileSync(graphPath, `${JSON.stringify(updated, null, 2)}\n`);

const updatedCount = updated.filter((q, i) =>
  q.options.some((o, oi) => o.next !== graph[i].options[oi].next),
).length;
console.log(`Updated ${updatedCount} nodes — terminal pointers reconciled for TOTAL_DEPTH=${TOTAL_DEPTH}`);
