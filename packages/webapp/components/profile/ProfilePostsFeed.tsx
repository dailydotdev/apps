import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { link } from '@dailydotdev/shared/src/lib/links';
import { AUTHOR_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import type { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import { cloudinaryCharmNoPosts } from '@dailydotdev/shared/src/lib/image';
import { useProfilePreview } from '@dailydotdev/shared/src/hooks/profile/useProfilePreview';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';

interface ProfilePostsFeedProps {
  user: PublicProfile;
  className?: string;
}

// The posts a profile has authored, shared by the profile's Posts segment and
// the full /<username>/posts page.
export function ProfilePostsFeed({
  user,
  className,
}: ProfilePostsFeedProps): ReactElement {
  const { isOwner } = useProfilePreview(user);
  const { shouldUseListFeedLayout } = useFeedLayout();
  const userId = user.id;

  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.Author,
    feedQueryKey: ['author', userId],
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId,
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
        title={`${user?.name ?? 'User'} hasn't posted yet`}
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
        className,
      )}
    />
  );
}
