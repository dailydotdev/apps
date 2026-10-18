import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import type { Decision, PersonalizationState } from '../policy/rank';
import { FollowKind, Lane, TopicRole } from '../policy/rank';
import type { Interest } from '../policy/profile';
import { InterestOrigin } from '../policy/profile';
import { usePersonalization } from './PersonalizationContext';

const round = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * The served decision as the explanation the feed service would return. The
 * breakdown shows each multiplier on a log scale, so they add up to the log
 * of the card's pick score.
 */
const buildExplanation = (
  decision: Decision,
  interests: Interest[],
): RecommendationExplanation | undefined => {
  if (decision.lane === Lane.Popular) {
    return undefined;
  }
  const matches: RecommendationMatch[] = [
    ...(decision.followedBy === FollowKind.Source && decision.post.source?.id
      ? [
          {
            id: decision.post.source.id,
            label: decision.post.source.name ?? decision.post.source.id,
            kind: RecommendationMatchKind.Source,
            origin: RecommendationMatchOrigin.Following,
            points: Math.round((decision.factors.follow - 1) * 100),
          },
        ]
      : []),
    ...decision.matches.map((match): RecommendationMatch => {
      const interest = interests.find(({ tag }) => tag === match.tag);
      return {
        id: match.tag,
        label: match.tag,
        kind: RecommendationMatchKind.Topic,
        origin:
          match.origin === InterestOrigin.Declared
            ? RecommendationMatchOrigin.Selected
            : RecommendationMatchOrigin.Reading,
        role:
          match.role === TopicRole.Main
            ? RecommendationMatchRole.Main
            : RecommendationMatchRole.Supporting,
        points: Math.round(
          (interest ? match.contribution : match.contribution) * 100,
        ),
      };
    }),
  ];
  if (!matches.length) {
    return undefined;
  }
  const { factors, slot } = decision;
  const log = (value: number) => round(Math.log(value));
  const breakdown = [
    { label: 'reader response', value: log(factors.base) },
    { label: 'topic match', value: log(factors.match) },
    { label: 'follow', value: log(factors.follow) },
    { label: 'freshness', value: log(factors.age) },
    { label: 'seen before', value: log(factors.seen) },
    ...(slot
      ? [
          { label: 'interest rotation', value: log(slot.waiting) },
          { label: 'source variety', value: log(slot.sourceRepeat) },
          { label: 'topic variety', value: log(slot.topicRepeat) },
          { label: 'same story', value: log(slot.sameHeadline) },
        ]
      : []),
  ];

  return {
    matches,
    factors: breakdown,
    finalScore: round(breakdown.reduce((sum, { value }) => sum + value, 0)),
  };
};

const toFeedSettings = (
  decision: Decision,
  state: PersonalizationState,
): FeedSettings => {
  const source = decision.post.source as Source | undefined;
  return {
    includeTags: state.followedTags,
    blockedTags: state.blockedTags,
    includeSources:
      source && state.followedSources.includes(source.id) ? [source] : [],
    excludeSources:
      source && state.blockedSources.includes(source.id) ? [source] : [],
    advancedSettings: [],
  };
};

const diff = (before: string[] = [], after: string[] = []) => ({
  added: after.filter((value) => !before.includes(value)),
  removed: before.filter((value) => !after.includes(value)),
});

const ids = (sources?: Array<Pick<Source, 'id'>>) =>
  (sources ?? []).map(({ id }) => id);

/**
 * The production "Why am I seeing this?" modal, fed the served decision.
 * Follow and block in it write the feed settings cache, and those writes go
 * back into the personalization state so the feed behind it updates.
 */
export const ExplainDetailsModal = ({
  decision,
  onClose,
}: {
  decision: Decision;
  onClose: () => void;
}): ReactElement | null => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const store = usePersonalization();
  const [explanation] = useState(() =>
    buildExplanation(decision, store.next.interests),
  );
  const [isSeeded, setIsSeeded] = useState(false);
  const seenRef = useRef<FeedSettings>();
  const { feedSettings } = useFeedSettings({ enabled: isSeeded });
  const source = {
    id: decision.post.source?.id ?? '',
    name: decision.post.source?.name ?? 'this source',
  };

  useEffect(() => {
    if (!user || isSeeded) {
      return;
    }
    const settings = toFeedSettings(decision, store.state);
    seenRef.current = settings;
    client.setQueryData(getFeedSettingsQueryKey(user), {
      tagsCategories: [],
      feedSettings: settings,
      advancedSettings: [],
    });
    client.setQueryData(getPostByIdKey(decision.post.id), {
      post:
        decision.lane === Lane.Popular
          ? { ...decision.post, trending: decision.post.trending || 1 }
          : decision.post,
    });
    setIsSeeded(true);
  }, [client, user, decision, store.state, isSeeded]);

  useEffect(() => {
    const seen = seenRef.current;
    if (!isSeeded || !feedSettings || !seen || feedSettings === seen) {
      return;
    }
    seenRef.current = feedSettings;
    const blocked = diff(seen.blockedTags, feedSettings.blockedTags);
    const followed = diff(seen.includeTags, feedSettings.includeTags);
    // Blocking a followed tag also unfollows it; the block says it all.
    blocked.added.forEach((tag) => store.setTagBlocked(tag, true));
    blocked.removed.forEach((tag) => store.setTagBlocked(tag, false));
    followed.added.forEach((tag) => store.setTagFollowed(tag, true));
    followed.removed
      .filter((tag) => !blocked.added.includes(tag))
      .forEach((tag) => store.setTagFollowed(tag, false));
    const excluded = diff(
      ids(seen.excludeSources),
      ids(feedSettings.excludeSources),
    );
    const included = diff(
      ids(seen.includeSources),
      ids(feedSettings.includeSources),
    );
    if (excluded.added.length) {
      store.setSourceBlocked(source, true);
    } else if (excluded.removed.length) {
      store.setSourceBlocked(source, false);
    }
    if (included.added.length) {
      store.setSourceFollowed(source, true);
    } else if (included.removed.length && !excluded.added.length) {
      store.setSourceFollowed(source, false);
    }
  }, [feedSettings, isSeeded, source, store]);

  if (!isSeeded) {
    return null;
  }

  return (
    <WhyRecommendedModal
      isOpen
      post={decision.post}
      feedName={SharedFeedPage.MyFeed}
      explanation={explanation}
      onShowFewer={() => store.setHidden(decision.post.id, true)}
      onRequestClose={onClose}
    />
  );
};
