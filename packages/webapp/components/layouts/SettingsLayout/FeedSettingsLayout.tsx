import React from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

import { FeedSettingsEditContext } from '@dailydotdev/shared/src/components/feeds/FeedSettings/FeedSettingsEditContext';
import { useFeedSettingsEdit } from '@dailydotdev/shared/src/components/feeds/FeedSettings/useFeedSettingsEdit';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { getSettingsLayout } from '.';

export const FeedSettingsLayout = ({ children }: PropsWithChildren) => {
  const { user } = useAuthContext();
  const feedSettingsEditContext = useFeedSettingsEdit({
    feedSlugOrId: user.id,
  });
  return (
    <FeedSettingsEditContext.Provider value={feedSettingsEditContext}>
      {children}
    </FeedSettingsEditContext.Provider>
  );
};

export const getFeedSettingsLayout = (page: ReactNode) => {
  return getSettingsLayout(<FeedSettingsLayout>{page}</FeedSettingsLayout>);
};
