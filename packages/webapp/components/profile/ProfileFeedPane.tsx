import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import Feed from '@dailydotdev/shared/src/components/Feed';
import CommentFeed from '@dailydotdev/shared/src/components/CommentFeed';
import {
  AUTHOR_FEED_QUERY,
  USER_UPVOTED_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { USER_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import {
  generateQueryKey,
  OtherFeedPage,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { link } from '@dailydotdev/shared/src/lib/links';
import {
  cloudinaryCharmEmptyProfile,
  cloudinaryCharmNoPosts,
} from '@dailydotdev/shared/src/lib/image';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import { ProfileSegment } from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import { useProfilePreview } from '@dailydotdev/shared/src/hooks/profile/useProfilePreview';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';

const commentClassName = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

// The lists behind Posts, Replies and Upvoted: each sub-page renders its
// own, and on a phone the profile pages between them, so a neighbour's
// list can stand beside the lit one while the finger moves.
export const ProfileFeedPane = ({
  user,
  segment,
}: {
  user: PublicProfile;
  segment: ProfileSegment;
}): ReactElement | null => {
  const { isOwner } = useProfilePreview(user);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const userId = user.id;
  const feedClassName = classNames('py-6', !shouldUseListFeedLayout && 'px-4');

  if (segment === ProfileSegment.Replies) {
    return (
      <CommentFeed
        feedQueryKey={generateQueryKey(
          RequestKey.UserComments,
          undefined,
          userId,
        )}
        query={USER_COMMENTS_QUERY}
        logOrigin={Origin.Profile}
        variables={{ userId }}
        emptyScreen={
          isOwner ? (
            <MyProfileEmptyScreen
              className="items-center px-4 py-6 text-center tablet:px-6"
              image={cloudinaryCharmEmptyProfile}
              imageAlt="daily.dev charm with an empty profile"
              text="All tests have passed on the first try and you have no idea why? Time for a break. Browse the feed and join a discussion!"
              cta="Explore posts"
              buttonProps={{ tag: 'a', href: '/' }}
            />
          ) : (
            <ProfileEmptyScreen
              image={cloudinaryCharmEmptyProfile}
              imageAlt="daily.dev charm with an empty profile"
              title={`${user?.name ?? 'User'} hasn't replied to any post yet`}
              text="Once they do, those replies will show up here."
            />
          )
        }
        commentClassName={commentClassName}
      />
    );
  }

  if (segment === ProfileSegment.Upvoted) {
    const feedProps: FeedProps<unknown> = {
      feedName: OtherFeedPage.UserUpvoted,
      feedQueryKey: ['user_upvoted', userId],
      query: USER_UPVOTED_FEED_QUERY,
      variables: { userId },
      disableAds: true,
      emptyScreen: isOwner ? (
        <MyProfileEmptyScreen
          className="items-center px-4 py-6 text-center tablet:px-6"
          image={cloudinaryCharmEmptyProfile}
          imageAlt="daily.dev charm with an empty profile"
          text="Trapped in endless meetings? Make the most of It - Find posts you love and upvote away!"
          cta="Explore posts"
          buttonProps={{ tag: 'a', href: '/' }}
        />
      ) : (
        <ProfileEmptyScreen
          image={cloudinaryCharmEmptyProfile}
          imageAlt="daily.dev charm with an empty profile"
          title={`${user?.name ?? 'User'} hasn't upvoted yet`}
          text="Once they do, those posts will show up here."
        />
      ),
    };
    return <Feed {...feedProps} className={feedClassName} />;
  }

  if (segment === ProfileSegment.Posts) {
    const feedProps: FeedProps<unknown> = {
      feedName: OtherFeedPage.Author,
      feedQueryKey: ['author', userId],
      query: AUTHOR_FEED_QUERY,
      variables: { userId },
      disableAds: true,
      emptyScreen: isOwner ? (
        <MyProfileEmptyScreen
          className="items-center px-4 py-6 text-center tablet:px-6"
          image={cloudinaryCharmNoPosts}
          imageAlt="daily.dev charm waiting for your first post"
          text="Hardest part of being a developer? Where do we start – it’s everything. Go on, share with us your best rant."
          cta="New post"
          buttonProps={{ tag: 'a', href: link.post.create }}
        />
      ) : (
        <ProfileEmptyScreen
          image={cloudinaryCharmNoPosts}
          imageAlt="daily.dev charm waiting for the first post"
          title={`${user?.name ?? 'User'} hasn't posted yet`}
          text="Once they do, those posts will show up here."
        />
      ),
    };
    return <Feed {...feedProps} className={feedClassName} />;
  }

  return null;
};
