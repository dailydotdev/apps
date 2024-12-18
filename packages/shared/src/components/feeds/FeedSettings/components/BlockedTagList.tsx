import React, { type ReactElement, useContext, useMemo } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { useBlockedQuery } from '../../../../hooks/contentPreference/useBlockedQuery';
import { TagList } from '../../../profile/TagList';

type BlockedTagListProps = {
  searchQuery?: string;
};

export const BlockedTagList = ({
  searchQuery,
}: BlockedTagListProps): ReactElement => {
  const { feed } = useContext(FeedSettingsEditContext);

  const queryResult = useBlockedQuery({
    entity: ContentPreferenceType.Keyword,
    feedId: feed.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const tags = useMemo(() => {
    // If search query provided, filter sources by search query
    const regex = new RegExp(searchQuery, 'i');
    return data?.pages.reduce((acc, p) => {
      p?.edges.forEach(({ node }) => {
        if (regex && !regex.test(node.referenceId)) {
          return;
        }
        acc.push({
          ...node,
        });
      });

      return acc;
    }, []);
  }, [data, searchQuery]);

  if (queryResult.isPending) {
    return null;
  }

  return (
    <TagList
      tags={tags}
      emptyPlaceholder={<p>Can&#39;t find any tags</p>}
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
    />
  );
};
