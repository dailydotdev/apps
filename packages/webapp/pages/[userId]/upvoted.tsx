import type { ReactElement } from 'react';
import React from 'react';
import type { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { USER_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import { cloudinaryCharmEmptyProfile } from '@dailydotdev/shared/src/lib/image';
import { useProfilePreview } from '@dailydotdev/shared/src/hooks/profile/useProfilePreview';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import classNames from 'classnames';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import GoBackHeaderMobile from '@dailydotdev/shared/src/components/post/GoBackHeaderMobile';
import { ShellPage } from '@dailydotdev/shared/src/components/shell/ShellPageContext';
import {
  ProfileSegment,
  ProfileSegments,
} from '@dailydotdev/shared/src/components/profile/ProfileSegments';
import { useIsPhone } from '@dailydotdev/shared/src/hooks/useViewSize';
import type { ProfileLayoutProps } from '../../components/layouts/ProfileLayout';
import {
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
} from '../../components/layouts/ProfileLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileUpvotedPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement | null => {
  const { isOwner } = useProfilePreview(user);
  const isPhone = useIsPhone();
  const { shouldUseListFeedLayout } = useFeedLayout();

  if (!user) {
    return null;
  }

  const userId = user.id;
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.UserUpvoted,
    feedQueryKey: ['user_upvoted', userId],
    query: USER_UPVOTED_FEED_QUERY,
    variables: {
      userId,
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
        title={`${user?.name ?? 'User'} hasn't upvoted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        ...getPageSeoTitles(
          `Posts upvoted by ${user.name} (@${user.username})`,
        ),
        noindex: true,
        nofollow: true,
      },
      noindex,
    ),
  };

  return (
    <>
      <NextSeo {...seo} />
      {isPhone ? (
        <ShellPage
          title={user.name}
          row={<ProfileSegments user={user} active={ProfileSegment.Upvoted} />}
        />
      ) : (
        <GoBackHeaderMobile title="Upvoted posts" />
      )}
      <Feed
        {...feedProps}
        className={classNames(
          'pb-6 tablet:pt-6',
          !shouldUseListFeedLayout && 'px-4',
        )}
      />
    </>
  );
};

ProfileUpvotedPage.getLayout = getProfileLayout;
export default ProfileUpvotedPage;
