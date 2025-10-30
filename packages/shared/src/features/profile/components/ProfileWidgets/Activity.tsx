import type { ReactElement } from 'react';
import React, { useContext, useState, useMemo } from 'react';
import classNames from 'classnames';
import type { PublicProfile } from '../../../../lib/user';
import {
  Button,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import type { FeedProps } from '../../../../components/Feed';
import Feed from '../../../../components/Feed';
import { AUTHOR_FEED_QUERY, USER_UPVOTED_FEED_QUERY } from '../../../../graphql/feed';
import { OtherFeedPage } from '../../../../lib/query';
import { MyProfileEmptyScreen } from '../../../../components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '../../../../components/profile/ProfileEmptyScreen';
import AuthContext from '../../../../contexts/AuthContext';
import CommentFeed from '../../../../components/CommentFeed';
import { USER_COMMENTS_QUERY } from '../../../../graphql/comments';
import { Origin } from '../../../../lib/log';
import { generateQueryKey, RequestKey } from '../../../../lib/query';
import { link } from '../../../../lib/links';
import { useHorizontalScrollHeader } from '../../../../components/HorizontalScroll/useHorizontalScrollHeader';
import { TypographyType, Typography } from '../../../../components/typography/Typography';
import { ArrowIcon } from '../../../../components/icons';
import Link from '../../../../components/utilities/Link';
import FeedContext from '../../../../contexts/FeedContext';

export type ActivityTab = { id: string; title: string; path: string };

export const activityTabs: ActivityTab[] = [
  {
    id: 'posts',
    title: 'Posts',
    path: '/posts',
  },
  {
    id: 'replies',
    title: 'Replies',
    path: '/replies',
  },
  {
    id: 'upvoted',
    title: 'Upvoted',
    path: '/upvoted',
  },
];

interface ActivityProps {
  user: PublicProfile;
}

const commentClassName = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

const CARD_WIDTH = 272;
const CARD_GAP = 16;

export const Activity = ({ user }: ActivityProps): ReactElement => {
  const [selectedTab, setSelectedTab] = useState(0);
  const { user: loggedUser } = useContext(AuthContext);
  const currentFeedSettings = useContext(FeedContext);
  const isSameUser = user && loggedUser?.id === user.id;
  const userId = user?.id;

  const getUserPath = (path: string) => {
    const username = user?.username || user?.id;
    return `/${username}${path}`;
  };

  // Calculate numCards based on container width
  // Assuming parent has p-6 (24px padding) and we need to fit 272px cards with 16px gaps
  const feedContextValue = useMemo(() => {
    // Calculate based on typical mobile/tablet widths
    // For a container with ~600px available width: (600 + 16) / (272 + 16) ≈ 2.14 cards
    // We'll show 2 cards to ensure good scrolling UX
    const calculatedNumCards = 3;
    
    return {
      ...currentFeedSettings,
      numCards: {
        eco: calculatedNumCards,
        roomy: calculatedNumCards,
        cozy: calculatedNumCards,
      },
    };
  }, [currentFeedSettings]);

  const postsFeedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.Author,
    feedQueryKey: ['author', userId],
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId,
    },
    disableAds: true,
    allowFetchMore: false,
    pageSize: 10,
    isHorizontal: true,
    emptyScreen: isSameUser ? (
      <MyProfileEmptyScreen
        className="items-center px-4 py-6 text-center tablet:px-6"
        text="Hardest part of being a developer? Where do we start – it's everything. Go on, share with us your best rant."
        cta="New post"
        buttonProps={{ tag: 'a', href: link.post.create }}
      />
    ) : (
      <ProfileEmptyScreen
        title={`${user?.name ?? 'User'} hasn't posted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  const upvotedFeedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.UserUpvoted,
    feedQueryKey: ['user_upvoted', userId],
    query: USER_UPVOTED_FEED_QUERY,
    variables: {
      userId,
    },
    disableAds: true,
    allowFetchMore: false,
    pageSize: 10,
    isHorizontal: true,
    emptyScreen: isSameUser ? (
      <MyProfileEmptyScreen
        className="items-center px-4 py-6 text-center tablet:px-6"
        text="Trapped in endless meetings? Make the most of It - Find posts you love and upvote away!"
        cta="Explore posts"
        buttonProps={{ tag: 'a', href: '/' }}
      />
    ) : (
      <ProfileEmptyScreen
        title={`${user?.name ?? 'User'} hasn't upvoted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  const commentsEmptyScreen = isSameUser ? (
    <MyProfileEmptyScreen
      className="items-center px-4 py-6 text-center tablet:px-6"
      text="All tests have passed on the first try and you have no idea why? Time for a break. Browse the feed and join a discussion!"
      cta="Explore posts"
      buttonProps={{ tag: 'a', href: '/' }}
    />
  ) : (
    <ProfileEmptyScreen
      title={`${user?.name ?? 'User'} hasn't replied to any post yet`}
      text="Once they do, those replies will show up here."
    />
  );

  const { ref, isAtStart, isAtEnd, onClickNext, onClickPrevious, isOverflowing } =
    useHorizontalScrollHeader({
      title: { copy: 'Activity', type: TypographyType.Body },
    });

  const renderContent = () => {
    switch (selectedTab) {
      case 0: // Posts
        return (
          <FeedContext.Provider value={feedContextValue}>
            <div className="-mx-6 [&_.grid]:!auto-cols-[272px] [&_.grid]:gap-4 [&_.grid]:px-6">
              <Feed
                {...postsFeedProps}
                className="mb-4"
                feedContainerRef={ref}
              />
            </div>
          </FeedContext.Provider>
        );
      case 1: // Replies
        return (
          <CommentFeed
            feedQueryKey={generateQueryKey(RequestKey.UserComments, null, userId)}
            query={USER_COMMENTS_QUERY}
            logOrigin={Origin.Profile}
            variables={{ userId }}
            emptyScreen={commentsEmptyScreen}
            commentClassName={commentClassName}
          />
        );
      case 2: // Upvoted
        return (
          <FeedContext.Provider value={feedContextValue}>
            <div className="-mx-6 [&_.grid]:!auto-cols-[272px] [&_.grid]:gap-4 [&_.grid]:px-6">
              <Feed
                {...upvotedFeedProps}
                className="mb-4"
                feedContainerRef={ref}
              />
            </div>
          </FeedContext.Provider>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-3 overflow-hidden pt-6">
      <div className="flex flex-col gap-3">
        <Typography type={TypographyType.Body} bold>
          Activity
        </Typography>
        <div className="flex items-center justify-between pb-3">
          <div className="flex gap-3">
            {activityTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(index)}
                className={classNames(
                  'typo-body rounded-6 px-2 py-1.5 font-bold transition-colors',
                  selectedTab === index
                    ? 'bg-theme-active text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
          {isOverflowing && selectedTab !== 1 && (
            <div className="flex gap-3">
              <Button
                variant={ButtonVariant.Tertiary}
                icon={<ArrowIcon className="-rotate-90" />}
                disabled={isAtStart}
                onClick={onClickPrevious}
                aria-label="Scroll left"
              />
              <Button
                variant={ButtonVariant.Tertiary}
                icon={<ArrowIcon className="rotate-90" />}
                disabled={isAtEnd}
                onClick={onClickNext}
                aria-label="Scroll right"
              />
            </div>
          )}
        </div>
      </div>
      {renderContent()}
      {selectedTab !== 1 && (
        <Link href={getUserPath(activityTabs[selectedTab].path)} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Tertiary}
            className="w-full"
          >
            Show More
          </Button>
        </Link>
      )}
    </div>
  );
};

