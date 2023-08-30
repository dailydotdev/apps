import React, { ReactElement, useContext, useEffect } from 'react';
import { getSearchUrl } from '../../graphql/search';
import { InfiniteScrollScreenOffset } from '../../hooks/feed/useFeedInfiniteScroll';
import { SearchEmpty } from './SearchEmpty';
import { SearchHistoryContainer } from './common';
import { SearchBarSuggestion } from './SearchBarSuggestion';
import { SearchSkeleton } from './SearchSkeleton';
import TimerIcon from '../icons/Timer';
import { useSearchHistory } from '../../hooks/search/useSearchHistory';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, Origin } from '../../lib/analytics';

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
  const { trackEvent } = useContext(AnalyticsContext);
  const {
    result: { isLoading },
    nodes,
    infiniteScrollRef,
  } = useSearchHistory();

  useEffect(() => {
    trackEvent({ event_name: AnalyticsEvent.OpenSearchHistory });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <SearchSkeleton className={className} />;

  if (!nodes?.length) return showEmptyState ? <SearchEmpty /> : null;

  return (
    <SearchHistoryContainer className={className}>
      <span className="font-bold text-theme-label-quaternary typo-footnote">
        {title}
      </span>
      {nodes?.map(({ node: suggestion }) => (
        <SearchBarSuggestion
          key={suggestion.id}
          tag="a"
          icon={<TimerIcon />}
          suggestion={suggestion}
          origin={Origin.HistoryPage}
          href={getSearchUrl({
            id: suggestion.id,
            question: suggestion.prompt,
          })}
        >
          {prompt}
        </SearchBarSuggestion>
      ))}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
    </SearchHistoryContainer>
  );
}
