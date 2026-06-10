import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useMemo } from 'react';
import Feed from '../Feed';
import SettingsContext from '../../contexts/SettingsContext';
import { FeedLayoutProvider } from '../../contexts/FeedContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { ActiveFeedNameContext } from '../../contexts/ActiveFeedNameContext';
import { ANONYMOUS_FEED_QUERY, FEED_V2_QUERY } from '../../graphql/feed';
import { generateQueryKey, OtherFeedPage } from '../../lib/query';

/**
 * The post page route forces list layout (feedName === OtherFeedPage.Post in
 * useFeedLayout). Overriding the feed name to PostPageFeed (registered in
 * FeedLayoutMobileFeedPages), disabling insaneMode, and supplying the feed
 * sizing provider keeps this nested feed on the grid-card path on laptop while
 * still collapsing to a list on mobile.
 */
const FeedGridScope = ({ children }: { children: ReactNode }): ReactElement => {
  const settings = useContext(SettingsContext);
  const settingsValue = useMemo(
    () => ({ ...settings, insaneMode: false }),
    [settings],
  );

  return (
    <ActiveFeedNameContext.Provider
      value={{ feedName: OtherFeedPage.PostPageFeed }}
    >
      <SettingsContext.Provider value={settingsValue}>
        <FeedLayoutProvider>{children}</FeedLayoutProvider>
      </SettingsContext.Provider>
    </ActiveFeedNameContext.Provider>
  );
};

export const PostPageFeed = (): ReactElement => {
  const { user } = useAuthContext();
  const query = user ? FEED_V2_QUERY : ANONYMOUS_FEED_QUERY;
  const feedQueryKey = generateQueryKey(OtherFeedPage.PostPageFeed, user);

  return (
    <section className="flex w-full flex-col gap-10 border-t border-border-subtlest-tertiary px-4 py-10 laptop:px-10">
      <header className="mx-auto flex flex-col items-center gap-1 text-center">
        <h2 className="font-bold text-text-primary typo-title2">For you</h2>
        <p className="text-text-tertiary typo-callout">
          More from daily.dev, picked for you
        </p>
      </header>
      <FeedGridScope>
        <Feed
          feedName={OtherFeedPage.PostPageFeed}
          feedQueryKey={feedQueryKey}
          query={query}
          variables={{}}
          showSearch={false}
          disableListFrame
        />
      </FeedGridScope>
    </section>
  );
};
