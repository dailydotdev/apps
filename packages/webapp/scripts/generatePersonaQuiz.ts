/* eslint-disable no-console, no-await-in-loop, no-continue, no-restricted-syntax, no-bitwise, no-plusplus */
/**
 * Persona-quiz content generator.
 *
 * Materialises a true non-convergent yes/no DAG (9 levels deep per bucket × 4
 * buckets) plus a deterministic reveal lookup keyed by the full answer path.
 * Both outputs are committed JSON consumed by `personaQuizSampleConfig.ts`.
 *
 * Run:
 *   ANTHROPIC_API_KEY=... pnpm --filter webapp generate:persona-quiz
 *
 * Idempotent — re-running skips already-generated entries, so a failed run can
 * be resumed.
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const TAG_FILE = '/tmp/recswipe-prod-tags.json';
const OUTPUT_DIR = resolve(__dirname, '../components/persona-quiz');
const GRAPH_PATH = resolve(OUTPUT_DIR, 'personaQuizQuestionGraph.json');
const REVEAL_PATH = resolve(OUTPUT_DIR, 'personaQuizRevealLookup.json');

const Q1_ID = 'q1_domain';
const YES_NO_DEPTH = 9;
const CONCURRENCY = 6;
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS_QUESTION = 400;
const MAX_TOKENS_REVEAL = 250;

interface Bucket {
  id: string;
  label: string;
  description: string;
  prefix: string;
  seedTags: Record<string, number>;
}

const BUCKETS: Bucket[] = [
  {
    id: 'product',
    label: 'Building things people see and use',
    description:
      'Frontend, mobile, full-stack — user-facing software (web apps, mobile apps, design systems)',
    prefix: 'q_p',
    seedTags: { frontend: 1, 'web-development': 1 },
  },
  {
    id: 'infra',
    label: 'Building the stuff underneath products',
    description:
      'Backend, devops, infrastructure, security, dev tools — APIs, services, platforms, observability',
    prefix: 'q_i',
    seedTags: { backend: 1, infrastructure: 1 },
  },
  {
    id: 'data',
    label: 'Working with data, models, or AI',
    description:
      'Data engineering, analytics, ML, AI applications, research — pipelines, models, dashboards, agents',
    prefix: 'q_d',
    seedTags: { 'data-science': 1, 'machine-learning': 1, ai: 1 },
  },
  {
    id: 'specialty',
    label: 'Something else (games, embedded, leadership, founder)',
    description:
      'Game dev, embedded systems, robotics, hardware, AR/VR, leadership, founder / non-eng — niches and adjacencies',
    prefix: 'q_s',
    seedTags: { 'game-development': 1, embedded: 1 },
  },
];

interface PersonaQuizOption {
  id: 'yes' | 'no';
  label: string;
  tagWeights: Record<string, number>;
  next: string | null;
}

interface PersonaQuizQuestion {
  id: string;
  axis: string;
  prompt: string;
  cols: number;
  options: PersonaQuizOption[];
}

interface RevealEntry {
  headline: string;
  description: string;
}

const validTags: Set<string> = new Set(
  JSON.parse(readFileSync(TAG_FILE, 'utf-8')) as string[],
);

const validTagList = [...validTags].sort().join(', ');

const sanitiseWeights = (
  weights: Record<string, unknown> | undefined,
): Record<string, number> => {
  const out: Record<string, number> = {};
  if (!weights || typeof weights !== 'object') {
    return out;
  }
  for (const [tag, raw] of Object.entries(weights)) {
    if (!validTags.has(tag)) {
      continue;
    }
    const n = typeof raw === 'number' ? raw : Number(raw);
    if (!Number.isFinite(n) || n <= 0) {
      continue;
    }
    out[tag] = Math.max(1, Math.min(2, Math.round(n)));
  }
  return out;
};

const applyWeights = (
  base: Record<string, number>,
  weights: Record<string, number>,
): Record<string, number> => {
  const next = { ...base };
  for (const [tag, w] of Object.entries(weights)) {
    next[tag] = (next[tag] ?? 0) + w;
  }
  return next;
};

const nodeIdFor = (prefix: string, path: ('y' | 'n')[]): string =>
  path.length === 0 ? `${prefix}_root` : `${prefix}_${path.join('')}`;

const parseJson = <T>(text: string): T => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '');
  }
  // Some LLMs prepend prose; try to extract the first JSON object.
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace > 0 || lastBrace < cleaned.length - 1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned) as T;
};

const callAnthropic = async (
  system: string,
  user: string,
  maxTokens: number,
  retries = 4,
): Promise<string> => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        if (res.status === 429 || res.status >= 500) {
          const backoff = 1000 * 2 ** attempt;
          console.warn(
            `Anthropic ${res.status}, retrying in ${backoff}ms — ${body.slice(
              0,
              200,
            )}`,
          );
          await new Promise((r) => {
            setTimeout(r, backoff);
          });
          continue;
        }
        throw new Error(`Anthropic ${res.status}: ${body}`);
      }
      const json = (await res.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      const text = json.content.find((c) => c.type === 'text')?.text;
      if (!text) {
        throw new Error('Anthropic response had no text content');
      }
      return text;
    } catch (err) {
      if (attempt === retries - 1) {
        throw err;
      }
      const backoff = 1000 * 2 ** attempt;
      await new Promise((r) => {
        setTimeout(r, backoff);
      });
    }
  }
  throw new Error('unreachable');
};

// --------------------------------------------------------------------------
// Question authoring
// --------------------------------------------------------------------------

const SYSTEM_QUESTION = `You author yes/no questions for a developer-persona quiz on daily.dev — a feed of programming content.

CRITICAL CONSTRAINTS:
1. The "prompt" must be a declarative statement the user reads in 1-2 seconds (10-18 words). Examples: "You write a lot of CSS.", "Your APIs are mostly GraphQL.", "You work with computer vision more than NLP."
2. The question must NARROW the user's sub-persona based on the path they took. Build on prior signal — never repeat themes already covered in this user's path, never ask generic questions.
3. Tag weights MUST come from the provided tag vocabulary. Tags outside it are silently dropped, so a question with no valid tags is wasted.
4. Each branch (yes / no) gets 3-5 tag weights. Weights are integers 1 or 2 (2 = highly definitional for that branch).
5. Tone: direct, slightly playful, no corporate speak. Imagine a dev friend trying to figure out what kind of content the user wants.

OUTPUT: strict JSON only, no markdown fences, no preamble.`;

const buildQuestionUser = (
  bucket: Bucket,
  path: ('y' | 'n')[],
  accumulatedTags: Record<string, number>,
): string => {
  const topTags = Object.entries(accumulatedTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 14)
    .map(([t, w]) => `${t}(${w})`)
    .join(', ');
  const pathStr =
    path.length === 0
      ? '(this is the first yes/no after they picked the bucket)'
      : path.map((a, i) => `Q${i + 1}: ${a === 'y' ? 'yes' : 'no'}`).join(', ');

  return `Bucket: "${bucket.label}" — ${bucket.description}.

Yes/no path so far (depth ${path.length + 1}/${YES_NO_DEPTH}): ${pathStr}

Accumulated tag profile (tag(weight)):
${topTags || '(seed tags only)'}

Valid tag vocabulary (use ONLY these in tagWeights):
${validTagList}

Author the next yes/no question. Output strict JSON:
{
  "prompt": "Declarative statement, 10-18 words.",
  "yes": { "tagWeights": { "tag-a": 1, "tag-b": 2 } },
  "no": { "tagWeights": { "tag-c": 1, "tag-d": 2 } }
}`;
};

const generateQuestion = async (
  bucket: Bucket,
  path: ('y' | 'n')[],
  accumulatedTags: Record<string, number>,
): Promise<PersonaQuizQuestion> => {
  const isTerminal = path.length === YES_NO_DEPTH - 1;
  const raw = await callAnthropic(
    SYSTEM_QUESTION,
    buildQuestionUser(bucket, path, accumulatedTags),
    MAX_TOKENS_QUESTION,
  );
  const parsed = parseJson<{
    prompt: string;
    yes?: { tagWeights?: Record<string, unknown> };
    no?: { tagWeights?: Record<string, unknown> };
  }>(raw);

  const yesWeights = sanitiseWeights(parsed.yes?.tagWeights);
  const noWeights = sanitiseWeights(parsed.no?.tagWeights);

  const id = nodeIdFor(bucket.prefix, path);
  const yesNext = isTerminal ? null : nodeIdFor(bucket.prefix, [...path, 'y']);
  const noNext = isTerminal ? null : nodeIdFor(bucket.prefix, [...path, 'n']);

  return {
    id,
    axis: `${bucket.id}_d${path.length + 1}`,
    prompt: parsed.prompt.trim(),
    cols: 2,
    options: [
      { id: 'yes', label: 'Yes', tagWeights: yesWeights, next: yesNext },
      { id: 'no', label: 'No', tagWeights: noWeights, next: noNext },
    ],
  };
};

// --------------------------------------------------------------------------
// Reveal authoring
// --------------------------------------------------------------------------

const SYSTEM_REVEAL = `You write the persona reveal screen for a developer who just finished a yes/no quiz on daily.dev.

CONSTRAINTS:
1. HEADLINE: 4-9 words. Concrete archetype + a memorable trait. Sentence case, no period required. Specific to their path, not generic.
2. DESCRIPTION: 1-2 sentences (max 30 words). What kind of content their feed will surface, plus one specific observation about them.
3. Tone: confident, slightly playful, daily.dev brand. No corporate speak ("passionate about technology", "love coding"). No emojis. No exclamation marks.
4. The headline should feel like a friend's read of them, not a job title.

OUTPUT: strict JSON only.`;

const buildRevealUser = (
  bucket: Bucket,
  path: ('y' | 'n')[],
  topTags: string[],
): string => `Bucket: "${bucket.label}" — ${bucket.description}.

Yes/no path: ${path
  .map((a, i) => `Q${i + 1}: ${a === 'y' ? 'yes' : 'no'}`)
  .join(', ')}

Top tags (most-weighted, in order): ${topTags.slice(0, 8).join(', ')}

Write their reveal as strict JSON:
{
  "headline": "...",
  "description": "..."
}`;

const generateReveal = async (
  bucket: Bucket,
  path: ('y' | 'n')[],
  topTags: string[],
): Promise<RevealEntry> => {
  const raw = await callAnthropic(
    SYSTEM_REVEAL,
    buildRevealUser(bucket, path, topTags),
    MAX_TOKENS_REVEAL,
  );
  const parsed = parseJson<{ headline?: string; description?: string }>(raw);
  return {
    headline: (parsed.headline ?? '').trim(),
    description: (parsed.description ?? '').trim(),
  };
};

// --------------------------------------------------------------------------
// Concurrency helper
// --------------------------------------------------------------------------

const mapWithConcurrency = async <T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
  onProgress?: (done: number, total: number) => void,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  let done = 0;
  const total = items.length;
  const runners = new Array(Math.min(concurrency, total))
    .fill(null)
    .map(async () => {
      while (cursor < total) {
        const myIndex = cursor;
        cursor += 1;
        results[myIndex] = await worker(items[myIndex], myIndex);
        done += 1;
        onProgress?.(done, total);
      }
    });
  await Promise.all(runners);
  return results;
};

// --------------------------------------------------------------------------
// Graph orchestration
// --------------------------------------------------------------------------

interface PendingNode {
  bucket: Bucket;
  path: ('y' | 'n')[];
  parentTags: Record<string, number>;
}

const generateGraph = async (): Promise<
  Record<string, PersonaQuizQuestion>
> => {
  const graph: Record<string, PersonaQuizQuestion> = existsSync(GRAPH_PATH)
    ? (() => {
        const data = JSON.parse(readFileSync(GRAPH_PATH, 'utf-8')) as
          | PersonaQuizQuestion[]
          | Record<string, PersonaQuizQuestion>;
        if (Array.isArray(data)) {
          return Object.fromEntries(data.map((q) => [q.id, q]));
        }
        return data;
      })()
    : {};

  console.log(
    `Loaded ${Object.keys(graph).length} existing question nodes from disk.`,
  );

  // We need multiple passes because each level depends on the previous level's
  // generated tag weights. Process level-by-level.
  for (let level = 0; level < YES_NO_DEPTH; level += 1) {
    const pending: PendingNode[] = [];
    for (const bucket of BUCKETS) {
      // Enumerate every path at this level
      const total = 2 ** level;
      for (let i = 0; i < total; i += 1) {
        const path: ('y' | 'n')[] = [];
        for (let bit = level - 1; bit >= 0; bit -= 1) {
          path.push(((i >> bit) & 1) === 1 ? 'y' : 'n');
        }
        const id = nodeIdFor(bucket.prefix, path);
        if (graph[id]) {
          continue;
        }
        // Compute parent's accumulated tag profile
        let parentTags = { ...bucket.seedTags };
        for (let p = 0; p < path.length; p += 1) {
          const ancestorPath = path.slice(0, p);
          const ancestorId = nodeIdFor(bucket.prefix, ancestorPath);
          const ancestor = graph[ancestorId];
          if (!ancestor) {
            throw new Error(
              `Missing ancestor ${ancestorId} when computing parent tags for ${id}`,
            );
          }
          const optIdx = path[p] === 'y' ? 0 : 1;
          parentTags = applyWeights(
            parentTags,
            ancestor.options[optIdx].tagWeights,
          );
        }
        pending.push({ bucket, path, parentTags });
      }
    }
    if (pending.length === 0) {
      console.log(`Level ${level + 1}: already complete.`);
      continue;
    }
    console.log(`Level ${level + 1}: generating ${pending.length} nodes…`);
    let lastLogged = 0;
    await mapWithConcurrency(
      pending,
      async (node) => {
        try {
          const question = await generateQuestion(
            node.bucket,
            node.path,
            node.parentTags,
          );
          graph[question.id] = question;
        } catch (err) {
          console.error(
            `Failed to generate ${nodeIdFor(node.bucket.prefix, node.path)}:`,
            err,
          );
          throw err;
        }
      },
      CONCURRENCY,
      (done, total) => {
        if (done - lastLogged >= 25 || done === total) {
          lastLogged = done;
          console.log(`  ${done}/${total}`);
        }
      },
    );
    // Flush after every level — resumable on failure.
    writeFileSync(
      GRAPH_PATH,
      `${JSON.stringify(Object.values(graph), null, 2)}\n`,
    );
    console.log(`  flushed ${Object.keys(graph).length} nodes to disk`);
  }

  return graph;
};

// --------------------------------------------------------------------------
// Reveal orchestration
// --------------------------------------------------------------------------

const generateReveals = async (
  graph: Record<string, PersonaQuizQuestion>,
): Promise<void> => {
  const lookup: Record<string, RevealEntry> = existsSync(REVEAL_PATH)
    ? (JSON.parse(readFileSync(REVEAL_PATH, 'utf-8')) as Record<
        string,
        RevealEntry
      >)
    : {};

  console.log(
    `Loaded ${Object.keys(lookup).length} existing reveals from disk.`,
  );

  interface LeafJob {
    bucket: Bucket;
    path: ('y' | 'n')[];
    signature: string;
    accumulatedTags: Record<string, number>;
  }
  const jobs: LeafJob[] = [];

  for (const bucket of BUCKETS) {
    const totalLeaves = 2 ** YES_NO_DEPTH;
    for (let i = 0; i < totalLeaves; i += 1) {
      const path: ('y' | 'n')[] = [];
      for (let bit = YES_NO_DEPTH - 1; bit >= 0; bit -= 1) {
        path.push(((i >> bit) & 1) === 1 ? 'y' : 'n');
      }
      const sigParts: string[] = [`${Q1_ID}:${bucket.id}`];
      let acc = { ...bucket.seedTags };
      for (let p = 0; p < path.length; p += 1) {
        const ancestorPath = path.slice(0, p);
        const ancestorId = nodeIdFor(bucket.prefix, ancestorPath);
        const ancestor = graph[ancestorId];
        if (!ancestor) {
          throw new Error(
            `Missing node ${ancestorId} when building leaf paths`,
          );
        }
        const opt = path[p] === 'y' ? ancestor.options[0] : ancestor.options[1];
        sigParts.push(`${ancestorId}:${opt.id}`);
        acc = applyWeights(acc, opt.tagWeights);
      }
      const signature = sigParts.join('|');
      if (lookup[signature]) {
        continue;
      }
      jobs.push({ bucket, path, signature, accumulatedTags: acc });
    }
  }

  console.log(`Reveals: generating ${jobs.length} entries…`);
  let lastLogged = 0;
  let flushCounter = 0;
  await mapWithConcurrency(
    jobs,
    async (job) => {
      const topTags = Object.entries(job.accumulatedTags)
        .sort(([, a], [, b]) => b - a)
        .map(([t]) => t);
      const reveal = await generateReveal(job.bucket, job.path, topTags);
      lookup[job.signature] = reveal;
      flushCounter += 1;
    },
    CONCURRENCY,
    (done, total) => {
      if (done - lastLogged >= 100 || done === total) {
        lastLogged = done;
        console.log(`  ${done}/${total}`);
      }
      if (flushCounter >= 200) {
        flushCounter = 0;
        writeFileSync(REVEAL_PATH, `${JSON.stringify(lookup, null, 2)}\n`);
      }
    },
  );

  writeFileSync(REVEAL_PATH, `${JSON.stringify(lookup, null, 2)}\n`);
  console.log(`  flushed ${Object.keys(lookup).length} reveals to disk`);
};

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------

const main = async (): Promise<void> => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY env var.');
    process.exit(1);
  }
  console.log(`Tag vocabulary: ${validTags.size} tags`);
  console.log('Phase 1: question graph');
  const graph = await generateGraph();
  console.log(`Done. ${Object.keys(graph).length} question nodes total.`);
  console.log('Phase 2: reveal lookup');
  await generateReveals(graph);
  console.log('Done.');
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
