import React, { ReactElement, useCallback, useContext } from 'react';

import LogContext from '../../contexts/LogContext';
import { SearchChunkSource } from '../../graphql/search';
import { LogEvent, TargetType } from '../../lib/log';
import { ClickableText } from '../buttons/ClickableText';

interface SearchSourceItemProps {
  item: SearchChunkSource;
}

export function SearchSourceItem({
  item,
}: SearchSourceItemProps): ReactElement {
  const { logEvent } = useContext(LogContext);
  const { id: itemId, name, snippet, url } = item || {};

  const handleSourceClick = useCallback(() => {
    if (itemId) {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.SearchSource,
        target_id: itemId,
        feed_item_title: name,
        feed_iem_target_url: url,
      });
    }
  }, [itemId, name, logEvent, url]);

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
