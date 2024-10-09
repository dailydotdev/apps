import React, { ReactElement, useContext } from 'react';
import Feed, { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { USER_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import classNames from 'classnames';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import {
  ProfileLayoutProps,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
  getProfileSeoDefaults,
} from '../../components/layouts/ProfileLayout';
import { getTemplatedTitle } from '../../components/layouts/utils';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileUpvotedPage = ({
  user,
  noindex,
}: ProfileLayoutProps): ReactElement => {
  const { user: loggedUser } = useContext(AuthContext);
  const { shouldUseListFeedLayout } = useFeedLayout();

  const isSameUser = user && loggedUser?.id === user.id;

  const userId = user?.id;
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.UserUpvoted,
    feedQueryKey: ['user_upvoted', userId],
    query: USER_UPVOTED_FEED_QUERY,
    variables: {
      userId,
    },
    disableAds: true,
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

  const seo: NextSeoProps = {
    ...getProfileSeoDefaults(
      user,
      {
        title: getTemplatedTitle(
          `Posts upvoted by ${user.name} (@${user.username})`,
        ),
      },
      noindex,
    ),
  };

  return (
    <>
      <NextSeo {...seo} />
      <Feed
        {...feedProps}
        className={classNames('py-6', !shouldUseListFeedLayout && 'px-4')}
      />
    </>
  );
};

ProfileUpvotedPage.getLayout = getProfileLayout;
export default ProfileUpvotedPage;
