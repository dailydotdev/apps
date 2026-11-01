import type {
  WhatsOff,
  WhatsOffChange,
  WhatsOffLine,
  WhatsOffTarget,
} from './types';
import {
  FeedSourceMode,
  FeedTopicMode,
  WhatsOffLineKind,
  WhatsOffOp,
  WhatsOffTargetType,
} from './types';
import { formatRankingValue, getRankingSettingMeta } from './ranking';

// The API turns away longer text (its own WHATS_OFF_MAX_LENGTH).
export const WHATS_OFF_MAX_LENGTH = 500;

export interface WhatsOffChangeCopy {
  title: string;
  detail?: string;
}

const formatLabels: Record<string, string> = {
  article: 'articles',
  video: 'videos',
  poll: 'polls',
  share: 'shared posts',
  freeform: 'freeform posts',
  collection: 'collections',
  social: 'social posts',
};

const curationLabels: Record<string, string> = {
  news: 'news',
  opinion: 'opinion posts',
  listicle: 'listicles',
  meme: 'memes',
  release: 'releases',
  story: 'stories',
  tutorial: 'tutorials',
  comparison: 'comparisons',
};

const resetCopy: Record<string, WhatsOffChangeCopy> = {
  learned: { title: 'Forget what your feed learned from your reading' },
  seen: { title: 'Forget the posts you scrolled past' },
  levels: { title: 'Clear every Show more and Show less' },
  everything: {
    title: 'Start your feed over',
    detail:
      'Forgets your reading and what you scrolled past, and clears your levels and ranking settings',
  },
};

const gapLabels: Record<string, string> = {
  level: 'how advanced posts are',
  language: 'the language posts are in',
  quality: 'post quality',
};

// A topic reads as its title, or as the raw tag when it has none.
const getTargetName = (target: WhatsOffTarget | null | undefined): string => {
  if (!target) {
    return '';
  }
  return target.type === WhatsOffTargetType.Keyword && target.name === target.id
    ? `#${target.id}`
    : target.name;
};

const getTopicCopy = (name: string, mode: string | null | undefined) => {
  switch (mode) {
    case FeedTopicMode.Boost:
      return { title: `Show more ${name}` };
    case FeedTopicMode.Demote:
      return { title: `Show less ${name}` };
    case FeedTopicMode.Off:
      return {
        title: `Turn off ${name} in For You`,
        detail: 'Other feeds keep it',
      };
    case FeedTopicMode.StopLearning:
      return { title: `Stop learning ${name} from your reading` };
    default:
      return { title: `Set ${name} back to Auto` };
  }
};

const topicList = new Intl.ListFormat('en-US');

// A family's title counts its topics and its detail names them.
const getTopicFamilyCopy = (
  names: string[],
  mode: string | null | undefined,
): WhatsOffChangeCopy => {
  const topics = `these ${names.length} topics`;
  const detail = topicList.format(names);
  switch (mode) {
    case FeedTopicMode.Boost:
      return { title: `Show more of ${topics}`, detail };
    case FeedTopicMode.Demote:
      return { title: `Show less of ${topics}`, detail };
    case FeedTopicMode.Off:
      return {
        title: `Turn off ${topics} in For You`,
        detail: `${detail}. Other feeds keep them`,
      };
    case FeedTopicMode.StopLearning:
      return { title: `Stop learning ${topics} from your reading`, detail };
    default:
      return { title: `Set ${topics} back to Auto`, detail };
  }
};

const getFollowCopy = (name: string, mode: string | null | undefined) => {
  switch (mode) {
    case FeedSourceMode.Boost:
      return { title: `Show more from ${name}` };
    case FeedSourceMode.Demote:
      return { title: `Show less from ${name}` };
    case FeedSourceMode.Off:
      return { title: `Ignore your follow of ${name} in For You` };
    default:
      return { title: `Set ${name} back to Auto` };
  }
};

const getRankingCopy = ({
  value: key,
  from,
  to,
}: WhatsOffChange): WhatsOffChangeCopy => {
  const meta = key ? getRankingSettingMeta(key) : undefined;
  const title = meta?.label ?? key ?? 'Ranking setting';
  if (!meta || typeof from !== 'number' || typeof to !== 'number') {
    return { title };
  }
  return {
    title,
    detail: `From ${formatRankingValue(
      meta.format,
      from,
    )} to ${formatRankingValue(meta.format, to)}`,
  };
};

/** What a change does, in the words its row shows. */
export const getWhatsOffChangeCopy = (
  change: WhatsOffChange,
): WhatsOffChangeCopy => {
  const name = getTargetName(change.target);
  const show = change.enabled ? 'Show' : 'Hide';
  switch (change.op) {
    case WhatsOffOp.Topic:
      return getTopicCopy(name, change.mode);
    case WhatsOffOp.TopicFamily:
      return getTopicFamilyCopy(
        (change.tags ?? []).map(getTargetName),
        change.mode,
      );
    case WhatsOffOp.Source:
    case WhatsOffOp.Author:
      return getFollowCopy(name, change.mode);
    case WhatsOffOp.Follow:
      return { title: `Follow ${name}` };
    case WhatsOffOp.Unfollow:
      return { title: `Unfollow ${name}` };
    case WhatsOffOp.Block:
      return { title: `Block ${name}`, detail: 'Hidden from every feed' };
    case WhatsOffOp.Unblock:
      return { title: `Unblock ${name}` };
    case WhatsOffOp.Format:
      return {
        title: `${show} ${formatLabels[change.value ?? ''] ?? change.value}`,
      };
    case WhatsOffOp.Curation:
      return {
        title: `${show} ${curationLabels[change.value ?? ''] ?? change.value}`,
      };
    case WhatsOffOp.Squads:
      return { title: `${show} posts from squads` };
    case WhatsOffOp.BlockedWord:
      return { title: `Hide posts with “${change.value}” in the title` };
    case WhatsOffOp.ClickbaitShield:
      return change.enabled
        ? {
            title: 'Turn on Clickbait Shield',
            detail: 'Rewrites clickbait titles but keeps the posts',
          }
        : { title: 'Turn off Clickbait Shield' };
    case WhatsOffOp.Learning:
      return change.enabled
        ? { title: 'Learn from your reading again' }
        : {
            title: 'Stop learning from your reading',
            detail: 'Your feed ranks on your follows alone',
          };
    case WhatsOffOp.FillIns:
      return change.enabled
        ? { title: 'Fill your feed with popular posts' }
        : {
            title: 'Turn off popular fill-ins',
            detail: 'Only posts from your follows and interests',
          };
    case WhatsOffOp.Reset:
      return resetCopy[change.value ?? ''] ?? resetCopy.everything;
    case WhatsOffOp.Ranking:
      return getRankingCopy(change);
    case WhatsOffOp.HidePosts: {
      const count = change.postIds?.length ?? 0;
      return {
        title: count === 1 ? 'Hide this post' : `Hide these ${count} posts`,
      };
    }
    // Never shown: the answer drops the ops this build doesn't know.
    default:
      return { title: '' };
  }
};

const knownOps = new Set<string>(Object.values(WhatsOffOp));

/**
 * The line's changes this build can show, its own first. The API can send ops
 * added after it, which it couldn't apply.
 */
export const getWhatsOffLineChanges = (line: WhatsOffLine): WhatsOffChange[] =>
  [line.change, ...line.alternatives].filter(
    (change): change is WhatsOffChange => !!change && knownOps.has(change.op),
  );

/** Missing and already lines say something; the others offer changes. */
export const isWhatsOffNoteLine = ({ kind }: WhatsOffLine): boolean =>
  kind === WhatsOffLineKind.Missing || kind === WhatsOffLineKind.Already;

/** A line left with no change to offer isn't shown. */
export const isWhatsOffLineShown = (line: WhatsOffLine): boolean =>
  isWhatsOffNoteLine(line) || getWhatsOffLineChanges(line).length > 0;

/** Tells two changes apart, for list keys and the picked one. */
export const getWhatsOffChangeKey = ({
  op,
  target,
  tags,
  mode,
  value,
  enabled,
  to,
  postIds,
}: WhatsOffChange): string =>
  JSON.stringify([
    op,
    target?.id,
    tags?.map(({ id }) => id),
    mode,
    value,
    enabled,
    to,
    postIds,
  ]);

/** The line's note on what no setting covers yet. */
export const getWhatsOffGapNote = (line: WhatsOffLine): string => {
  const gap = line.gap ? gapLabels[line.gap] : undefined;
  const note = gap
    ? `There's no setting for ${gap} yet.`
    : "There's no setting for this yet.";
  return line.kind === WhatsOffLineKind.Missing ? `${note} We noted it.` : note;
};

export const getWhatsOffSubmitExtra = ({
  response,
  scope,
  lines,
}: WhatsOff) => ({
  response,
  scope,
  kinds: lines.reduce<Partial<Record<WhatsOffLineKind, number>>>(
    (counts, { kind }) => ({ ...counts, [kind]: (counts[kind] ?? 0) + 1 }),
    {},
  ),
  gaps: lines.flatMap(({ gap }) => (gap ? [gap] : [])),
});

// Which change of the answer the reader acted on: the line's position, and 0
// for its own change or n for its nth alternative. With the answer id it
// points at the exact change in the API's log of the answer.
export const getWhatsOffChangeExtra = (
  line: WhatsOffLine,
  lineIndex: number,
  change: WhatsOffChange,
  isPlus: boolean,
) => ({
  line: lineIndex,
  option: change === line.change ? 0 : line.alternatives.indexOf(change) + 1,
  kind: line.kind,
  op: change.op,
  gap: line.gap ?? undefined,
  certainty: change.certainty ?? undefined,
  locked: change.plusOnly && !isPlus,
});
