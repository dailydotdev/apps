import type { AgentActivityItem } from './AgentContext';
import type { UserInterest } from '../../graphql/interests';
import {
  UserInterestCadence,
  UserInterestStatus,
} from '../../graphql/interests';

export const mockInterest: UserInterest = {
  id: 'demo',
  query: 'Cool zig projects',
  status: UserInterestStatus.Active,
  cadence: UserInterestCadence.Daily,
  fomoThreshold: 0.62,
  sources: { dailyDev: true, web: false, github: false },
  outputModes: { feed: true, post: true, digest: false, notification: true },
  lastRunAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  lastRunSummary: 'Scanned 128 posts, kept 6',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  updatedAt: new Date().toISOString(),
};

const hoursAgo = (hours: number) =>
  new Date(Date.now() - 1000 * 60 * 60 * hours).toISOString();

/** A few agents in different states, for the home screen's design surface. */
export const mockAgents: UserInterest[] = [
  mockInterest,
  {
    ...mockInterest,
    id: 'demo-2',
    query: 'What is actually shipping in AI agents',
    cadence: UserInterestCadence.Hourly,
    lastRunAt: hoursAgo(1),
    lastRunSummary: 'Scanned 340 posts, kept 4',
  },
  {
    ...mockInterest,
    id: 'demo-3',
    query: 'Postgres internals, deep dives only',
    status: UserInterestStatus.Paused,
    cadence: UserInterestCadence.Weekly,
    lastRunAt: hoursAgo(72),
    lastRunSummary: null,
  },
  {
    ...mockInterest,
    id: 'demo-4',
    query: 'Local-first sync',
    lastRunAt: null,
    lastRunSummary: null,
  },
];

export const mockAgentPosts = [
  {
    id: 'mock-post-1',
    title:
      'Zig this week: the self-hosted backend, and three projects worth cloning',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    contentHtml: `<p>I went through <strong>128 posts</strong> and kept nine. Here is what actually matters.</p>
<h3>The one thing to read</h3>
<p><strong>Zig 0.15 makes the self-hosted backend the default.</strong> Debug builds no longer need LLVM, which is why everyone is posting compile-time screenshots. Incremental compilation is in, but behind a flag — do not plan around it yet.</p>
<h3>Projects worth cloning</h3>
<ol>
<li><strong>Bun's new bundler</strong> — the Go dependency is gone and module resolution moved into Zig. The 3.1x cold-start number holds up on their benchmark suite; watch mode is unchanged.</li>
<li><strong>Ghostty</strong> — now open source, GPU rendering on both macOS and Linux. The config format deliberately has no scripting, which is the interesting design call.</li>
<li><strong>TigerBeetle</strong> — their post-mortem is the most honest thing I read this week. Deterministic simulation found the bug; nobody read the report.</li>
</ol>
<h3>What I skipped</h3>
<p>Four "Zig vs Rust" posts that re-ran the same microbenchmark, and two release announcements with no notes attached. You told me to cut announcement noise, so they did not make it in.</p>`,
  },
  {
    id: 'mock-post-2',
    title: 'What changed in your interest since Tuesday',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    contentHtml: `<p>Two threads are converging.</p>
<p><strong>Tooling is consolidating.</strong> <code>zig cc</code> keeps showing up as a full cross-compilation replacement rather than an experiment — the InfoQ write-up is a year of production use, not a first impression.</p>
<p><strong>The performance debate moved on.</strong> Microbenchmarks are out; people are comparing build times and debug ergonomics instead, which is a much more useful signal for picking a language.</p>
<p>I lowered the weight on opinion pieces after your last note and picked up more source-level material. That dropped my volume from ~14 findings a day to 6, which should be closer to what you wanted.</p>`,
  },
];

export const mockActivity: AgentActivityItem[] = [
  {
    id: 'mock-activity-1',
    at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    kind: 'finding',
    text: 'Scanned 128 new posts, added 6 to your feed',
  },
  {
    id: 'mock-activity-2',
    at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    kind: 'post',
    text: 'Wrote "Zig this week: the self-hosted backend, and three projects worth cloning"',
  },
  {
    id: 'mock-activity-3',
    at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    kind: 'notification',
    text: 'Notified you about 6 new findings',
  },
  {
    id: 'mock-activity-4',
    at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    kind: 'command',
    text: 'You asked for fewer announcements, more source-level deep dives',
  },
  {
    id: 'mock-activity-5',
    at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    kind: 'run',
    text: 'Scheduled run — 41 posts scanned, nothing passed your quality bar',
  },
  {
    id: 'mock-activity-6',
    at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    kind: 'finding',
    text: 'Picked up Ghostty going open source 4 minutes after it went live',
  },
];
