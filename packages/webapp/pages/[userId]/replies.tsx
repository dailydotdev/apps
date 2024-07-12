import React, { ReactElement, useContext } from 'react';
import { USER_COMMENTS_QUERY } from '@dailydotdev/shared/src/graphql/comments';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import {
  generateQueryKey,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { MyProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/MyProfileEmptyScreen';
import { ProfileEmptyScreen } from '@dailydotdev/shared/src/components/profile/ProfileEmptyScreen';
import CommentFeed from '@dailydotdev/shared/src/components/CommentFeed';
import {
  ProfileLayoutProps,
  getStaticPaths as getProfileStaticPaths,
  getStaticProps as getProfileStaticProps,
  getLayout as getProfileLayout,
} from '../../components/layouts/ProfileLayout';

export const getStaticProps = getProfileStaticProps;
export const getStaticPaths = getProfileStaticPaths;

const commentClassName = {
  container: 'rounded-none border-0 border-b',
  commentBox: {
    container: 'relative border-0 rounded-none',
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProfileCommentsPage = ({ user }: ProfileLayoutProps): ReactElement => {
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = user && loggedUser?.id === user.id;
  const userId = user?.id;

  const emptyScreen = isSameUser ? (
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

  return (
    <CommentFeed
      feedQueryKey={generateQueryKey(RequestKey.UserComments, null, userId)}
      query={USER_COMMENTS_QUERY}
      logOrigin={Origin.Profile}
      variables={{ userId }}
      emptyScreen={emptyScreen}
      commentClassName={commentClassName}
    />
  );
};

ProfileCommentsPage.getLayout = getProfileLayout;
export default ProfileCommentsPage;
