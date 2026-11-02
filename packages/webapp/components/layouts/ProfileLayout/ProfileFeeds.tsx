import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { link } from '@dailydotdev/shared/src/lib/links';
import {
  AUTHOR_FEED_QUERY,
  USER_UPVOTED_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import { USER_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import type { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import Feed from '@dailydotdev/shared/src/components/Feed';
import CommentFeed from '@dailydotdev/shared/src/components/CommentFeed';
import {
  generateQueryKey,
  OtherFeedPage,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import {
  cloudinaryCharmEmptyProfile,
  cloudinaryCharmNoPosts,
} from '@dailydotdev/shared/src/lib/image';
import { useProfilePreview } from '@dailydotdev/shared/src/hooks/profile/useProfilePreview';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';

interface ProfileFeedProps {
  user: PublicProfile;
}

const commentClassName = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

export const ProfilePostsFeed = ({ user }: ProfileFeedProps): ReactElement => {
  const { isOwner } = useProfilePreview(user);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.Author,
    feedQueryKey: ['author', user.id],
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId: user.id,
    },
    disableAds: true,
    emptyScreen: isOwner ? (
      <MyProfileEmptyScreen
        image={cloudinaryCharmNoPosts}
        imageAlt="daily.dev charm waiting for your first post"
        title="Nothing posted yet"
        text="Share your first post and it shows up here."
        cta="New post"
        buttonProps={{ tag: 'a', href: link.post.create }}
      />
    ) : (
      <ProfileEmptyScreen
        image={cloudinaryCharmNoPosts}
        imageAlt="daily.dev charm waiting for the first post"
        title={`${user.name ?? 'User'} hasn't posted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  return (
    <Feed
      {...feedProps}
      className={classNames(
        'pb-6 tablet:pt-6',
        !shouldUseListFeedLayout && 'px-4',
      )}
    />
  );
};

export const ProfileRepliesFeed = ({
  user,
}: ProfileFeedProps): ReactElement => {
  const { isOwner } = useProfilePreview(user);
  const emptyScreen = isOwner ? (
    <MyProfileEmptyScreen
      image={cloudinaryCharmEmptyProfile}
      imageAlt="daily.dev charm with an empty profile"
      title="No replies yet"
      text="Join a discussion and your replies show up here."
      cta="Explore posts"
      buttonProps={{ tag: 'a', href: '/' }}
    />
  ) : (
    <ProfileEmptyScreen
      image={cloudinaryCharmEmptyProfile}
      imageAlt="daily.dev charm with an empty profile"
      title={`${user.name ?? 'User'} hasn't replied to any post yet`}
      text="Once they do, those replies will show up here."
    />
  );

  return (
    <CommentFeed
      feedQueryKey={generateQueryKey(
        RequestKey.UserComments,
        undefined,
        user.id,
      )}
      query={USER_COMMENTS_QUERY}
      logOrigin={Origin.Profile}
      variables={{ userId: user.id }}
      emptyScreen={emptyScreen}
      commentClassName={commentClassName}
    />
  );
};

export const ProfileUpvotedFeed = ({
  user,
}: ProfileFeedProps): ReactElement => {
  const { isOwner } = useProfilePreview(user);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.UserUpvoted,
    feedQueryKey: ['user_upvoted', user.id],
    query: USER_UPVOTED_FEED_QUERY,
    variables: {
      userId: user.id,
    },
    disableAds: true,
    emptyScreen: isOwner ? (
      <MyProfileEmptyScreen
        image={cloudinaryCharmEmptyProfile}
        imageAlt="daily.dev charm with an empty profile"
        title="Nothing upvoted yet"
        text="Posts you upvote are kept here."
        cta="Explore posts"
        buttonProps={{ tag: 'a', href: '/' }}
      />
    ) : (
      <ProfileEmptyScreen
        image={cloudinaryCharmEmptyProfile}
        imageAlt="daily.dev charm with an empty profile"
        title={`${user.name ?? 'User'} hasn't upvoted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  return (
    <Feed
      {...feedProps}
      className={classNames(
        'pb-6 tablet:pt-6',
        !shouldUseListFeedLayout && 'px-4',
      )}
    />
  );
};
