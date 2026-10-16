import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';

/** Why the ranker put a post in For You, in the order it checks them. */
export enum FeedReason {
  Following = 'following',
  Picked = 'picked',
  Reading = 'reading',
  Popular = 'popular',
}

export enum SignalKind {
  Topic = 'topic',
  Source = 'source',
}

/** Where a signal came from for this viewer. `Post` means it only appears. */
export enum SignalOrigin {
  Following = 'following',
  Picked = 'picked',
  Reading = 'reading',
  Post = 'post',
}

/**
 * Proposed per-topic and per-source weight. Today's API only has follow and
 * block, so `Less` and `More` are new.
 */
export enum TuneLevel {
  Less = 'less',
  More = 'more',
  Blocked = 'blocked',
}

export interface FeedSignal {
  key: string;
  kind: SignalKind;
  id: string;
  label: string;
  origin: SignalOrigin;
  source?: Source;
}

export interface ExplainedPost {
  post: Post;
  reason: FeedReason;
  /** The signal the reason sentence names; absent for popular picks. */
  reasonSignal?: FeedSignal;
  /** Every topic and the source, matched ones first. */
  signals: FeedSignal[];
}

/** What a new viewer told us, or what we inferred, a few days in. */
export interface ViewerProfile {
  pickedTags: string[];
  readingTags: string[];
  followedSources: string[];
}

export const getSignalKey = (kind: SignalKind, id: string): string =>
  `${kind}:${id}`;

export const getSignalName = (signal: Pick<FeedSignal, 'kind' | 'label'>) =>
  signal.kind === SignalKind.Topic ? `#${signal.label}` : signal.label;

const originRank: Record<SignalOrigin, number> = {
  [SignalOrigin.Following]: 0,
  [SignalOrigin.Picked]: 1,
  [SignalOrigin.Reading]: 2,
  [SignalOrigin.Post]: 3,
};

const reasonByOrigin: Partial<Record<SignalOrigin, FeedReason>> = {
  [SignalOrigin.Following]: FeedReason.Following,
  [SignalOrigin.Picked]: FeedReason.Picked,
  [SignalOrigin.Reading]: FeedReason.Reading,
};

export const explainPost = (
  post: Post,
  profile: ViewerProfile,
): ExplainedPost => {
  const getTagOrigin = (tag: string): SignalOrigin => {
    if (profile.pickedTags.includes(tag)) {
      return SignalOrigin.Picked;
    }
    return profile.readingTags.includes(tag)
      ? SignalOrigin.Reading
      : SignalOrigin.Post;
  };
  const topics = (post.tags ?? []).map(
    (tag): FeedSignal => ({
      key: getSignalKey(SignalKind.Topic, tag),
      kind: SignalKind.Topic,
      id: tag,
      label: tag,
      origin: getTagOrigin(tag),
    }),
  );
  const { source } = post;
  const sourceSignal: FeedSignal[] = source?.id
    ? [
        {
          key: getSignalKey(SignalKind.Source, source.id),
          kind: SignalKind.Source,
          id: source.id,
          label: source.name ?? source.id,
          origin: profile.followedSources.includes(source.id)
            ? SignalOrigin.Following
            : SignalOrigin.Post,
          source,
        },
      ]
    : [];
  const signals = [...sourceSignal, ...topics].sort(
    (a, b) => originRank[a.origin] - originRank[b.origin],
  );
  const reasonSignal = signals.find(
    ({ origin }) => origin !== SignalOrigin.Post,
  );

  return {
    post,
    reason: reasonSignal
      ? reasonByOrigin[reasonSignal.origin] ?? FeedReason.Popular
      : FeedReason.Popular,
    reasonSignal,
    signals,
  };
};

/**
 * The rows a card has room for: matched topics, then the post's other
 * topics, and the source last so it can always be blocked.
 */
export const getCardSignals = (
  item: ExplainedPost,
  limit: number,
): FeedSignal[] => {
  const source = item.signals.find(({ kind }) => kind === SignalKind.Source);
  const topics = item.signals.filter(({ kind }) => kind === SignalKind.Topic);
  const isSourceLed = source && source.origin !== SignalOrigin.Post;

  if (!source) {
    return topics.slice(0, limit);
  }

  return isSourceLed
    ? [source, ...topics.slice(0, limit - 1)]
    : [...topics.slice(0, limit - 1), source];
};

interface ReasonMeta {
  label: string;
  dotClassName: string;
}

export const reasonMeta: Record<FeedReason, ReasonMeta> = {
  [FeedReason.Picked]: {
    label: 'Topics you picked',
    dotClassName: 'bg-accent-cabbage-default',
  },
  [FeedReason.Reading]: {
    label: 'Like what you read',
    dotClassName: 'bg-accent-blueCheese-default',
  },
  [FeedReason.Following]: {
    label: 'Sources you follow',
    dotClassName: 'bg-accent-water-default',
  },
  [FeedReason.Popular]: {
    label: 'Popular picks',
    dotClassName: 'bg-accent-cheese-default',
  },
};

export const reasonOrder: FeedReason[] = [
  FeedReason.Picked,
  FeedReason.Reading,
  FeedReason.Following,
  FeedReason.Popular,
];

export const originLabel: Record<SignalOrigin, string> = {
  [SignalOrigin.Following]: 'You follow it',
  [SignalOrigin.Picked]: 'You picked it',
  [SignalOrigin.Reading]: 'From your reading',
  [SignalOrigin.Post]: '',
};

export const levelLabel: Record<TuneLevel, string> = {
  [TuneLevel.More]: 'Showing more',
  [TuneLevel.Less]: 'Showing less',
  [TuneLevel.Blocked]: 'Blocked',
};

export const levelTextClassName: Record<TuneLevel, string> = {
  [TuneLevel.More]: 'text-accent-avocado-default',
  [TuneLevel.Less]: 'text-accent-bun-default',
  [TuneLevel.Blocked]: 'text-accent-ketchup-default',
};
