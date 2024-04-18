import React, { ReactElement } from 'react';
import { SearchProviderEnum, getSearchUrl } from '../../graphql/search';
import { InfiniteScrollScreenOffset } from '../../hooks/feed/useFeedInfiniteScroll';
import { SearchEmpty } from './SearchEmpty';
import { SearchHistoryContainer } from './common';
import { SearchBarSuggestion, SuggestionOrigin } from './SearchBarSuggestion';
import { SearchSkeleton } from './SearchSkeleton';
import { TimerIcon } from '../icons';
import { useSearchHistory } from '../../hooks/search';

interface SearchHistoryProps {
  showEmptyState?: boolean;
  className?: string;
  title?: string;
  origin: SuggestionOrigin;
}

export function SearchHistory({
  showEmptyState = true,
  className,
  title,
  origin,
}: SearchHistoryProps): ReactElement {
  const {
    result: { isLoading },
    nodes,
    infiniteScrollRef,
  } = useSearchHistory();

  if (isLoading) {
    return <SearchSkeleton className={className} />;
  }

  if (!nodes?.length) {
    return showEmptyState ? <SearchEmpty /> : null;
  }

  return (
    <SearchHistoryContainer className={className}>
      <span className="font-bold text-text-quaternary typo-footnote">
        {title}
      </span>
      {nodes?.map(({ node: suggestion }) => (
        <SearchBarSuggestion
          origin={origin}
          isHistory
          key={suggestion.sessionId}
          id={suggestion.sessionId}
          prompt={suggestion.prompt}
          tag="a"
          icon={<TimerIcon />}
          href={getSearchUrl({
            id: suggestion.sessionId,
            provider: SearchProviderEnum.Chat,
          })}
        >
          {suggestion.prompt}
        </SearchBarSuggestion>
      ))}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
    </SearchHistoryContainer>
  );
}
