import Feed, { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import { FeedPageHeader } from '@dailydotdev/shared/src/components/utilities';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  FEED_BY_IDS_QUERY,
  supportedTypesForPrivateSources,
} from '@dailydotdev/shared/src/graphql/feed';
import { useFeedLayout } from '@dailydotdev/shared/src/hooks';
import {
  generateQueryKey,
  OtherFeedPage,
  RequestKey,
} from '@dailydotdev/shared/src/lib/query';
import { useRouter } from 'next/router';
import React, { ReactElement, ReactNode, useMemo, useState } from 'react';

export type FeedByIdsLayoutProps = {
  children?: ReactNode;
};

export default function FeedByIdsLayout({
  children,
}: FeedByIdsLayoutProps): ReactElement {
  const router = useRouter();
  const { FeedPageLayoutComponent } = useFeedLayout();
  const { user, tokenRefreshed } = useAuthContext();
  const [showEmptyScreen, setShowEmptyScreen] = useState(false);
  const defaultKey = generateQueryKey(RequestKey.FeedByIds, user);
  const ids = router.query?.id;
  const feedProps = useMemo<FeedProps<unknown>>(() => {
    return {
      feedName: OtherFeedPage.FeedByIds,
      feedQueryKey: defaultKey,
      query: FEED_BY_IDS_QUERY,
      variables: {
        supportedTypes: supportedTypesForPrivateSources,
        postIds: ids,
      },
      disableAds: true,
      onEmptyFeed: () => setShowEmptyScreen(true),
      options: { refetchOnMount: true },
    };
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, ids]);

  if (showEmptyScreen || !ids || !ids.length) {
    return <p>No posts found</p>;
  }

  return (
    <FeedPageLayoutComponent>
      {children}
      <FeedPageHeader className="mb-5">
        <h1 className="font-bold typo-callout">Feed by IDs</h1>
      </FeedPageHeader>
      {tokenRefreshed && <Feed {...feedProps} />}
    </FeedPageLayoutComponent>
  );
}
