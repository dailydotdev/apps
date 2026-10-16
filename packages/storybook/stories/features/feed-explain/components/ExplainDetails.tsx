import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '@dailydotdev/shared/src/hooks/useFeedSettings';
import type { FeedSettings } from '@dailydotdev/shared/src/graphql/feedSettings';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { getPostByIdKey } from '@dailydotdev/shared/src/lib/query';
import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities/common';
import WhyRecommendedModal from '../../why-recommended/components/WhyRecommendedModal';
import type {
  RecommendationExplanation,
  RecommendationMatch,
} from '../../why-recommended/components/whyRecommended';
import {
  RecommendationMatchKind,
  RecommendationMatchOrigin,
  RecommendationMatchRole,
} from '../../why-recommended/components/whyRecommended';
import type { ExplainedPost, ViewerProfile } from './feedExplain';
import {
  FeedReason,
  getSignalKey,
  SignalKind,
  SignalOrigin,
  TuneLevel,
} from './feedExplain';
import { useFeedTuning } from './FeedTuningContext';
import { FeedScreenContext } from './ExplainPanel';

const matchOrigin: Partial<Record<SignalOrigin, RecommendationMatchOrigin>> =
  {
    [SignalOrigin.Picked]: RecommendationMatchOrigin.Selected,
    [SignalOrigin.Following]: RecommendationMatchOrigin.Following,
    [SignalOrigin.Reading]: RecommendationMatchOrigin.Reading,
  };

const matchPoints: Partial<Record<SignalOrigin, number>> = {
  [SignalOrigin.Following]: 120,
  [SignalOrigin.Picked]: 100,
  [SignalOrigin.Reading]: 70,
};

const topicWeight: Partial<Record<SignalOrigin, number>> = {
  [SignalOrigin.Picked]: 0.9,
  [SignalOrigin.Reading]: 0.55,
};

const levelMultiplier: Partial<Record<TuneLevel, number>> = {
  [TuneLevel.More]: 1.25,
  [TuneLevel.Less]: 0.6,
};

/** Ages are measured from the day the history posts were captured. */
const capturedAt = Date.parse('2026-10-15');

const round = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * The ranking explanation the feed service would return for this post, so
 * the full view shows the same matches and the tuning applied in the feed.
 */
const buildExplanation = (
  item: ExplainedPost,
  levels: Record<string, TuneLevel>,
  boost: number,
): RecommendationExplanation | undefined => {
  const matched = item.signals.filter(
    ({ origin }) => origin !== SignalOrigin.Post,
  );
  if (!matched.length) {
    return undefined;
  }

  const matches = matched.map(
    (signal, index): RecommendationMatch => ({
      id: signal.id,
      label: signal.label,
      kind:
        signal.kind === SignalKind.Topic
          ? RecommendationMatchKind.Topic
          : RecommendationMatchKind.Source,
      origin: matchOrigin[signal.origin] ?? RecommendationMatchOrigin.Reading,
      ...(signal.kind === SignalKind.Topic && {
        role:
          signal.key === item.reasonSignal?.key
            ? RecommendationMatchRole.Main
            : RecommendationMatchRole.Supporting,
      }),
      points: Math.round(
        (matchPoints[signal.origin] ?? 0) *
          (index ? 0.7 : 1) *
          (levelMultiplier[levels[signal.key]] ?? 1),
      ),
    }),
  );
  const { post } = item;
  const daysOld = Math.max(
    0,
    (capturedAt - Date.parse(post.createdAt ?? '')) / 86_400_000,
  );
  const factors = [
    {
      label: 'interest match',
      value: round(
        matched.reduce(
          (sum, { origin, key }) =>
            sum +
            (topicWeight[origin] ?? 0) * (levelMultiplier[levels[key]] ?? 1),
          0,
        ),
      ),
    },
    {
      label: 'followed source',
      value: item.reason === FeedReason.Following ? 1.2 : 0,
    },
    {
      label: 'community signal',
      value: round(Math.log10((post.numUpvotes ?? 0) + 1) * 0.12),
    },
    { label: 'your tuning', value: round(boost * 0.5) },
    { label: 'age', value: -round(Math.min(0.4, (daysOld || 0) * 0.012)) },
  ];

  return {
    matches,
    factors,
    finalScore: round(factors.reduce((sum, { value }) => sum + value, 0)),
  };
};

const toFeedSettings = (
  item: ExplainedPost,
  viewer: ViewerProfile,
  levels: Record<string, TuneLevel>,
): FeedSettings => {
  const topicsAt = (level: TuneLevel) =>
    Object.keys(levels)
      .filter((key) => levels[key] === level && key.startsWith('topic:'))
      .map((key) => key.slice('topic:'.length));
  const blockedTags = topicsAt(TuneLevel.Blocked);
  const { source } = item.post;
  const sourceLevel = source?.id
    ? levels[getSignalKey(SignalKind.Source, source.id)]
    : undefined;
  const isFollowingSource =
    !!source?.id &&
    (viewer.followedSources.includes(source.id) ||
      sourceLevel === TuneLevel.More);

  return {
    includeTags: [
      ...new Set([...viewer.pickedTags, ...topicsAt(TuneLevel.More)]),
    ].filter((tag) => !blockedTags.includes(tag)),
    blockedTags,
    includeSources: isFollowingSource && source ? [source as Source] : [],
    excludeSources:
      sourceLevel === TuneLevel.Blocked && source ? [source as Source] : [],
    advancedSettings: [],
  };
};

const diff = (before: string[] = [], after: string[] = []) => ({
  added: after.filter((value) => !before.includes(value)),
  removed: before.filter((value) => !after.includes(value)),
});

const sourceIds = (sources?: Array<Pick<Source, 'id'>>) =>
  (sources ?? []).map(({ id }) => id);

interface ExplainDetailsModalProps {
  item: ExplainedPost;
  viewer: ViewerProfile;
  onClose: () => void;
}

/**
 * The production "Why am I seeing this?" modal over the tuned feed. Follow
 * and block in the modal write the feed settings cache; they flow back into
 * the tuning state, so the cards behind it update too.
 */
const ExplainDetailsModal = ({
  item,
  viewer,
  onClose,
}: ExplainDetailsModalProps): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const tuning = useFeedTuning();
  const [explanation] = useState(() =>
    buildExplanation(item, tuning.levels, tuning.getBoost(item)),
  );
  const [isSeeded, setIsSeeded] = useState(false);
  const seenRef = useRef<FeedSettings>();
  const { feedSettings } = useFeedSettings({ enabled: isSeeded });

  useEffect(() => {
    if (!user || isSeeded) {
      return;
    }
    const settings = toFeedSettings(item, viewer, tuning.levels);
    seenRef.current = settings;
    client.setQueryData(getFeedSettingsQueryKey(user), {
      tagsCategories: [],
      feedSettings: settings,
      advancedSettings: [],
    });
    client.setQueryData(getPostByIdKey(item.post.id), {
      post:
        item.reason === FeedReason.Popular
          ? { ...item.post, trending: item.post.trending || 1 }
          : item.post,
    });
    setIsSeeded(true);
  }, [client, user, item, viewer, tuning.levels, isSeeded]);

  useEffect(() => {
    const seen = seenRef.current;
    if (!isSeeded || !feedSettings || !seen || feedSettings === seen) {
      return;
    }
    seenRef.current = feedSettings;

    const next = new Map<string, TuneLevel | undefined>();
    const unfollow = (key: string) =>
      next.set(
        key,
        tuning.levels[key] === TuneLevel.More ? undefined : TuneLevel.Less,
      );
    const tags = diff(seen.includeTags, feedSettings.includeTags);
    tags.added.forEach((tag) =>
      next.set(getSignalKey(SignalKind.Topic, tag), TuneLevel.More),
    );
    tags.removed.forEach((tag) =>
      unfollow(getSignalKey(SignalKind.Topic, tag)),
    );
    const sources = diff(
      sourceIds(seen.includeSources),
      sourceIds(feedSettings.includeSources),
    );
    sources.added.forEach((id) =>
      next.set(getSignalKey(SignalKind.Source, id), TuneLevel.More),
    );
    sources.removed.forEach((id) =>
      unfollow(getSignalKey(SignalKind.Source, id)),
    );
    // Blocks win over the follow changes the same action makes.
    const blocked = diff(seen.blockedTags, feedSettings.blockedTags);
    blocked.added.forEach((tag) =>
      next.set(getSignalKey(SignalKind.Topic, tag), TuneLevel.Blocked),
    );
    blocked.removed.forEach((tag) =>
      next.set(getSignalKey(SignalKind.Topic, tag), undefined),
    );
    const excluded = diff(
      sourceIds(seen.excludeSources),
      sourceIds(feedSettings.excludeSources),
    );
    excluded.added.forEach((id) =>
      next.set(getSignalKey(SignalKind.Source, id), TuneLevel.Blocked),
    );
    excluded.removed.forEach((id) =>
      next.set(getSignalKey(SignalKind.Source, id), undefined),
    );

    next.forEach((level, key) => {
      const signal = item.signals.find((candidate) => candidate.key === key);
      if (signal) {
        tuning.setLevel(signal, level);
      }
    });
  }, [feedSettings, isSeeded, item, tuning]);

  if (!isSeeded) {
    return null;
  }

  return (
    <WhyRecommendedModal
      isOpen
      post={item.post}
      feedName={SharedFeedPage.MyFeed}
      explanation={explanation}
      onShowFewer={() => tuning.setDismissed(item.post.id, true)}
      onRequestClose={onClose}
    />
  );
};

interface ExplainDetailsHostProps {
  counts: Record<string, number>;
  viewer: ViewerProfile;
  initialItem?: ExplainedPost;
}

/** Gives cards their on-screen counts and the way into the full view. */
export const ExplainDetailsHost = ({
  counts,
  viewer,
  initialItem,
  children,
}: PropsWithChildren<ExplainDetailsHostProps>): ReactElement => {
  const [item, setItem] = useState<ExplainedPost | null>(initialItem ?? null);
  const value = useMemo(() => ({ counts, onOpenDetails: setItem }), [counts]);

  return (
    <FeedScreenContext.Provider value={value}>
      {children}
      {item && (
        <ExplainDetailsModal
          key={item.post.id}
          item={item}
          viewer={viewer}
          onClose={() => setItem(null)}
        />
      )}
    </FeedScreenContext.Provider>
  );
};
