import React, { ReactElement } from 'react';
import { getSearchUrl } from '../../graphql/search';
import { InfiniteScrollScreenOffset } from '../../hooks/feed/useFeedInfiniteScroll';
import { SearchEmpty } from './SearchEmpty';
import { SearchHistoryContainer } from './common';
import { SearchBarSuggestion } from './SearchBarSuggestion';
import { SearchSkeleton } from './SearchSkeleton';
import TimerIcon from '../icons/Timer';
import { useSearchHistory } from '../../hooks/search';

interface SearchHistoryProps {
  showEmptyState?: boolean;
  className?: string;
  title?: string;
}

export function SearchHistory({
  showEmptyState = true,
  className,
  title,
}: SearchHistoryProps): ReactElement {
  const {
    result: { isLoading },
    nodes,
    infiniteScrollRef,
  } = useSearchHistory();

  if (isLoading) return <SearchSkeleton className={className} />;

  if (!nodes?.length) return showEmptyState ? <SearchEmpty /> : null;

  return (
    <SearchHistoryContainer className={className}>
      <span className="font-bold text-theme-label-quaternary typo-footnote">
        {title}
      </span>
      {nodes?.map(({ node: suggestion }) => (
        <SearchBarSuggestion
          isHistory
          key={suggestion.id}
          tag="a"
          icon={<TimerIcon />}
          suggestion={suggestion}
          href={getSearchUrl({
            id: suggestion.id,
          })}
        >
          {suggestion.prompt}
        </SearchBarSuggestion>
      ))}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
    </SearchHistoryContainer>
  );
}
