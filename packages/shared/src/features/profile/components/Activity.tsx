import type { ReactElement } from 'react';
import React, { useContext, useState, useMemo, useCallback } from 'react';
import type { PublicProfile } from '../../../lib/user';
import AuthContext from '../../../contexts/AuthContext';
import { ActivityTabIndex, activityTabs } from './Activity.helpers';
import { ActivityPostsTab } from './ActivityPostsTab';
import { ActivityUpvotedTab } from './ActivityUpvotedTab';
import { ActivityRepliesTab } from './ActivityRepliesTab';

type ActivityProps = {
  user: PublicProfile;
};

export const Activity = ({ user }: ActivityProps): ReactElement | null => {
  const [selectedTab, setSelectedTab] = useState<string>(activityTabs[0].title);
  const { user: loggedUser } = useContext(AuthContext);
  const isSameUser = user && loggedUser?.id === user.id;
  const userId = user?.id;

  const selectedTabIndex = useMemo(
    () => activityTabs.findIndex((tab) => tab.title === selectedTab),
    [selectedTab],
  );

  const handleTabClick = useCallback((label: string) => {
    setSelectedTab(label);
  }, []);

  const renderContent = () => {
    switch (selectedTabIndex) {
      case ActivityTabIndex.Posts:
        return (
          <ActivityPostsTab
            userId={userId}
            isSameUser={isSameUser}
            userName={user?.name ?? 'User'}
            user={user}
            selectedTab={selectedTab}
            onTabClick={handleTabClick}
          />
        );
      case ActivityTabIndex.Replies:
        return (
          <ActivityRepliesTab
            userId={userId}
            isSameUser={isSameUser}
            userName={user?.name ?? 'User'}
            user={user}
            selectedTab={selectedTab}
            onTabClick={handleTabClick}
          />
        );
      case ActivityTabIndex.Upvoted:
        return (
          <ActivityUpvotedTab
            userId={userId}
            isSameUser={isSameUser}
            userName={user?.name ?? 'User'}
            user={user}
            selectedTab={selectedTab}
            onTabClick={handleTabClick}
          />
        );
      default:
        return null;
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-3 overflow-hidden pt-6">
      {renderContent()}
    </div>
  );
};
