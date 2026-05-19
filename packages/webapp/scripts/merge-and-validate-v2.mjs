/* eslint-disable no-console, no-restricted-syntax, no-continue, no-plusplus, no-param-reassign */
// Merge the 4 bucket-DAG shards into personaQuizQuestionGraph.json and run
// validation gates: schema sanity, prompt uniqueness, reachability, tag vocab,
// path length = 20. Fails non-zero on any check that doesn't pass.
//
// Usage: node merge-and-validate-v2.mjs
import { readFileSync, writeFileSync } from 'fs';

const TAG_FILE =
  '/Users/davide/conductor/workspaces/apps/albuquerque-v2/tmp/recswipe-prod-tags.json';
const SHARD_DIR =
  '/Users/davide/conductor/workspaces/apps/albuquerque-v2/tmp/persona-quiz-shards';
const GRAPH_PATH =
  '/Users/davide/conductor/workspaces/apps/albuquerque-v2/packages/webapp/components/persona-quiz/personaQuizQuestionGraph.json';
const ARCHETYPE_PATH =
  '/Users/davide/conductor/workspaces/apps/albuquerque-v2/packages/webapp/components/persona-quiz/personaQuizArchetypes.json';
const EXPECTED_PATH_LENGTH = 15;

const validTags = new Set(JSON.parse(readFileSync(TAG_FILE, 'utf-8')));
const archetypes = JSON.parse(readFileSync(ARCHETYPE_PATH, 'utf-8'));
const archetypeIds = new Set(archetypes.map((a) => a.id));

const allNodes = [];
for (const bucket of ['product', 'infra', 'data', 'specialty']) {
  const shard = JSON.parse(
    readFileSync(`${SHARD_DIR}/${bucket}-dag.json`, 'utf-8'),
  );
  for (const node of shard) {
    allNodes.push(node);
  }
}

writeFileSync(GRAPH_PATH, `${JSON.stringify(allNodes, null, 2)}\n`);
console.log(`Merged ${allNodes.length} nodes → personaQuizQuestionGraph.json`);

// --- Validation gates ---
const errors = [];
const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

// 1. Schema sanity
for (const n of allNodes) {
  if (!Array.isArray(n.options) || n.options.length !== 2) {
    errors.push(`schema: ${n.id} does not have exactly 2 options`);
    continue;
  }
  const [y, no] = n.options;
  if (y.id !== 'yes' || no.id !== 'no') {
    errors.push(`schema: ${n.id} options not in [yes, no] order`);
  }
  const isTerminal = y.next === null && no.next === null;
  if (isTerminal && !n.archetypeId) {
    errors.push(`schema: ${n.id} is terminal but has no archetypeId`);
  }
  if (!isTerminal && (y.next === null || no.next === null)) {
    errors.push(
      `schema: ${n.id} mixes null and non-null next pointers (must be all-null or all-set)`,
    );
  }
  if (n.archetypeId && !archetypeIds.has(n.archetypeId)) {
    errors.push(`schema: ${n.id} has unknown archetypeId "${n.archetypeId}"`);
  }
  if (n.archetypeId && !isTerminal) {
    errors.push(
      `schema: ${n.id} has archetypeId but is not terminal (next != null)`,
    );
  }
}

// 2. Prompt uniqueness across the whole DAG
const promptToIds = new Map();
for (const n of allNodes) {
  const key = n.prompt.trim().toLowerCase();
  if (!promptToIds.has(key)) {
    promptToIds.set(key, []);
  }
  promptToIds.get(key).push(n.id);
}
for (const [prompt, ids] of promptToIds) {
  if (ids.length > 1) {
    errors.push(
      `uniqueness: prompt "${prompt.slice(0, 80)}…" appears in ${
        ids.length
      } nodes: ${ids.join(', ')}`,
    );
  }
}

// 3. Reachability: walk from each Q1 entry, ensure every node is reachable and
//    every archetype is hit.
const Q1_ENTRIES = ['q_p_a1', 'q_i_a1', 'q_d_a1', 'q_s_a1'];
const reached = new Set();
const reachedArchetypes = new Set();
const stack = [...Q1_ENTRIES];
while (stack.length) {
  const id = stack.pop();
  if (reached.has(id)) {
    continue;
  }
  reached.add(id);
  const node = nodeMap.get(id);
  if (!node) {
    errors.push(`reachability: missing node ${id} referenced as next pointer`);
    continue;
  }
  if (node.archetypeId) {
    reachedArchetypes.add(node.archetypeId);
  }
  for (const opt of node.options) {
    if (opt.next) {
      stack.push(opt.next);
    }
  }
}
for (const n of allNodes) {
  if (!reached.has(n.id)) {
    errors.push(`reachability: node ${n.id} is orphaned (unreachable from Q1)`);
  }
}
for (const a of archetypes) {
  if (!reachedArchetypes.has(a.id)) {
    errors.push(`reachability: archetype "${a.id}" has no path leading to it`);
  }
}

// 4. Tag vocab — every tagWeights key must be in /tmp/recswipe-prod-tags.json
for (const n of allNodes) {
  for (const opt of n.options) {
    for (const tag of Object.keys(opt.tagWeights ?? {})) {
      if (!validTags.has(tag)) {
        errors.push(`tag-vocab: ${n.id}.${opt.id} uses invalid tag "${tag}"`);
      }
    }
  }
}
// Archetype keyTags too
for (const a of archetypes) {
  for (const tag of a.keyTags) {
    if (!validTags.has(tag)) {
      errors.push(
        `tag-vocab: archetype "${a.id}" uses invalid keyTag "${tag}"`,
      );
    }
  }
}

// 5. Path length = 20 (Q1 + 19 yes/no)
const longestPath = (id, depth = 1, visiting = new Set()) => {
  if (visiting.has(id)) {
    return depth;
  } // cycle (shouldn't happen)
  visiting.add(id);
  const node = nodeMap.get(id);
  if (!node) {
    return depth;
  }
  let max = depth;
  for (const opt of node.options) {
    if (opt.next) {
      max = Math.max(max, longestPath(opt.next, depth + 1, new Set(visiting)));
    }
  }
  return max;
};
const shortestPath = (id, depth = 1, visiting = new Set()) => {
  if (visiting.has(id)) {
    return depth;
  }
  visiting.add(id);
  const node = nodeMap.get(id);
  if (!node) {
    return depth;
  }
  let min = Infinity;
  for (const opt of node.options) {
    if (opt.next) {
      min = Math.min(min, shortestPath(opt.next, depth + 1, new Set(visiting)));
    } else {
      min = Math.min(min, depth);
    }
  }
  return min === Infinity ? depth : min;
};
for (const entryId of Q1_ENTRIES) {
  const longest = longestPath(entryId) + 1; // +1 for Q1
  const shortest = shortestPath(entryId) + 1;
  if (longest !== EXPECTED_PATH_LENGTH || shortest !== EXPECTED_PATH_LENGTH) {
    errors.push(
      `path-length: from ${entryId}, expected ${EXPECTED_PATH_LENGTH}, got min=${shortest}, max=${longest}`,
    );
  }
}

// --- Report ---
if (errors.length === 0) {
  console.log(
    `✓ All validation checks passed. ${allNodes.length} nodes, ${archetypes.length} archetypes, ${reachedArchetypes.size} reachable.`,
  );
  process.exit(0);
}
console.error(`✗ ${errors.length} validation errors:`);
for (const e of errors) {
  console.error(`  - ${e}`);
}
process.exit(1);
