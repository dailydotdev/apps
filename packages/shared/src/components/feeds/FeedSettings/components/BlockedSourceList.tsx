import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { ContentPreferenceType } from '../../../../graphql/contentPreference';
import { checkFetchMore } from '../../../containers/InfiniteScrolling';
import { SourceList } from '../../../profile/SourceList';
import type { Source } from '../../../../graphql/sources';
import { SourceType } from '../../../../graphql/sources';
import {
  CharmEmptyState,
  CharmEmptyStatePlacement,
} from '../../../charm/CharmEmptyState';
import { cloudinaryCharmEmptySquads } from '../../../../lib/image';
import { useBlockedQuery } from '../../../../hooks/contentPreference/useBlockedQuery';
import { escapeRegexCharacters } from '../../../../lib/strings';

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
    feedId: feed?.id,
  });

  const { data, isFetchingNextPage, fetchNextPage } = queryResult;
  const sources = useMemo(() => {
    // If search query provided, filter sources by search query
    const escapedSearchQuery = searchQuery
      ? escapeRegexCharacters(searchQuery)
      : '';
    const regex = new RegExp(escapedSearchQuery, 'i');
    return (
      data?.pages.reduce<Source[]>((acc, p) => {
        p?.edges.forEach(({ node }) => {
          if (node.source && type && node.source.type === type) {
            if (searchQuery?.length && !regex.test(node.source.name ?? '')) {
              return;
            }
            acc.push({ ...node.source, contentPreference: node });
          }
        });

        return acc;
      }, []) ?? []
    );
  }, [data, type, searchQuery]);

  const noun = type === SourceType.Squad ? 'squads' : 'sources';
  const singular = type === SourceType.Squad ? 'squad' : 'source';

  return (
    <SourceList
      sources={sources}
      isLoading={queryResult.isLoading}
      placeholderAmount={8}
      emptyPlaceholder={
        <CharmEmptyState
          placement={CharmEmptyStatePlacement.Page}
          image={cloudinaryCharmEmptySquads}
          imageAlt={`daily.dev charm waiting for ${noun}`}
          title={
            searchQuery?.length
              ? `No blocked ${noun} match \u201c${searchQuery}\u201d`
              : `No ${noun} yet`
          }
          description={
            searchQuery?.length
              ? `To block a ${singular}, choose Block in the menu of any of its posts.`
              : `${noun[0].toUpperCase()}${noun.slice(
                  1,
                )} you block are listed here.`
          }
        />
      }
      scrollingProps={{
        isFetchingNextPage,
        canFetchMore: checkFetchMore(queryResult),
        fetchNextPage,
      }}
      showBlock
      showFollow={false}
    />
  );
};
