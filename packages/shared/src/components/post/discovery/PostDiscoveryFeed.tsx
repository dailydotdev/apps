import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import type { Post } from '../../../graphql/posts';
import Feed from '../../Feed';
import SettingsContext from '../../../contexts/SettingsContext';
import { FeedLayoutProvider } from '../../../contexts/FeedContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ActiveFeedNameContext } from '../../../contexts';
import { ANONYMOUS_FEED_QUERY, FEED_V2_QUERY } from '../../../graphql/feed';
import type { AllFeedPages } from '../../../lib/query';
import { SharedFeedPage } from '../../utilities';

export const POST_DISCOVERY_FEED_ANCHOR = 'post-discovery-feed';

interface PostDiscoveryFeedProps {
  post: Post;
}

interface SectionHeaderProps {
  title: string;
  description: string;
}

const SectionHeader = ({
  title,
  description,
}: SectionHeaderProps): ReactElement => (
  <header className="mb-4 flex flex-col items-center gap-1 text-center">
    <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
    <p className="text-text-tertiary typo-callout">{description}</p>
  </header>
);

/**
 * Keeps the nested discovery feeds on the grid-card path even though the page
 * route itself is a post page, which normally forces list layout.
 */
const DiscoveryFeedGridScope = ({
  feedName,
  children,
}: {
  feedName: AllFeedPages;
  children: ReactElement;
}): ReactElement => {
  const settings = useContext(SettingsContext);
  const settingsContextValue = useMemo(
    () => ({ ...settings, insaneMode: false }),
    [settings],
  );

  return (
    <ActiveFeedNameContext.Provider value={{ feedName }}>
      <SettingsContext.Provider value={settingsContextValue}>
        <FeedLayoutProvider>{children}</FeedLayoutProvider>
      </SettingsContext.Provider>
    </ActiveFeedNameContext.Provider>
  );
};

/**
 * The Pinterest-style discovery surface below the focus card: the infinite
 * personalized feed, turning the post page into a continuous exploration loop.
 */
export const PostDiscoveryFeed = ({
  post,
}: PostDiscoveryFeedProps): ReactElement => {
  const { user } = useAuthContext();
  const mainQuery = user ? FEED_V2_QUERY : ANONYMOUS_FEED_QUERY;

  return (
    <div
      className="flex w-full flex-col gap-10 px-4 laptop:px-10"
      id={POST_DISCOVERY_FEED_ANCHOR}
    >
      <section aria-label="Discover more">
        <SectionHeader
          title="Discover more"
          description="A fresh stream of developer stories, discussions, and tools."
        />
        <DiscoveryFeedGridScope feedName={SharedFeedPage.Popular}>
          <Feed
            feedName={SharedFeedPage.Popular}
            feedQueryKey={['post-discovery-more', post.id]}
            query={mainQuery}
            variables={{}}
            disableListFrame
          />
        </DiscoveryFeedGridScope>
      </section>
    </div>
  );
};
