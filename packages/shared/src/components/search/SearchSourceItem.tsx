import React, { ReactElement, useCallback, useContext } from 'react';
import { ClickableText } from '../buttons/ClickableText';
import { SearchChunkSource } from '../../graphql/search';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../lib/analytics';

interface SearchSourceItemProps {
  item: SearchChunkSource;
}

export function SearchSourceItem({
  item,
}: SearchSourceItemProps): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const { id: itemId, name, snippet, url } = item || {};

  const handleSourceClick = useCallback(() => {
    if (itemId) {
      trackEvent({
        event_name: AnalyticsEvent.Click,
        target_type: TargetType.SearchSource,
        target_id: itemId,
        feed_item_title: name,
        feed_iem_target_url: url,
      });
    }
  }, [itemId, name, trackEvent, url]);

  if (!url) {
    return null;
  }

  return (
    <div className="w-full">
      <ClickableText
        tag="a"
        target="_blank"
        href={url}
        className="mb-2 typo-callout"
        onClick={handleSourceClick}
      >
        {name}
      </ClickableText>
      <p className="multi-truncate line-clamp-4 text-text-tertiary typo-footnote">
        {snippet}
      </p>
    </div>
  );
}
