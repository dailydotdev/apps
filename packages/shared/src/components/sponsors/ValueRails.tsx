import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { pagePaddings } from '../utilities/common';

// =============================================================
// Value rails — the second row of the dock.
//
// Two jobs at once. The obvious one: give the strip a reason to
// exist for the reader, so a permanent bottom bar is not pure
// rent. The less obvious one: browsers draw their link-status
// bubble in the bottom corners, over whatever the page renders,
// and on a feed that is nearly all links it is showing most of
// the time. Stacking a value rail beneath the sponsor row puts
// something expendable in the bubble's path — ambient, glanceable
// data that costs nothing when it is briefly covered — and lifts
// the paid row clear of it. The reference format does the same
// thing: the sponsor lockup sits above the tickers, not in them.
//
// Every rail therefore opens with a label on the left. That is
// the sacrificial zone: it is the first thing the bubble covers
// and the least worth reading. Data starts after it.
//
// Each variant below is mocked. The data each one would need
// already exists in the app — trendingTags, userStreak, the
// leaderboard queries, live rooms, quests, opportunities, polls —
// so these are proposals about surfacing, not about new plumbing.
// =============================================================

const RAIL_HEIGHT = 'h-8';

/**
 * Every rail accepts a label override so the switcher can hand it a
 * dropdown trigger in place of the static word, without any rail
 * needing to know the switcher exists.
 */
export type RailProps = { label?: ReactNode };

type ValueRailProps = {
  /**
   * Sacrificial left zone: the tooltip covers this first, which is
   * why the rail's least important element lives here. When the
   * switcher is in use this is the dropdown trigger — still the
   * least costly thing to lose, since it says what you are already
   * looking at.
   */
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export const ValueRail = ({
  children,
  className,
  label,
}: ValueRailProps): ReactElement => (
  <div
    className={classNames(
      'flex w-full items-center gap-4 border-t border-border-subtlest-tertiary bg-background-default',
      pagePaddings,
      RAIL_HEIGHT,
      className,
    )}
  >
    <span className="shrink-0 whitespace-nowrap text-text-quaternary typo-caption2">
      {label}
    </span>
    {/*
     * The row carries more than fits on purpose: it should read as a
     * ticker continuing past the edge, not a list that happens to
     * end. The fade is what makes that read as intentional — a hard
     * clip chops a word in half and looks like a bug.
     */}
    <div
      className="flex min-w-0 flex-1 items-center gap-5 overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, black calc(100% - 2.5rem), transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, black calc(100% - 2.5rem), transparent)',
      }}
    >
      {children}
    </div>
  </div>
);

const Item = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'flex shrink-0 items-center gap-1.5 whitespace-nowrap text-text-secondary typo-caption1',
      className,
    )}
  >
    {children}
  </span>
);

/** Up/down delta in the platform's status colours. */
const Delta = ({ value }: { value: number }): ReactElement => (
  <span
    className={classNames(
      'tabular-nums',
      value >= 0 ? 'text-status-success' : 'text-status-error',
    )}
  >
    {value >= 0 ? '▲' : '▼'}
    {Math.abs(value)}%
  </span>
);

const Dot = ({ className }: { className?: string }): ReactElement => (
  <span
    aria-hidden
    className={classNames('size-1.5 shrink-0 rounded-full', className)}
  />
);

// --- 1. Tag momentum ------------------------------------------
// The closest analogue to the reference's stock ticker, and the
// one that most obviously belongs to daily.dev: which topics are
// moving on the feed right now. Source: trendingTags, plus a
// week-over-week occurrence delta.
export const TagMomentumRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Trending'}>
    {[
      { tag: 'rust', delta: 48 },
      { tag: 'llm-agents', delta: 31 },
      { tag: 'postgres', delta: 12 },
      { tag: 'kubernetes', delta: -6 },
      { tag: 'webassembly', delta: 22 },
      { tag: 'golang', delta: -11 },
      { tag: 'typescript', delta: 4 },
      { tag: 'zig', delta: 37 },
      { tag: 'observability', delta: 9 },
      { tag: 'react', delta: -3 },
      { tag: 'sqlite', delta: 26 },
      { tag: 'devex', delta: 14 },
      { tag: 'terraform', delta: -8 },
      { tag: 'edge-compute', delta: 19 },
      { tag: 'security', delta: 6 },
      { tag: 'python', delta: -2 },
    ].map(({ tag, delta }) => (
      <Item key={tag}>
        <span className="text-text-primary">#{tag}</span>
        <Delta value={delta} />
      </Item>
    ))}
  </ValueRail>
);

// --- 2. Model leaderboard -------------------------------------
// What developers on daily.dev are actually discussing, ranked.
// Source: post volume on model tags over seven days.
const ModelRankRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Models this week'}>
    {[
      { name: 'Claude Opus 5', move: 0 },
      { name: 'GPT-5.2', move: 1 },
      { name: 'Gemini 3 Pro', move: -1 },
      { name: 'Llama 4', move: 2 },
      { name: 'DeepSeek V4', move: 0 },
      { name: 'Qwen 3', move: 3 },
      { name: 'Mistral Large 3', move: -2 },
      { name: 'Grok 4', move: 1 },
      { name: 'Command R+', move: 0 },
      { name: 'Phi-5', move: -1 },
    ].map(({ name, move }, i) => (
      <Item key={name}>
        <span className="tabular-nums text-text-quaternary">{i + 1}</span>
        <span className="text-text-primary">{name}</span>
        {move !== 0 && (
          <span
            className={move > 0 ? 'text-status-success' : 'text-status-error'}
          >
            {move > 0 ? '▲' : '▼'}
            {Math.abs(move)}
          </span>
        )}
      </Item>
    ))}
  </ValueRail>
);

// --- 3. Hot right now -----------------------------------------
// A headline ticker: the posts climbing fastest, with their
// upvote counts. Source: the feed's own trending ranking.
const HotPostsRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Hot right now'}>
    {[
      { title: 'Postgres 18 ships async I/O', votes: 412 },
      { title: 'The case against microservices, again', votes: 289 },
      { title: 'Rust in the Linux kernel: one year on', votes: 231 },
      { title: 'We deleted our CI cache and got faster', votes: 198 },
      { title: 'SQLite is all you need until it isn’t', votes: 176 },
      { title: 'Why your p99 is lying to you', votes: 154 },
      { title: 'A year of shipping without staging', votes: 131 },
      { title: 'The quiet death of the REST client', votes: 118 },
    ].map(({ title, votes }) => (
      <Item key={title}>
        <span className="text-text-primary">{title}</span>
        <span className="tabular-nums text-text-quaternary">▲{votes}</span>
      </Item>
    ))}
  </ValueRail>
);

// --- 4. Your streak -------------------------------------------
// The most personal option, and the only one that changes if the
// reader does nothing. Source: userStreak.
export const StreakRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Your streak'}>
    <Item>
      <span className="text-accent-bacon-default">🔥 12 days</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">Longest 34 days</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">Weekend shield on</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">5 reading days this week</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">17 posts read · 4 bookmarked</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">Best day Tue · 9 posts</span>
    </Item>
    <Item>
      <span className="text-text-primary">3 of 5 posts read today</span>
      <span className="h-1 w-16 overflow-hidden rounded-4 bg-surface-float">
        <span className="block h-full w-3/5 rounded-4 bg-accent-bacon-default" />
      </span>
    </Item>
  </ValueRail>
);

// --- 5. Weekly rank -------------------------------------------
// Source: the leaderboard queries already in the app
// (MostReadingDays, HighestReputation, LongestStreak).
const RankRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Leaderboard'}>
    <Item>
      <span className="text-text-primary">#42 in reading days</span>
      <span className="text-status-success">▲6</span>
    </Item>
    <Item>
      <span className="text-text-primary">#118 in reputation</span>
      <span className="text-status-success">▲12</span>
    </Item>
    <Item>
      <span className="text-text-primary">#9 in your squads</span>
      <span className="text-status-error">▼2</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">Top 4% this week</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">Next rank in 2 days of reading</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">Longest streak #63</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">Level 14 · 320 to next</span>
    </Item>
  </ValueRail>
);

// --- 6. Squad pulse -------------------------------------------
const SquadPulseRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Your squads'}>
    {[
      { name: 'Frontend Devs', note: '3 new posts' },
      { name: 'AI Builders', note: '1 discussion' },
      { name: 'Rustaceans', note: '5 new posts' },
      { name: 'Platform Eng', note: '2 new posts' },
      { name: 'Data Wranglers', note: '4 new posts' },
      { name: 'Go Gophers', note: '1 new post' },
      { name: 'Security Club', note: '6 new posts' },
      { name: 'Design Systems', note: '2 discussions' },
    ].map(({ name, note }) => (
      <Item key={name}>
        <span className="text-text-primary">{name}</span>
        <span className="text-text-quaternary">{note}</span>
      </Item>
    ))}
  </ValueRail>
);

// --- 7. Live now ----------------------------------------------
// Source: live rooms (topic, status, listener count).
export const LiveNowRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Live now'}>
    <Item>
      <Dot className="animate-pulse bg-status-error" />
      <span className="text-text-primary">Rust in production</span>
      <span className="text-text-quaternary">214 listening</span>
    </Item>
    <Item>
      <Dot className="animate-pulse bg-status-error" />
      <span className="text-text-primary">Postgres office hours</span>
      <span className="text-text-quaternary">88 listening</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">
        Next: Shipping agents safely · 16:00
      </span>
    </Item>
    <Item>
      <span className="text-text-tertiary">
        Then: Kernel patches explained · 18:30
      </span>
    </Item>
    <Item>
      <span className="text-text-tertiary">
        Tomorrow: Zig for C people · 11:00
      </span>
    </Item>
    <Item>
      <span className="text-text-tertiary">
        3 rooms in your squads this week
      </span>
    </Item>
  </ValueRail>
);

// --- 8. Role pulse --------------------------------------------
// Source: opportunities matched against the reader's tags.
const RolePulseRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'New roles'}>
    <Item>
      <span className="text-text-primary">12 matching Rust</span>
    </Item>
    <Item>
      <span className="text-text-primary">4 matching Postgres</span>
    </Item>
    <Item>
      <span className="text-text-primary">7 matching TypeScript</span>
    </Item>
    <Item>
      <span className="text-text-primary">3 matching Kubernetes</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">9 remote · 5 senior · 2 staff</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">6 new since Monday</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">2 saved · 1 replied</span>
    </Item>
  </ValueRail>
);

// --- 9. Release radar -----------------------------------------
// Versions of the tools the reader already follows, which is the
// single most repeated "why do I open this tab" answer.
const ReleaseRadarRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Releases'}>
    {[
      { name: 'React', version: '19.2' },
      { name: 'Node', version: '24 LTS' },
      { name: 'TypeScript', version: '5.9' },
      { name: 'Postgres', version: '18.1' },
      { name: 'Bun', version: '1.3' },
      { name: 'Deno', version: '2.4' },
      { name: 'Vite', version: '7.1' },
      { name: 'Rust', version: '1.91' },
      { name: 'Go', version: '1.26' },
      { name: 'Python', version: '3.14' },
      { name: 'Kubernetes', version: '1.34' },
      { name: 'Redis', version: '8.2' },
    ].map(({ name, version }) => (
      <Item key={name}>
        <span className="text-text-primary">{name}</span>
        <span className="text-text-quaternary">{version}</span>
      </Item>
    ))}
  </ValueRail>
);

// --- 10. Community poll ---------------------------------------
// The app already has poll posts; this surfaces the live split
// and takes one tap to answer.
const PollRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? "Today's poll"}>
    <Item>
      <span className="text-text-primary">
        Do you review AI-written code line by line?
      </span>
    </Item>
    <Item>
      <span className="text-status-success">Yes 62%</span>
      <span className="h-1 w-20 overflow-hidden rounded-4 bg-surface-float">
        <span className="block h-full w-[62%] rounded-4 bg-status-success" />
      </span>
      <span className="text-text-quaternary">No 38%</span>
    </Item>
    <Item>
      <span className="text-text-quaternary">1,204 votes</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">You voted Yes</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">
        Yesterday: Do you write tests first? No 71%
      </span>
    </Item>
    <Item>
      <span className="text-text-tertiary">3 polls in your squads</span>
    </Item>
  </ValueRail>
);

// --- 11. Agent status -----------------------------------------
// The most personal rail of the set: what the reader's own agents
// are doing right now. Ambient status rather than news — closer to
// a build indicator than a ticker.
const AgentStatusRail = ({ label }: RailProps): ReactElement => (
  <ValueRail label={label ?? 'Your agents'}>
    <Item>
      <Dot className="animate-pulse bg-status-success" />
      <span className="text-text-primary">Digest</span>
      <span className="text-text-quaternary">running · 4 sources</span>
    </Item>
    <Item>
      <span className="text-text-primary">PR reviewer</span>
      <span className="text-text-quaternary">idle · last run 2h ago</span>
    </Item>
    <Item>
      <Dot className="bg-status-warning" />
      <span className="text-text-primary">Release watcher</span>
      <span className="text-text-quaternary">3 findings waiting</span>
    </Item>
    <Item>
      <span className="text-text-primary">Tag curator</span>
      <span className="text-text-quaternary">queued</span>
    </Item>
    <Item>
      <Dot className="bg-status-error" />
      <span className="text-text-primary">Changelog</span>
      <span className="text-text-quaternary">failed · auth expired</span>
    </Item>
    <Item>
      <span className="text-text-tertiary">14 runs today · 2 need input</span>
    </Item>
  </ValueRail>
);

export const VALUE_RAILS: {
  id: string;
  name: string;
  note: string;
  Rail: (props: RailProps) => ReactElement;
}[] = [
  {
    id: 'tags',
    name: 'Tag momentum',
    note: 'the reference’s stock ticker, in daily.dev’s own currency — which topics are moving',
    Rail: TagMomentumRail,
  },
  {
    id: 'models',
    name: 'Models this week',
    note: 'what developers here are actually discussing, ranked, with movement',
    Rail: ModelRankRail,
  },
  {
    id: 'hot',
    name: 'Hot right now',
    note: 'headline ticker of the posts climbing fastest',
    Rail: HotPostsRail,
  },
  {
    id: 'streak',
    name: 'Your streak',
    note: 'the only rail that changes if the reader does nothing — habit, not news',
    Rail: StreakRail,
  },
  {
    id: 'rank',
    name: 'Leaderboard',
    note: 'weekly rank and movement, from the leaderboard queries already in the app',
    Rail: RankRail,
  },
  {
    id: 'squads',
    name: 'Squad pulse',
    note: 'unread activity in the squads the reader already joined',
    Rail: SquadPulseRail,
  },
  {
    id: 'live',
    name: 'Live now',
    note: 'the one rail with genuine urgency — a room happening right now',
    Rail: LiveNowRail,
  },
  {
    id: 'roles',
    name: 'Role pulse',
    note: 'opportunities matched to the reader’s tags, the highest-intent surface here',
    Rail: RolePulseRail,
  },
  {
    id: 'releases',
    name: 'Release radar',
    note: 'versions of the tools they follow — the most repeated reason to open a new tab',
    Rail: ReleaseRadarRail,
  },
  {
    id: 'agents',
    name: 'Your agents',
    note: 'what the reader’s own agents are doing — a build indicator, not a ticker',
    Rail: AgentStatusRail,
  },
  {
    id: 'poll',
    name: 'Today’s poll',
    note: 'live split on a one-tap question; the app already has poll posts',
    Rail: PollRail,
  },
];
