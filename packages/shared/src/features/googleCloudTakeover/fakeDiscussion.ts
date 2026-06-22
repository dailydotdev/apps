import type { QueryClient } from '@tanstack/react-query';
import type { Author, Comment, PostCommentsData } from '../../graphql/comments';
import { generateCommentsQueryKey, getAllCommentsQuery } from '../../lib/query';
import { hoursAgo } from './relativeTime';

// A simulated discussion for the sponsored Google Cloud blog post, written to
// feel like a real community thread: different voices and lengths, code
// snippets, an embedded chart, questions with replies, jokes, skeptics, war
// stories. Seeded straight into the comments query cache (and pinned so a
// refetch can't clear it) since the post isn't a real backend post.

// Real avatar photos (deterministic per index) so the discussion doesn't look
// like a placeholder. Verified company logos use GitHub org avatars, which
// redirect to the real image and load reliably.
const avatar = (img: number): string => `https://i.pravatar.cc/150?img=${img}`;
const orgLogo = (org: string): string => `https://github.com/${org}.png`;

type Person = {
  name: string;
  username: string;
  img: number;
  reputation: number;
  company?: { name: string; org: string };
};

const people: Person[] = [
  {
    name: 'Priya Sharma',
    username: 'priyabuilds',
    img: 5,
    reputation: 18430,
    company: { name: 'Vercel', org: 'vercel' },
  },
  { name: 'Marcus Lee', username: 'marcusdev', img: 12, reputation: 9120 },
  {
    name: 'Sofia Alvarez',
    username: 'sofiacodes',
    img: 47,
    reputation: 31280,
    company: { name: 'Stripe', org: 'stripe' },
  },
  { name: 'Tom Becker', username: 'tbecker', img: 33, reputation: 2740 },
  {
    name: 'Aisha Khan',
    username: 'aishak',
    img: 23,
    reputation: 12660,
    company: { name: 'Microsoft', org: 'microsoft' },
  },
  { name: 'Daniel Park', username: 'dpark', img: 8, reputation: 5380 },
  {
    name: 'Lena Novak',
    username: 'lenan',
    img: 16,
    reputation: 44910,
    company: { name: 'GitHub', org: 'github' },
  },
  { name: 'Owen Wright', username: 'owenw', img: 51, reputation: 870 },
  {
    name: 'Rina Tanaka',
    username: 'rinat',
    img: 44,
    reputation: 21540,
    company: { name: 'Datadog', org: 'DataDog' },
  },
  { name: 'Caleb Stone', username: 'cstone', img: 60, reputation: 3960 },
  { name: 'Mira Patel', username: 'mirap', img: 26, reputation: 15070 },
  { name: 'Jonas Vogel', username: 'jvogel', img: 14, reputation: 6620 },
  {
    name: 'Elena Rossi',
    username: 'elenar',
    img: 20,
    reputation: 27800,
    company: { name: 'Shopify', org: 'shopify' },
  },
  { name: 'Hassan Ali', username: 'hassana', img: 56, reputation: 4310 },
  { name: 'Yuki Sato', username: 'yukis', img: 65, reputation: 11200 },
  { name: "Sam O'Neill", username: 'samon', img: 40, reputation: 1580 },
];

const chartImage =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80';

type Reply = { p: number; html: string; up: number; h: number };
type Spec = {
  p: number;
  html: string;
  up: number;
  h: number;
  replies?: Reply[];
};

// Curated discussion. `p` indexes `people`, `up` is upvotes, `h` is hours ago.
const specs: Spec[] = [
  {
    p: 0,
    up: 214,
    h: 3,
    html: `<p>The Spot VM optimizer is the headline for us. We run a nightly feature-engineering job on a 40-node pool and just flipped it to spot with a fallback to on-demand. First week came in at roughly 71% cheaper with zero failed runs thanks to the new graceful drain window.</p><p>If you have anything batch-shaped and idempotent, this is basically free money.</p>`,
    replies: [
      {
        p: 7,
        up: 12,
        h: 2,
        html: `<p>How are you handling the 30s preemption notice? Checkpointing mid-job or just letting the orchestrator retry the shard?</p>`,
      },
      {
        p: 0,
        up: 28,
        h: 1,
        html: `<p>Retry at the shard level. Each shard writes to a temp prefix and we only promote on success, so a preemption just re-runs that shard. Way simpler than trying to checkpoint model state.</p>`,
      },
    ],
  },
  {
    p: 2,
    up: 167,
    h: 5,
    html: `<p>People sleep on how much of this is just sane defaults now. Deploying a containerized agent used to be a half-day of IAM yak-shaving. Today it's basically:</p><pre><code>gcloud run deploy support-agent \\
  --image=us-docker.pkg.dev/$PROJECT/agents/support:latest \\
  --region=us-central1 \\
  --cpu=2 --memory=2Gi \\
  --concurrency=8 --min-instances=1</code></pre><p>Cold starts on min-instances=1 are under 400ms for us. That's the whole story.</p>`,
  },
  {
    p: 4,
    up: 9,
    h: 8,
    html: `<p>Genuine question from someone newer to GCP: is Cloud Run the right call for a stateful websocket service, or should I be looking at GKE for that? The docs hint at both and I can't tell what the "blessed" path is.</p>`,
    replies: [
      {
        p: 8,
        up: 41,
        h: 7,
        html: `<p>Cloud Run supports websockets fine now (60 min request timeout), but if you need sticky sessions or your own ingress rules, GKE Autopilot is less of a fight. Rule of thumb we use: stateless and bursty goes to Run, anything that wants to own its networking goes to GKE.</p>`,
      },
      {
        p: 4,
        up: 3,
        h: 6,
        html: `<p>That's the clearest answer I've gotten, thank you. Going with Run for now.</p>`,
      },
    ],
  },
  {
    p: 6,
    up: 132,
    h: 11,
    html: `<p>Migrated a 12-service stack off self-managed k8s to Autopilot last quarter. The honest scorecard:</p><ul><li>Node management toil: basically gone.</li><li>Bill: down about 22% after we right-sized requests (the optimizer recs were accurate).</li><li>Surprises: a couple of DaemonSets needed rework because you don't own the nodes anymore.</li></ul><p>Net very positive, but budget a sprint for the DaemonSet stuff if you're coming from standard GKE.</p>`,
  },
  {
    p: 8,
    up: 1,
    h: 14,
    html: `<p>+1, the docs are genuinely good now. Felt like that needed saying.</p>`,
  },
  {
    p: 3,
    up: 88,
    h: 9,
    html: `<p>I'll be the skeptic. Every cloud keynote promises "agentic AI" and most of it is a thin wrapper over function calling. What's actually different here versus building the same loop yourself with the SDK?</p>`,
    replies: [
      {
        p: 10,
        up: 54,
        h: 8,
        html: `<p>Fair, but the managed part is the eval + tracing story, not the loop. Getting per-step traces, replayable sessions, and a grounding layer wired into your own data without standing up infra is the actual time save. The loop was never the hard part.</p>`,
      },
    ],
  },
  {
    p: 12,
    up: 76,
    h: 16,
    html: `<p>The in-country processing for Gemini quietly unblocks a sovereign workload we shelved last year. For regulated EU data this is the difference between "no" and "yes" from our compliance team. Underrated line item in this post.</p>`,
  },
  {
    p: 9,
    up: 121,
    h: 6,
    html: `<p>We A/B'd the new autoscaling profile on a latency-sensitive service. p95 before vs after the switch:</p><img src="${chartImage}" alt="p95 latency dashboard, before and after the autoscaling change" /><p>Roughly a 38% drop at the tail without adding baseline cost. The scale-up reaction time is the real improvement.</p>`,
  },
  {
    p: 5,
    up: 23,
    h: 19,
    html: `<p>Anyone running the serverless Spark jobs in production yet? Cold starts were the only thing stopping us from moving our ETL off a always-on Dataproc cluster, and the post claims that's fixed.</p>`,
    replies: [
      {
        p: 11,
        up: 19,
        h: 18,
        html: `<p>Yes, ~3 weeks in. Cold start went from minutes to about 20s for our jobs. Not instant, but for hourly ETL it's a non-issue and we killed the standing cluster entirely.</p>`,
      },
    ],
  },
  {
    p: 1,
    up: 7,
    h: 22,
    html: `<p>Slightly off topic but the VS Code workbench notebooks going GA is the update I'm most selfishly happy about. Local editor, managed compute, no more babysitting a Jupyter VM.</p>`,
  },
  {
    p: 13,
    up: 44,
    h: 27,
    html: `<p>Heads up for the cost-optimizer crowd: validate the recommendations against your own traffic shape before you apply them in bulk. We took the CPU downsizing suggestion on a spiky endpoint and got throttled during a campaign. Quick sanity check we run now:</p><pre><code># rough headroom check
peak_rps * avg_cpu_ms / 1000 &gt; provisioned_vcpu * 0.6</code></pre><p>If that's false you probably have room, if it's true leave it alone.</p>`,
  },
  {
    p: 14,
    up: 2,
    h: 31,
    html: `<p>Bookmarking purely for the deep-dive links at the bottom. That's where the actual engineering content lives every time.</p>`,
  },
  {
    p: 7,
    up: 58,
    h: 24,
    html: `<p>The contrarian take nobody wants: this is great until you've got 200 services wired into managed everything and the lock-in is total. I love the DX, I just keep an abstraction layer over the queue and storage so a future migration isn't a company-ending project. Cheap insurance.</p>`,
    replies: [
      {
        p: 2,
        up: 31,
        h: 23,
        html: `<p>This is the right amount of paranoia. We do the same for pub/sub and object storage and ignore it for everything else. Abstracting all of it is its own tax.</p>`,
      },
    ],
  },
  {
    p: 11,
    up: 95,
    h: 13,
    html: `<p>Reliability numbers in the post line up with what we see in our own dashboards, which is rare for a vendor blog. We've been at four nines on the managed gateway for two quarters with no manual intervention. Credit where it's due.</p>`,
  },
  {
    p: 10,
    up: 16,
    h: 36,
    html: `<p>Mild gripe: the API management updates are nice but the pricing page still needs a PhD to parse. Would love a "here's what this costs at 10M requests/month" calculator that isn't three tabs deep.</p>`,
  },
  {
    p: 15,
    up: 0,
    h: 40,
    html: `<p>Saving this to read properly after standup. The agentic tooling section looks like exactly what our team has been hacking together by hand.</p>`,
  },
  {
    p: 4,
    up: 49,
    h: 30,
    html: `<p>For anyone wiring Gemini into a data warehouse: the native BigQuery integration means you can keep governance in one place instead of shuttling data to a separate vector store. That alone removed a whole service from our diagram.</p>`,
  },
  {
    p: 6,
    up: 38,
    h: 44,
    html: `<p>Small thing that makes daily infra work less painful: the new default for graceful shutdown actually respects SIGTERM grace periods now. We used to lose in-flight requests on every deploy. Quiet quality-of-life win.</p>`,
  },
  {
    p: 12,
    up: 11,
    h: 52,
    html: `<p>Shared this with our platform team channel. A few of these land directly on our Q3 roadmap, especially the data residency controls.</p>`,
  },
  {
    p: 9,
    up: 64,
    h: 20,
    html: `<p>If you're comparing to the other big two: the thing that keeps us here is that the AI tooling and the data tooling are the same product surface. Less glue code than stitching a model provider to a separate warehouse. Your mileage will vary by stack.</p>`,
  },
  {
    p: 5,
    up: 5,
    h: 58,
    html: `<p>Tried the new data residency controls in staging, no measurable latency hit for us in europe-west. Curious if anyone in apac is seeing different.</p>`,
  },
  {
    p: 3,
    up: 73,
    h: 17,
    html: `<p>Okay, walking back some of my skepticism after actually trying the eval harness this weekend. Being able to replay a failed agent session step by step with the tool calls inline is genuinely good. That's the feature that earns the "agentic" label, not the marketing.</p>`,
  },
  {
    p: 1,
    up: 27,
    h: 48,
    html: `<p>Underrated: the Spot + managed instance group combo means our CI runners are basically free now. We burst to 60 runners on spot and the queue time problem just disappeared.</p>`,
  },
];

// A separate discussion for the second (engagement) card, whose post is about
// shipping AI agents to production. Distinct voices/topics from the blog post
// thread above so the two cards don't repeat the same comments.
const engagementSpecs: Spec[] = [
  {
    p: 2,
    up: 188,
    h: 4,
    html: `<p>The single biggest reliability win for us was validating tool arguments before executing, then retrying with the validation error fed back to the model. Naive tool calling failed ~8% of the time; this got us under 1%.</p><pre><code>const parsed = toolSchema.safeParse(call.args);
if (!parsed.success) {
  messages.push(toolError(call, parsed.error));
  continue; // let the model correct itself
}</code></pre>`,
    replies: [
      {
        p: 7,
        up: 14,
        h: 3,
        html: `<p>Do you cap the retries? We've seen a model loop forever re-emitting the same bad args.</p>`,
      },
      {
        p: 2,
        up: 31,
        h: 2,
        html: `<p>Hard cap at 3, then bail to a human. The infinite loop only happens if you don't feed the actual error back; once it can see what was wrong it usually fixes it on the first retry.</p>`,
      },
    ],
  },
  {
    p: 10,
    up: 142,
    h: 6,
    html: `<p>Evals are the part nobody wants to build and the part that actually ships you to prod. We treat real agent traces like test fixtures: capture failures, freeze them, assert behavior doesn't regress. Without it you're just vibing in production.</p>`,
  },
  {
    p: 4,
    up: 8,
    h: 9,
    html: `<p>Newer to this. For a support agent over our own docs, is RAG enough or do we actually need to fine-tune a model?</p>`,
    replies: [
      {
        p: 8,
        up: 47,
        h: 8,
        html: `<p>Start with RAG, almost always. Fine-tuning is for style and format, not knowledge. In my experience 90% of "we need fine-tuning" is really "our retrieval is bad".</p>`,
      },
    ],
  },
  {
    p: 6,
    up: 97,
    h: 12,
    html: `<p>Cost control deserves its own chapter. Prompt-caching the system prompt and tool definitions cut our per-call cost by about 60%, because that block is byte-identical every turn. Track tokens per resolved task, not per call, or you'll optimize the wrong thing.</p>`,
  },
  {
    p: 3,
    up: 79,
    h: 8,
    html: `<p>Contrarian take: "agentic AI" is a while loop with extra steps. What is actually new here versus a for-loop that calls functions?</p>`,
    replies: [
      {
        p: 10,
        up: 58,
        h: 7,
        html: `<p>Mechanically, sure. The new part is the eval and tracing harness around the loop plus tool-call validation. The loop was never the hard bit; the production scaffolding is.</p>`,
      },
    ],
  },
  {
    p: 9,
    up: 113,
    h: 5,
    html: `<p>Per-step tracing changed how we debug agents. Replaying a failed run with every tool call and token inline is the difference between guessing and fixing. Our latency breakdown by step:</p><img src="${chartImage}" alt="agent run latency breakdown by step" /><p>Turned out 70% of our wall-clock was one slow retrieval call, not the model.</p>`,
  },
  {
    p: 12,
    up: 64,
    h: 16,
    html: `<p>Treat every tool the agent can call as an attack surface. We allowlist tools per session and never let the model build raw SQL or shell. Prompt injection from retrieved documents is real, and your RAG layer is the front door.</p>`,
  },
  {
    p: 5,
    up: 21,
    h: 19,
    html: `<p>How is everyone handling perceived latency on multi-step agents? Users hate staring at a spinner for eight seconds.</p>`,
    replies: [
      {
        p: 11,
        up: 26,
        h: 18,
        html: `<p>Stream the intermediate steps. Showing "searching docs... reading 3 results..." makes a 6s task feel fast. Same work, the wait just feels different.</p>`,
      },
    ],
  },
  {
    p: 1,
    up: 9,
    h: 22,
    html: `<p>Switching to strict structured outputs removed a whole class of parsing bugs. We used to regex the model's prose to pull fields out. Never again.</p>`,
  },
  {
    p: 13,
    up: 54,
    h: 27,
    html: `<p>Context-window management is the unglamorous 80%. We summarize older turns and keep a rolling window. Rough guard before each call:</p><pre><code>if (estimateTokens(messages) > LIMIT * 0.7) {
  messages = [system, summarize(older), ...recent];
}</code></pre>`,
  },
  {
    p: 14,
    up: 3,
    h: 31,
    html: `<p>Spent two weeks on a clever multi-agent setup, deleted it, replaced it with one good prompt and three tools. Faster, cheaper, and I sleep now.</p>`,
  },
  {
    p: 11,
    up: 88,
    h: 13,
    html: `<p>For anything that writes (refunds, emails, deploys) we gate on human approval. The agent proposes, a person confirms. That gate caught exactly one very expensive mistake in week two and paid for itself.</p>`,
  },
  {
    p: 0,
    up: 46,
    h: 30,
    html: `<p>Resist the urge to build a swarm of agents on day one. One agent with good tools beats five agents passing messages and hallucinating about each other's state.</p>`,
  },
  {
    p: 9,
    up: 71,
    h: 20,
    html: `<p>We default to a cheaper, faster model and only escalate to the frontier one when an eval gate fails. Most steps don't need the big model. Routing on difficulty cut our cost more than any prompt tweak did.</p>`,
  },
  {
    p: 8,
    up: 1,
    h: 40,
    html: `<p>This matches our last year painfully well. Wish I'd read it before, not after.</p>`,
  },
  {
    p: 15,
    up: 0,
    h: 44,
    html: `<p>Saving this for the team offsite. The evals section alone is worth it.</p>`,
  },
];

const buildAuthor = (personIndex: number, key: string): Author => {
  const person = people[personIndex];
  return {
    id: `gcp-author-${key}`,
    name: person.name,
    username: person.username,
    permalink: `https://app.daily.dev/${person.username}`,
    image: avatar(person.img),
    reputation: person.reputation,
    createdAt: '2021-03-01T00:00:00.000Z',
    companies: person.company
      ? [
          {
            id: person.company.org,
            name: person.company.name,
            image: orgLogo(person.company.org),
            createdAt: new Date('2021-01-01'),
            updatedAt: new Date('2021-01-01'),
          },
        ]
      : undefined,
  } as Author;
};

const buildComments = (specList: Spec[], idPrefix: string): Comment[] =>
  specList.map((spec, i): Comment => {
    const children = (spec.replies ?? []).map((reply, j) => ({
      node: {
        id: `${idPrefix}-${i}-r${j}`,
        content: '',
        contentHtml: reply.html,
        contentEmbeds: [],
        createdAt: hoursAgo(reply.h),
        lastUpdatedAt: hoursAgo(reply.h),
        permalink: 'https://cloud.google.com/blog',
        numUpvotes: reply.up,
        numAwards: 0,
        author: buildAuthor(reply.p, `${idPrefix}-${i}-r${j}`),
        children: { edges: [], pageInfo: { hasNextPage: false } },
      } as Comment,
    }));

    return {
      id: `${idPrefix}-${i}`,
      content: '',
      contentHtml: spec.html,
      contentEmbeds: [],
      createdAt: hoursAgo(spec.h),
      lastUpdatedAt: hoursAgo(spec.h),
      permalink: 'https://cloud.google.com/blog',
      numUpvotes: spec.up,
      numAwards: 0,
      author: buildAuthor(spec.p, `${idPrefix}-${i}`),
      children: { edges: children, pageInfo: { hasNextPage: false } },
    } as Comment;
  });

// Total comments (top-level + replies) so each post's header count matches.
const countComments = (specList: Spec[]): number =>
  specList.reduce((sum, spec) => sum + 1 + (spec.replies?.length ?? 0), 0);

export const googleCloudDiscussionCount = countComments(specs);
export const googleCloudEngagementDiscussionCount =
  countComments(engagementSpecs);

const buildDiscussion = (
  specList: Spec[],
  idPrefix: string,
): PostCommentsData => ({
  postComments: {
    edges: buildComments(specList, idPrefix).map((node) => ({ node })),
    pageInfo: { hasNextPage: false, endCursor: null },
  },
});

// Seed every comments-query-key variant for the post and pin it so the live
// (empty) refetch can't replace the simulated discussion.
const seedDiscussion = (
  queryClient: QueryClient,
  postId: string,
  specList: Spec[],
  idPrefix: string,
): void => {
  const data = buildDiscussion(specList, idPrefix);
  const keys = [
    generateCommentsQueryKey({ postId }),
    ...getAllCommentsQuery(postId),
  ];
  keys.forEach((key) => {
    queryClient.setQueryDefaults(key, {
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    });
    queryClient.setQueryData(key, data);
  });
};

// First (blog) card discussion.
export const seedGoogleCloudDiscussion = (
  queryClient: QueryClient,
  postId: string,
): void => seedDiscussion(queryClient, postId, specs, 'gcp-comment');

// Second (engagement) card discussion — a distinct set of comments.
export const seedGoogleCloudEngagementDiscussion = (
  queryClient: QueryClient,
  postId: string,
): void =>
  seedDiscussion(queryClient, postId, engagementSpecs, 'gcp-eng-comment');
