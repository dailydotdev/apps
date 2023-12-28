import React, { ReactElement, useContext } from 'react';
import { link } from '@dailydotdev/shared/src/lib/links';
import { AUTHOR_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import Feed, { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
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
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = loggedUser?.id === user.id;

  const userId = user?.id;
  const feedProps: FeedProps<unknown> = {
    feedName: OtherFeedPage.Author,
    feedQueryKey: ['author', userId],
    query: AUTHOR_FEED_QUERY,
    variables: {
      userId,
    },
    forceCardMode: true,
    emptyScreen: isSameUser ? (
      <MyProfileEmptyScreen
        className="items-center py-6 px-4 text-center"
        text="Hardest part of being a developer? Where do we start – it’s everything. Go on, share with us your best rant."
        cta="New post"
        buttonProps={{ tag: 'a', href: link.post.create }}
      />
    ) : (
      <ProfileEmptyScreen
        title={`${user.name} hasn't posted yet`}
        text="Once they do, those posts will show up here."
      />
    ),
  };

  return <Feed {...feedProps} className="py-6 px-4" />;
};

ProfilePostsPage.getLayout = getProfileLayout;
export default ProfilePostsPage;
