import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import type { Post } from '../../../graphql/posts';
import Feed from '../../Feed';
import FeedContext from '../../../contexts/FeedContext';
import SettingsContext from '../../../contexts/SettingsContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ActiveFeedNameContext } from '../../../contexts';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_BY_TAGS_QUERY,
  FEED_V2_QUERY,
} from '../../../graphql/feed';
import { OtherFeedPage } from '../../../lib/query';
import { SharedFeedPage } from '../../utilities';
import {
  getPostTopicLabel,
  getPostTopicTags,
} from '../anonymousPostExperience';

export const POST_DISCOVERY_FEED_ANCHOR = 'post-discovery-feed';

interface PostDiscoveryFeedProps {
  post: Post;
}

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

const SectionHeader = ({
  eyebrow,
  title,
  description,
}: SectionHeaderProps): ReactElement => (
  <header className="mb-4 flex flex-col gap-1">
    <p className="text-accent-cabbage-default typo-caption1">{eyebrow}</p>
    <h2 className="font-bold text-text-primary typo-title2">{title}</h2>
    <p className="text-text-tertiary typo-callout">{description}</p>
  </header>
);

/**
 * Wraps a Feed in a FeedContext override so the discovery rail/grid uses a
 * deliberate column count instead of inheriting the user's feed density.
 */
const FeedWithColumns = ({
  columns,
  children,
}: {
  columns: number;
  children: ReactElement;
}): ReactElement => {
  const currentSettings = useContext(FeedContext);
  const settings = useContext(SettingsContext);
  const feedContextValue = useMemo(
    () => ({
      ...currentSettings,
      numCards: { eco: columns, roomy: columns, cozy: columns },
    }),
    [currentSettings, columns],
  );
  const settingsContextValue = useMemo(
    () => ({ ...settings, insaneMode: false }),
    [settings],
  );

  return (
    <ActiveFeedNameContext.Provider value={{ feedName: OtherFeedPage.Tag }}>
      <SettingsContext.Provider value={settingsContextValue}>
        <FeedContext.Provider value={feedContextValue}>
          {children}
        </FeedContext.Provider>
      </SettingsContext.Provider>
    </ActiveFeedNameContext.Provider>
  );
};

/**
 * The Pinterest-style discovery surface below the focus card: a finite,
 * topic-relevant rail ("more like this") followed by the infinite personalized
 * feed, turning the post page into a continuous exploration loop.
 */
export const PostDiscoveryFeed = ({
  post,
}: PostDiscoveryFeedProps): ReactElement => {
  const { user } = useAuthContext();
  const topics = getPostTopicTags(post);
  const topicLabel = getPostTopicLabel(topics);
  const tags = (post.tags ?? []).filter((tag): tag is string => !!tag);
  const hasTags = tags.length > 0;

  const mainQuery = user ? FEED_V2_QUERY : ANONYMOUS_FEED_QUERY;

  return (
    <div
      className="flex w-full flex-col gap-10"
      id={POST_DISCOVERY_FEED_ANCHOR}
    >
      {hasTags && (
        <section aria-label="More on this topic">
          <SectionHeader
            eyebrow="More like this"
            title={`More on ${topicLabel}`}
            description="Hand-picked stories close to what you just read."
          />
          <FeedWithColumns columns={3}>
            <Feed
              feedName={OtherFeedPage.ExploreTag}
              feedQueryKey={['post-discovery-related', post.id]}
              query={FEED_BY_TAGS_QUERY}
              variables={{ tags }}
              disableAds
              allowFetchMore={false}
              pageSize={9}
              disableListFrame
            />
          </FeedWithColumns>
        </section>
      )}

      <section aria-label="Discover more">
        <SectionHeader
          eyebrow="Keep exploring"
          title="Discover more"
          description="A fresh stream of developer stories, discussions, and tools."
        />
        <FeedWithColumns columns={3}>
          <Feed
            feedName={SharedFeedPage.Popular}
            feedQueryKey={['post-discovery-more', post.id]}
            query={mainQuery}
            variables={{}}
            disableListFrame
          />
        </FeedWithColumns>
      </section>
    </div>
  );
};
