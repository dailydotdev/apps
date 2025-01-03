import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { SourceList } from '../../../profile/SourceList';
import { SourceType } from '../../../../graphql/sources';
import { useBlockedQuery } from '../../../../hooks/contentPreference/useBlockedQuery';

type BlockedSourceListProps = {
  type?: SourceType;
  searchQuery?: string;
};
export const BlockedSourceList = ({
  searchQuery,
  type = SourceType.Machine,
}: BlockedSourceListProps): ReactElement => {
  const { feed } = useContext(FeedSettingsEditContext);

  const queryResult = useBlockedQuery({
    entity: ContentPreferenceType.Source,
    feedId: feed.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const sources = useMemo(() => {
    // If search query provided, filter sources by search query
    const regex = new RegExp(searchQuery, 'i');
    return data?.pages.reduce((acc, p) => {
      p?.edges.forEach(({ node }) => {
        if (type && node.source.type === type) {
          if (searchQuery?.length > 0 && !regex.test(node.source.name)) {
            return;
          }
          acc.push({
            ...node.source,
            contentPreference: {
              status: node.status,
            },
          });
        }
      });

      return acc;
    }, []);
  }, [data, type, searchQuery]);

  if (queryResult.isPending) {
    return null;
  }

  return (
    <SourceList
      sources={sources}
      emptyPlaceholder={<p>Can&#39;t find any sources</p>}
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
    />
  );
};
