import React, { ReactElement } from 'react';
import { AUTHOR_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import Feed, { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import {
  getLayout as getProfileLayout,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  ProfileLayoutProps,
} from '../../components/layouts/ProfileLayout/v2';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfilePostsPage = ({ user }: ProfileLayoutProps): ReactElement => {
  const userId = user?.id;
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.Author,
    feedQueryKey: ['author', userId],
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId,
    },
    forceCardMode: true,
  };

  return <Feed {...feedProps} className="py-6 px-4" />;
};

ProfilePostsPage.getLayout = getProfileLayout;
export default ProfilePostsPage;
