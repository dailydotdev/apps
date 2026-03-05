import type { ReactElement } from 'react';
import React from 'react';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { FeedContainer } from '@dailydotdev/shared/src/components/feeds/FeedContainer';
import { SignalPlaceholderList } from '@dailydotdev/shared/src/components/cards/placeholder/SignalPlaceholderList';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import {
  baseFeedSupportedTypes,
  CHANNEL_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { OtherFeedPage, RequestKey } from '@dailydotdev/shared/src/lib/query';

const AGENTS_DOOM_SKELETON_IDS = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
] as const;

const DoomScrollingSkeleton = (): ReactElement => (
  <>
    {AGENTS_DOOM_SKELETON_IDS.map((id) => (
      <SignalPlaceholderList key={`doom-skeleton-${id}`} />
    ))}
  </>
);

interface AgentsDoomScrollingSectionProps {
  userId?: string;
  tokenRefreshed: boolean;
}

const vibesVariables = {
  channel: 'vibes',
  supportedTypes: baseFeedSupportedTypes,
};

export const AgentsDoomScrollingSection = ({
  userId,
  tokenRefreshed,
}: AgentsDoomScrollingSectionProps): ReactElement => (
  <section className="w-full">
    <div className="mb-4 px-3 pb-0 laptop:px-4">
      <h2 className="font-bold text-text-primary typo-title3">
        Doom scrolling
      </h2>
    </div>
    <ActiveFeedNameContext.Provider
      value={{ feedName: OtherFeedPage.AgentsVibes }}
    >
      {tokenRefreshed ? (
        <Feed
          feedName={OtherFeedPage.AgentsVibes}
          feedQueryKey={[
            RequestKey.Feeds,
            userId ?? 'anonymous',
            'agents_vibes_channel_feed',
            Object.values(vibesVariables),
          ]}
          query={CHANNEL_FEED_QUERY}
          variables={vibesVariables}
          disableListFrame
          disableListWidthConstraint
        />
      ) : (
        <FeedContainer
          showSearch={false}
          disableListFrame
          disableListWidthConstraint
        >
          <DoomScrollingSkeleton />
        </FeedContainer>
      )}
    </ActiveFeedNameContext.Provider>
  </section>
);
