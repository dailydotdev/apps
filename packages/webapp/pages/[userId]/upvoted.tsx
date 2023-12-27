import React, { ReactElement } from 'react';
import Feed, { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { USER_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import {
  ProfileLayoutProps,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
} from '../../components/layouts/ProfileLayout/v2';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileUpvotedPage = ({ user }: ProfileLayoutProps): ReactElement => {
  const userId = user?.id;
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.UserUpvoted,
    feedQueryKey: ['user_upvoted', userId],
    query: USER_UPVOTED_FEED_QUERY,
    variables: {
      userId,
    },
    forceCardMode: true,
  };

  return <Feed {...feedProps} className="py-6 px-4" />;
};

ProfileUpvotedPage.getLayout = getProfileLayout;
export default ProfileUpvotedPage;
