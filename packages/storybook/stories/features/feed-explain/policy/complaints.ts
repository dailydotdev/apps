import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { TopicControl } from './profile';
import { InterestOrigin, maxTopicWeight, TopicMode } from './profile';
import type { ParamKey } from './params';
import type { Decision, PersonalizationState, RankResult } from './rank';
import { FollowKind, Lane, rankFeed, SourceMode } from './rank';
import { formatBoost } from './describe';

/**
 * Stands in for the model (an LLM or jev) that would read a complaint: plain
 * rules that map what the viewer typed to the controls the cards and
 * Personalization already use, grounded in their profile and their page.
 */

type Update = (state: PersonalizationState) => PersonalizationState;

export interface Focus {
  tags?: string[];
  sourceId?: string;
}

export interface Proposal {
  id: string;
  title: string;
  detail: string;
  /** What the bar says once it is applied. */
  message: string;
  update: Update;
  focus?: Focus;
  /** Sets an exact number, which only Plus can. */
  isPlusOnly?: boolean;
}

export interface ComplaintReading {
  complaint: string;
  /** What the page and profile show about the complaint. */
  findings: string[];
  proposals: Proposal[];
  /** What the feed can't do about it today, and what to try instead. */
  limits: string[];
}

export interface ComplaintContext {
  state: PersonalizationState;
  pool: Post[];
  /** The page the viewer is looking at. */
  served: Decision[];
  /** The page the current settings would serve. */
  next: RankResult;
  /** Free viewers see the changes they can make first. */
  isPlus?: boolean;
  /** The prototype's clock, for timed changes. */
  now?: number;
}

enum Direction {
  Less = 'less',
  More = 'more',
}

interface TopicGroup {
  label: string;
  tags: string[];
}

interface SourceRef {
  id: string;
  name: string;
}

const plural = (count: number, one: string, many = `${one}s`): string =>
  `${count} ${count === 1 ? one : many}`;

const joinAnd = (items: string[]): string =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

const listSome = (items: string[], max = 3): string =>
  items.length <= max
    ? joinAnd(items)
    : `${items.slice(0, max).join(', ')} and ${items.length - max} more`;

const hashtag = (tag: string): string => `#${tag}`;

const round = (value: number): number => Math.round(value * 100) / 100;

const toggle = (list: string[], value: string, isOn: boolean): string[] =>
  isOn ? [...new Set([...list, value])] : list.filter((item) => item !== value);

const withoutKey = <T>(
  record: Record<string, T> | undefined,
  key: string,
): Record<string, T> | undefined => {
  if (!record || !(key in record)) {
    return record;
  }
  const next = { ...record };
  delete next[key];
  return next;
};

const setControls =
  (controls: Record<string, TopicControl>): Update =>
  (state) => ({ ...state, controls: { ...state.controls, ...controls } });

const followTags =
  (tags: string[], isFollowed: boolean): Update =>
  (state) => ({
    ...state,
    followedTags: tags.reduce(
      (list, tag) => toggle(list, tag, isFollowed),
      state.followedTags,
    ),
  });

const blockTags =
  (tags: string[], isBlocked: boolean): Update =>
  (state) => ({
    ...state,
    blockedTags: tags.reduce(
      (list, tag) => toggle(list, tag, isBlocked),
      state.blockedTags,
    ),
    followedTags: isBlocked
      ? state.followedTags.filter((tag) => !tags.includes(tag))
      : state.followedTags,
  });

const setParams =
  (params: Partial<Record<ParamKey, number>>): Update =>
  (state) => ({ ...state, params: { ...state.params, ...params } });

const chain =
  (...updates: Update[]): Update =>
  (state) =>
    updates.reduce((current, update) => update(current), state);

const hasTag = (post: Post, tags: string[]): boolean =>
  !!post.tags?.some((tag) => tags.includes(tag));

/** Topic families a viewer names in plain words. */
const families: Array<{
  words: RegExp;
  label: string;
  tag: string;
  matches: (tag: string) => boolean;
}> = [
  {
    words: /\b(ai|a\.i\.|llms?|gpt|chatgpt|genai|artificial intelligence)\b/,
    label: 'AI',
    tag: 'ai',
    matches: (tag) =>
      tag.split('-').includes('ai') ||
      [
        'llm',
        'machine-learning',
        'deep-learning',
        'prompt-engineering',
        'vibe-coding',
        'claude',
        'claude-code',
        'anthropic',
        'openai',
        'chatgpt',
        'google-gemini',
        'rag',
        'mcp',
        'reinforcement-learning',
      ].includes(tag),
  },
  {
    words: /\b(crypto|web3|blockchain|bitcoin|ethereum|nfts?)\b/,
    label: 'crypto',
    tag: 'crypto',
    matches: (tag) =>
      ['crypto', 'web3', 'blockchain', 'bitcoin', 'ethereum', 'nft'].includes(
        tag,
      ),
  },
  {
    words: /\b(front[- ]?end)\b/,
    label: 'frontend',
    tag: 'frontend',
    matches: (tag) =>
      [
        'frontend',
        'react',
        'css',
        'html',
        'javascript',
        'typescript',
        'nextjs',
        'astro',
        'tailwind-css',
        'ui-design',
      ].includes(tag),
  },
  {
    words: /\b(back[- ]?end)\b/,
    label: 'backend',
    tag: 'backend',
    matches: (tag) =>
      [
        'backend',
        'database',
        'sql',
        'postgresql',
        'redis',
        'kafka',
        'microservices',
        'distributed-systems',
        'nodejs',
        'rails',
      ].includes(tag),
  },
  {
    words: /\b(devops|infra|infrastructure)\b/,
    label: 'DevOps',
    tag: 'devops',
    matches: (tag) =>
      [
        'devops',
        'cicd',
        'docker',
        'docker-compose',
        'containers',
        'kubernetes',
        'infrastructure',
        'observability',
        'github-actions',
        'aws',
      ].includes(tag),
  },
  {
    words: /\b(career|jobs?|hiring|interviews?|layoffs?)\b/,
    label: 'career',
    tag: 'career',
    matches: (tag) =>
      ['career', 'leadership', 'hiring', 'interviews'].includes(tag),
  },
  {
    words: /\b(games?|gaming|gamedev)\b/,
    label: 'games',
    tag: 'gaming',
    matches: (tag) => ['gaming', 'game-development'].includes(tag),
  },
];

const genericWords = new Set([
  'a',
  'all',
  'an',
  'any',
  'anything',
  'articles',
  'content',
  'enough',
  'feed',
  'here',
  'it',
  'me',
  'more',
  'much',
  'my',
  'of',
  'on',
  'posts',
  'some',
  'something',
  'stuff',
  'that',
  'the',
  'them',
  'these',
  'things',
  'this',
  'those',
  'videos',
]);

const directionRules: Array<[RegExp, Direction]> = [
  [/\bnot enough\b/, Direction.More],
  [/\b(don'?t|do not|never|rarely|barely|can'?t|cannot) see\b/, Direction.More],
  [/\bno more\b/, Direction.Less],
  [/\b(don'?t|do not) (want|like|care|need)\b/, Direction.Less],
  [
    /\b(too (much|many)|less|fewer|stop|hide|block|remove|mute|tired of|sick of|enough (of|with)|hate|not interested|so (much|many)|lots of|full of|overloaded|spam)\b/,
    Direction.Less,
  ],
  [
    /\b(more|want|wish|missing|where('?s| is| are)|need|show me|i (like|love)|interested in|follow)\b/,
    Direction.More,
  ],
];

const strongPattern = /\b(block|hide|remove|never|ban|no more)\b/;
const levelPattern =
  /\b(junior|juniors|beginners?|basic|basics|too easy|entry[- ]level|shallow|surface[- ]level|newbies?|noobs?|101|senior|advanced|too hard|in[- ]depth|deeper|intermediate|expert)\b/;
const formatPattern = /\b(videos?|articles?|podcasts?|shorts|tweets?)\b/;
const freshPattern =
  /\b(old|older|outdated|stale|dated|ancient|newer|fresher|fresh|latest|recent)\b/;
const seenPattern =
  /\b(seen|already read|read (it|them|these) already|keeps? (showing|coming)|same posts|again and again|over and over)\b/;
const repeatPattern =
  /\b(repetitive|repeats?|repeating|same (stuff|thing|things|topics?|sources?)|duplicates?|all the same|too similar|similar|variety|diverse|diversity|monotonous|echo chamber)\b/;
const popularPattern =
  /\b(irrelevant|random|not relevant|not for me|clickbait|popular|generic|mainstream|trending|noise|junk)\b/;
const unknownTopicPattern =
  /(?:see|seeing|more|want|missing|about|need|into|love|like|follow)\s+(?:(?:any|some|more|enough|the|much)\s+)*#?([a-z][a-z0-9+#.-]*)/;

const getDirection = (clause: string): Direction | undefined =>
  directionRules.find(([pattern]) => pattern.test(clause))?.[1];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mentions = (clause: string, phrase: string): boolean =>
  new RegExp(
    `(?<![a-z0-9])${escapeRegExp(phrase).replace(/-/g, '[- ]?')}(?![a-z0-9])`,
  ).test(clause);

const toTag = (word: string): string =>
  word.replace(/^#/, '').replace(/[.,!?]+$/, '');

const getVocabulary = ({ state, pool, next }: ComplaintContext): string[] => [
  ...new Set([
    ...pool.flatMap((post) => post.tags ?? []),
    ...next.interests.map(({ tag }) => tag),
    ...state.followedTags,
    ...state.blockedTags,
  ]),
];

const findTopicGroups = (
  clause: string,
  vocabulary: string[],
): TopicGroup[] => {
  const groups: TopicGroup[] = [];
  const covered = new Set<string>();
  families
    .filter(({ words }) => words.test(clause))
    .forEach((family) => {
      const tags = vocabulary.filter(family.matches);
      groups.push({
        label: family.label,
        tags: tags.length ? tags : [family.tag],
      });
      (tags.length ? tags : [family.tag]).forEach((tag) => covered.add(tag));
    });
  const named = [
    ...[...clause.matchAll(/#([a-z0-9][a-z0-9+#.-]*)/g)].map(([, tag]) =>
      toTag(tag),
    ),
    ...vocabulary.filter((tag) => mentions(clause, tag)),
  ];
  [...new Set(named)]
    .filter((tag) => !covered.has(tag))
    .forEach((tag) => groups.push({ label: hashtag(tag), tags: [tag] }));
  return groups;
};

const findSources = (
  clause: string,
  { pool }: ComplaintContext,
  vocabulary: string[],
): SourceRef[] => {
  const sources = new Map<string, SourceRef>();
  pool.forEach(({ source }) => {
    if (!source?.id || !source.name) {
      return;
    }
    const name = source.name.toLowerCase();
    const isDistinct =
      name.length >= 4 &&
      !['awesome', 'collections', 'youtube'].includes(name) &&
      !vocabulary.includes(name);
    if (
      (isDistinct && mentions(clause, name)) ||
      mentions(clause, `from ${source.id}`)
    ) {
      sources.set(source.id, { id: source.id, name: source.name });
    }
  });
  return [...sources.values()];
};

const describeOnPage = (
  onPage: Decision[],
  served: Decision[],
  labels: string[],
): string =>
  onPage.length
    ? `${listSome(labels)} ${labels.length === 1 ? 'is' : 'are'} on ${
        onPage.length
      } of your ${served.length} posts.`
    : `None of your ${served.length} posts are about ${listSome(
        labels,
      )} right now.`;

/** Why the posts about a topic are on the page, in the viewer's terms. */
const describeWhy = (
  onPage: Decision[],
  tags: string[],
): string | undefined => {
  const byTopic = onPage.filter(
    (decision) =>
      decision.lane !== Lane.Popular &&
      !decision.followedBy &&
      decision.best &&
      tags.includes(decision.best.tag),
  ).length;
  const bySource = onPage.filter(
    ({ followedBy }) => followedBy === FollowKind.Source,
  );
  const byPopular = onPage.filter(({ lane }) => lane === Lane.Popular).length;
  const other = onPage.length - byTopic - bySource.length - byPopular;
  const parts = [
    byTopic && `${byTopic} match it in your profile`,
    bySource.length &&
      `${bySource.length} come from ${joinAnd([
        ...new Set(bySource.map(({ post }) => post.source?.name ?? '')),
      ])}, which you follow`,
    byPopular &&
      `${byPopular} ${byPopular === 1 ? 'is' : 'are'} popular fill-ins`,
    other > 0 && `${other} match other topics you have`,
  ].filter(Boolean) as string[];
  if (!parts.length) {
    return undefined;
  }
  const sentence = joinAnd(parts);
  return `${sentence.charAt(0).toUpperCase()}${sentence.slice(1)}.`;
};

const lessTopics = (
  group: TopicGroup,
  ctx: ComplaintContext,
  isStrong: boolean,
): ComplaintReading => {
  const { served, next, pool } = ctx;
  const onPage = served.filter(({ post }) => hasTag(post, group.tags));
  const pageTags = [
    ...new Set(onPage.flatMap(({ post }) => post.tags ?? [])),
  ].filter((tag) => group.tags.includes(tag));
  const profile = next.interests.filter(
    ({ tag, weight }) => group.tags.includes(tag) && weight > 0,
  );
  const followed = profile.filter(
    ({ origin }) => origin === InterestOrigin.Declared,
  );
  const poolTags = group.tags.filter((tag) =>
    pool.some(({ tags }) => tags?.includes(tag)),
  );
  const { label } = group;
  const findings = [
    describeOnPage(
      onPage,
      served,
      pageTags.length ? pageTags.map(hashtag) : [label],
    ),
    describeWhy(onPage, group.tags),
  ].filter(Boolean) as string[];
  const proposals: Proposal[] = [];
  const key = group.tags.join(',');

  const lessTags = [
    ...new Set([...profile.map(({ tag }) => tag), ...poolTags]),
  ];
  if (lessTags.length) {
    proposals.push({
      id: `less:${key}`,
      title: `Show less ${label}`,
      detail: `Sets ${listSome(
        lessTags.map(hashtag),
      )} to Less, so posts about ${
        lessTags.length === 1 ? 'it' : 'them'
      } rank lower, even ones that match your other topics.`,
      message: `Less ${label} from now on.`,
      update: setControls(
        Object.fromEntries(
          lessTags.map((tag) => [tag, { mode: TopicMode.Demoted }]),
        ),
      ),
      focus: { tags: group.tags },
    });
  }
  if (profile.length) {
    proposals.push({
      id: `off:${key}`,
      title: `Stop learning ${label}`,
      detail: `Reading about ${listSome(
        profile.map(({ tag }) => hashtag(tag)),
      )} stops counting; follows still work.`,
      message: `Stopped learning ${label} from your reading.`,
      update: setControls(
        Object.fromEntries(
          profile.map(({ tag }) => [tag, { mode: TopicMode.StopLearning }]),
        ),
      ),
      focus: { tags: group.tags },
    });
  }

  const toBlock = poolTags.length ? poolTags : group.tags;
  const block: Proposal = {
    id: `block:${key}`,
    title: `Block ${label}`,
    detail: onPage.length
      ? `Hides every post tagged ${listSome(
          toBlock.map(hashtag),
        )}, even from sources you follow.`
      : `None are on your page now; this keeps posts tagged ${listSome(
          toBlock.map(hashtag),
        )} out.`,
    message: `Blocked ${label}.`,
    update: blockTags(toBlock, true),
    focus: { tags: group.tags },
  };
  if (isStrong || !profile.length) {
    proposals.unshift(block);
  } else {
    proposals.push(block);
  }

  return { complaint: '', findings, proposals, limits: [] };
};

const moreTopics = (
  group: TopicGroup,
  ctx: ComplaintContext,
): ComplaintReading => {
  const { served, next, pool, state } = ctx;
  const inPool = pool.filter((post) => hasTag(post, group.tags));
  const onPage = served.filter(({ post }) => hasTag(post, group.tags));
  const poolTags = [
    ...new Set(inPool.flatMap((post) => post.tags ?? [])),
  ].filter((tag) => group.tags.includes(tag));
  // The two tags with the most posts carry a family; following all of them
  // would bury the rest of the profile.
  const tags = (poolTags.length ? poolTags : group.tags)
    .map((tag) => ({
      tag,
      count: inPool.filter((post) => post.tags?.includes(tag)).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .map(({ tag }) => tag);
  const label = group.label;
  const blocked = tags.filter((tag) => state.blockedTags.includes(tag));
  const findings: string[] = [];
  const proposals: Proposal[] = [];

  if (!inPool.length) {
    findings.push(
      `There are no ${label} posts among the ${pool.length} your feed picks from right now.`,
    );
  } else if (onPage.length) {
    findings.push(describeOnPage(onPage, served, [label]));
    if (inPool.length > onPage.length) {
      findings.push(
        `${plural(
          inPool.length - onPage.length,
          'other post',
        )} about it didn't make your page.`,
      );
    }
  } else {
    findings.push(
      `None of your ${served.length} posts are about ${label}, but ${plural(
        inPool.length,
        'post',
      )} your feed picks from ${inPool.length === 1 ? 'is' : 'are'}.`,
    );
  }
  if (blocked.length) {
    findings.push(
      `You blocked ${joinAnd(blocked.map(hashtag))}, so ${
        blocked.length === 1 ? 'its' : 'their'
      } posts never show.`,
    );
    proposals.push({
      id: `unblock:${blocked.join(',')}`,
      title: `Unblock ${joinAnd(blocked.map(hashtag))}`,
      detail: 'Its posts can show again.',
      message: `Unblocked ${joinAnd(blocked.map(hashtag))}.`,
      update: blockTags(blocked, false),
      focus: { tags },
    });
  }

  const describeChange = (update: Update): string => {
    const after = rankFeed(pool, update(state), ctx.now).interests;
    return listSome(
      tags.map((tag) => {
        const before = next.interests.find((interest) => interest.tag === tag);
        const now = after.find((interest) => interest.tag === tag);
        return before && before.weight > 0
          ? `${hashtag(tag)} ${formatBoost(before.weight)} → ${formatBoost(
              now?.weight ?? 0,
            )}`
          : `adds ${hashtag(tag)} at ${formatBoost(now?.weight ?? 0)}`;
      }),
      2,
    );
  };

  const toFollow = tags.filter((tag) => !state.followedTags.includes(tag));
  if (toFollow.length) {
    const update = chain(blockTags(blocked, false), followTags(toFollow, true));
    proposals.push({
      id: `follow:${toFollow.join(',')}`,
      title: `Follow ${joinAnd(toFollow.map(hashtag))}`,
      detail: inPool.length
        ? `${describeChange(update)}.`
        : `New ${label} posts come into your feed as soon as they're published.`,
      message: `Following ${joinAnd(toFollow.map(hashtag))}.`,
      update,
      focus: { tags },
    });
  }

  if (inPool.length) {
    const boosts = Object.fromEntries(
      tags.map((tag) => {
        const weight =
          next.interests.find((interest) => interest.tag === tag)?.weight ?? 0;
        return [
          tag,
          {
            weight: round(Math.min(maxTopicWeight, Math.max(1, weight + 0.5))),
          },
        ];
      }),
    );
    const update = chain(blockTags(blocked, false), setControls(boosts));
    proposals.push({
      id: `boost:${tags.join(',')}`,
      title: `Boost ${label}`,
      detail: `${describeChange(update)}.`,
      message: `Boosted ${label}.`,
      update,
      focus: { tags },
    });
  }

  return { complaint: '', findings, proposals, limits: [] };
};

const sourceReading = (
  source: SourceRef,
  direction: Direction,
  ctx: ComplaintContext,
  isStrong: boolean,
): ComplaintReading => {
  const { served, state } = ctx;
  const onPage = served.filter(({ post }) => post.source?.id === source.id);
  const isFollowed = state.followedSources.includes(source.id);
  const isBlocked = state.blockedSources.includes(source.id);
  const multiplier = state.params['follows.source_multiplier'];
  const findings = [
    onPage.length
      ? `${onPage.length} of your ${served.length} posts ${
          onPage.length === 1 ? 'is' : 'are'
        } from ${source.name}.`
      : `None of your ${served.length} posts are from ${source.name} right now.`,
    isFollowed &&
      `You follow it, so its posts count ×${multiplier.toFixed(2)}.`,
    isBlocked && `You blocked it, so its posts never show.`,
  ].filter(Boolean) as string[];
  const focus = { sourceId: source.id };
  const follow =
    (isOn: boolean): Update =>
    (current) => ({
      ...current,
      followedSources: toggle(current.followedSources, source.id, isOn),
      blockedSources: isOn
        ? toggle(current.blockedSources, source.id, false)
        : current.blockedSources,
      sourceWeights: isOn
        ? current.sourceWeights
        : withoutKey(current.sourceWeights, source.id),
    });
  const block: Proposal = {
    id: `block-source:${source.id}`,
    title: `Block ${source.name}`,
    detail: 'None of its posts show again, even ones about topics you follow.',
    message: `Blocked ${source.name}.`,
    update: (current) => ({
      ...current,
      blockedSources: toggle(current.blockedSources, source.id, true),
      followedSources: toggle(current.followedSources, source.id, false),
    }),
    focus,
  };

  if (direction === Direction.More) {
    return {
      complaint: '',
      findings,
      proposals: isFollowed
        ? []
        : [
            {
              id: `follow-source:${source.id}`,
              title: `Follow ${source.name}`,
              detail: `Every post from it can come in, and counts ×${multiplier.toFixed(
                2,
              )}.`,
              message: `Following ${source.name}.`,
              update: follow(true),
              focus,
            },
          ],
      limits: isFollowed
        ? [`You already follow ${source.name}; it publishes what you see.`]
        : [],
    };
  }

  const proposals: Proposal[] = [
    ...(isFollowed
      ? [
          {
            id: `unfollow-source:${source.id}`,
            title: `Unfollow ${source.name}`,
            detail: 'Its posts only show when they match your topics.',
            message: `Unfollowed ${source.name}.`,
            update: follow(false),
            focus,
          },
        ]
      : []),
    {
      id: `less-source:${source.id}`,
      title: `Show less from ${source.name}`,
      detail: `Its posts count ×${state.params[
        'interests.control_demote'
      ].toFixed(2)} as much.`,
      message: `Less from ${source.name}.`,
      update: (current) => ({
        ...current,
        sourceControls: {
          ...current.sourceControls,
          [source.id]: SourceMode.Demoted,
        },
        sourceWeights: withoutKey(current.sourceWeights, source.id),
      }),
      focus,
    },
  ];
  return {
    complaint: '',
    findings,
    proposals: isStrong ? [block, ...proposals] : [...proposals, block],
    limits: [],
  };
};

const freshnessReading = (ctx: ComplaintContext): ComplaintReading => {
  const { served, state } = ctx;
  const ages = served.map(({ ageDays }) => ageDays);
  const average = Math.round(
    ages.reduce((sum, age) => sum + age, 0) / Math.max(1, ages.length),
  );
  const halfLife = state.params['age.half_life_days'];
  const maxAge = state.params['feed.max_candidate_age_days'];
  const proposals: Proposal[] = [];
  if (halfLife > 3) {
    proposals.push({
      id: 'param:age.half_life_days',
      title: 'Favor newer posts',
      detail: `A post loses half its pull every 3 days instead of ${halfLife}.`,
      message: 'Newer posts first.',
      update: setParams({ 'age.half_life_days': 3 }),
    });
  }
  if (maxAge > 14) {
    proposals.push({
      id: 'param:feed.max_candidate_age_days',
      title: 'Skip posts older than 2 weeks',
      detail: `Today the limit is ${maxAge} days.`,
      message: 'Posts older than 2 weeks are out.',
      update: setParams({ 'feed.max_candidate_age_days': 14 }),
    });
  }
  return {
    complaint: '',
    findings: [
      `Posts on your page are ${plural(
        average,
        'day',
      )} old on average; the oldest is ${plural(
        Math.round(Math.max(0, ...ages)),
        'day',
      )}.`,
    ],
    proposals,
    limits: proposals.length
      ? []
      : ['Your feed already favors the newest posts it can.'],
  };
};

const seenReading = (ctx: ComplaintContext): ComplaintReading => {
  const { served, state } = ctx;
  const seen = served.filter(({ impressions }) => impressions > 0);
  const maxViews = state.params['history.max_impressions_without_action'];
  const keep = state.params['history.seen_factor_per_show'];
  return {
    complaint: '',
    findings: [
      seen.length
        ? `${seen.length} of your ${served.length} posts were on your screen before without a click.`
        : `None of your ${served.length} posts were on your screen before.`,
    ],
    proposals: [
      ...(maxViews > 3
        ? [
            {
              id: 'param:history.max_impressions_without_action',
              title: 'Drop posts you keep skipping sooner',
              detail: `A post leaves after 3 views without a click instead of ${maxViews}.`,
              message: 'Skipped posts leave after 3 views.',
              update: setParams({
                'history.max_impressions_without_action': 3,
              }),
            },
          ]
        : []),
      ...(keep > 0.5
        ? [
            {
              id: 'param:history.seen_factor_per_show',
              title: 'Push skipped posts down faster',
              detail: `Each view keeps 50% of a post's pull instead of ${Math.round(
                keep * 100,
              )}%.`,
              message: 'Skipped posts drop faster.',
              update: setParams({ 'history.seen_factor_per_show': 0.5 }),
            },
          ]
        : []),
    ],
    limits: [],
  };
};

const repeatReading = (ctx: ComplaintContext): ComplaintReading => {
  const { served, state } = ctx;
  const count = (key: (decision: Decision) => string | undefined) => {
    const counts = new Map<string, number>();
    served.forEach((decision) => {
      const value = key(decision);
      if (value) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  };
  const topTopic = count(({ post }) => post.tags?.[0]);
  const topSource = count(({ post }) => post.source?.name);
  const { params } = state;
  const findings = [
    topTopic &&
      topTopic[1] > 1 &&
      `${hashtag(topTopic[0])} leads ${topTopic[1]} of your ${
        served.length
      } posts.`,
    topSource &&
      topSource[1] > 1 &&
      `${topSource[1]} are from ${topSource[0]}.`,
  ].filter(Boolean) as string[];
  const proposals: Proposal[] = (
    [
      [
        'diversity.topic_repeat_discount',
        0.35,
        'Spread out similar topics',
        'Each post on a similar topic above',
        'Topics spread out.',
      ],
      [
        'diversity.source_repeat_discount',
        0.25,
        'Spread out sources',
        'Each post from the same source above',
        'Sources spread out.',
      ],
      [
        'diversity.same_headline_discount',
        0.4,
        'Push down the same story',
        'A post with the same headline above',
        'Repeat stories drop.',
      ],
    ] as Array<[ParamKey, number, string, string, string]>
  )
    .filter(([key, value]) => params[key] < value)
    .map(([key, value, title, cause, message]) => ({
      id: `param:${key}`,
      title,
      detail: `${cause} lowers the next by ${Math.round(
        value * 100,
      )}% instead of ${Math.round(params[key] * 100)}%.`,
      message,
      update: setParams({ [key]: value }),
    }));
  return { complaint: '', findings, proposals, limits: [] };
};

const popularReading = (ctx: ComplaintContext): ComplaintReading => {
  const { served, state } = ctx;
  const popular = served.filter(({ lane }) => lane === Lane.Popular).length;
  const learned = served.filter(
    (decision) =>
      decision.lane !== Lane.Popular &&
      !decision.followedBy &&
      decision.best?.origin === InterestOrigin.Inferred,
  ).length;
  const findings = [
    popular > 0 &&
      `${popular} of your posts ${
        popular === 1 ? 'is a popular fill-in' : 'are popular fill-ins'
      }, not from your topics.`,
    learned > 0 &&
      `${learned} come from topics learned from your reading, not ones you follow.`,
  ].filter(Boolean) as string[];
  const proposals: Proposal[] = [
    ...(popular > 0 && state.isFillingWithPopular
      ? [
          {
            id: 'filling',
            title: 'Stop popular fill-ins',
            detail:
              'A short feed stays short instead of topping up with popular posts.',
            message: 'No more popular fill-ins.',
            update: (current: PersonalizationState) => ({
              ...current,
              isFillingWithPopular: false,
            }),
          },
        ]
      : []),
    ...(learned > 0 && state.isLearning
      ? [
          {
            id: 'learning',
            title: 'Only use topics I follow',
            detail:
              'Stops learning from your reading. Topics you follow and sources stay.',
            message: 'Only topics you follow count.',
            update: (current: PersonalizationState) => ({
              ...current,
              isLearning: false,
            }),
          },
        ]
      : []),
  ];
  return {
    complaint: '',
    findings: findings.length
      ? findings
      : ['Every post here matches a topic or source you follow.'],
    proposals,
    limits: proposals.length
      ? []
      : ['Name the topic or source that feels off and I can lower it.'],
  };
};

const levelReading = (): ComplaintReading => ({
  complaint: '',
  findings: [],
  proposals: [],
  limits: [
    "Your feed can't tell how advanced a post is yet. It ranks by your topics, how readers responded, freshness and variety.",
    'Until it can, Fewer like this on a post that feels basic takes it off your feed.',
  ],
});

const formatReading = (ctx: ComplaintContext): ComplaintReading => {
  const { served } = ctx;
  const videos = served.filter(({ post }) => post.type?.startsWith('video'));
  const channels = [
    ...new Set(videos.map(({ post }) => post.source?.name ?? '')),
  ].filter(Boolean);
  return {
    complaint: '',
    findings: [
      `${videos.length} of your ${served.length} posts are videos${
        channels.length ? `, from ${listSome(channels, 2)}` : ''
      }.`,
    ],
    proposals: [],
    limits: [
      "Your feed can't filter by format yet. Blocking or unfollowing a channel on its card removes its posts.",
    ],
  };
};

const splitClauses = (text: string): string[] =>
  text
    .split(/\s*(?:[,;]|\bbut\b|\balso\b|\bplus\b)\s*/)
    .flatMap((part) =>
      part.split(
        /\s+and\s+(?=(?:not|no|more|less|fewer|too|i|i'm|stop|show|where|missing|want|the)\b)/,
      ),
    )
    .map((part) => part.trim())
    .filter(Boolean);

const readClause = (
  clause: string,
  ctx: ComplaintContext,
  vocabulary: string[],
): ComplaintReading[] => {
  if (levelPattern.test(clause)) {
    return [levelReading()];
  }
  const groups = findTopicGroups(clause, vocabulary);
  const sources = findSources(clause, ctx, vocabulary);
  const isStrong = strongPattern.test(clause);
  const direction = getDirection(clause);
  if (groups.length || sources.length) {
    return [
      ...groups.map((group) => {
        const isOnPage = ctx.served.some(({ post }) =>
          hasTag(post, group.tags),
        );
        const groupDirection =
          direction ?? (isOnPage ? Direction.Less : Direction.More);
        return groupDirection === Direction.Less
          ? lessTopics(group, ctx, isStrong)
          : moreTopics(group, ctx);
      }),
      ...sources.map((source) =>
        sourceReading(source, direction ?? Direction.Less, ctx, isStrong),
      ),
    ];
  }
  if (formatPattern.test(clause)) {
    return [formatReading(ctx)];
  }
  if (seenPattern.test(clause)) {
    return [seenReading(ctx)];
  }
  if (freshPattern.test(clause)) {
    return [freshnessReading(ctx)];
  }
  if (repeatPattern.test(clause)) {
    return [repeatReading(ctx)];
  }
  if (popularPattern.test(clause)) {
    return [popularReading(ctx)];
  }
  const word = clause.match(unknownTopicPattern)?.[1];
  if (word && !genericWords.has(toTag(word))) {
    const tag = toTag(word);
    const group = { label: hashtag(tag), tags: [tag] };
    return [
      direction === Direction.Less
        ? lessTopics(group, ctx, isStrong)
        : moreTopics(group, ctx),
    ];
  }
  return [];
};

export const interpretComplaint = (
  complaint: string,
  ctx: ComplaintContext,
): ComplaintReading => {
  const text = complaint
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const vocabulary = getVocabulary(ctx);
  const readings = splitClauses(text).flatMap((clause) =>
    readClause(clause, ctx, vocabulary),
  );
  const proposals = new Map<string, Proposal>();
  readings.forEach((reading) =>
    reading.proposals.forEach((proposal) =>
      proposals.set(proposal.id, {
        ...proposal,
        isPlusOnly: /^(boost|param):/.test(proposal.id),
      }),
    ),
  );
  const ordered = [...proposals.values()].sort((a, b) =>
    ctx.isPlus ? 0 : Number(!!a.isPlusOnly) - Number(!!b.isPlusOnly),
  );
  const unique = (items: string[]) => [...new Set(items)];
  const reading: ComplaintReading = {
    complaint,
    findings: unique(readings.flatMap(({ findings }) => findings)),
    proposals: ordered,
    limits: unique(readings.flatMap(({ limits }) => limits)),
  };
  if (!reading.findings.length && !reading.limits.length) {
    const topTag = ctx.served
      .flatMap(({ post }) => post.tags?.slice(0, 1) ?? [])
      .sort(
        (a, b) =>
          ctx.served.filter(({ post }) => post.tags?.[0] === b).length -
          ctx.served.filter(({ post }) => post.tags?.[0] === a).length,
      )[0];
    const source = ctx.served.find(({ post }) => post.source?.name)?.post.source
      ?.name;
    reading.limits.push(
      `I couldn't match that to your feed yet. Try naming a topic or a source, like "less #${
        topTag ?? 'career'
      }" or "more from ${source ?? 'Fireship'}".`,
    );
  }
  return reading;
};

export interface ProposalEffect {
  leaving: number;
  entering: number;
  /** New posts on the page that carry the proposal's topics or source. */
  focusEntering: number;
}

const matchesFocus = (post: Post, focus?: Focus): boolean =>
  !!focus &&
  (hasTag(post, focus.tags ?? []) ||
    (!!focus.sourceId && post.source?.id === focus.sourceId));

/** Re-ranks the pool with the proposal applied and compares the pages. */
export const getProposalEffect = (
  proposal: Proposal,
  {
    state,
    pool,
    next,
    now,
  }: Pick<ComplaintContext, 'state' | 'pool' | 'next' | 'now'>,
): ProposalEffect => {
  const after = rankFeed(pool, proposal.update(state), now).served;
  const beforeIds = new Set(next.served.map(({ post }) => post.id));
  const afterIds = new Set(after.map(({ post }) => post.id));
  const entering = after.filter(({ post }) => !beforeIds.has(post.id));
  return {
    leaving: next.served.filter(({ post }) => !afterIds.has(post.id)).length,
    entering: entering.length,
    focusEntering: entering.filter(({ post }) =>
      matchesFocus(post, proposal.focus),
    ).length,
  };
};

export const describeEffect = (
  effect: ProposalEffect,
  proposal: Proposal,
): string => {
  if (!effect.leaving && !effect.entering) {
    return 'Your next page keeps the same posts.';
  }
  const about =
    effect.focusEntering > 0
      ? ` ${effect.focusEntering} of the new ones ${
          effect.focusEntering === 1 ? 'is' : 'are'
        } ${proposal.focus?.sourceId ? 'from it' : 'about it'}.`
      : '';
  if (!effect.entering) {
    return `On refresh, ${plural(effect.leaving, 'post')} ${
      effect.leaving === 1 ? 'leaves' : 'leave'
    } and nothing replaces ${effect.leaving === 1 ? 'it' : 'them'}.`;
  }
  return `On refresh, ${plural(effect.leaving, 'post')} ${
    effect.leaving === 1 ? 'leaves' : 'leave'
  } and ${effect.entering} ${
    effect.entering === 1 ? 'comes' : 'come'
  } in.${about}`;
};

export const isProposalApplied = (
  proposal: Proposal,
  state: PersonalizationState,
): boolean => JSON.stringify(proposal.update(state)) === JSON.stringify(state);
