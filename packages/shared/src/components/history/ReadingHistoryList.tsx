import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { HideReadHistory } from '../../hooks/useReadingHistory';
import { isDateOnlyEqual, TimeFormatType } from '../../lib/dateFormat';
import PostItemCard from '../post/PostItemCard';
import { InfiniteScrollScreenOffset } from '../../hooks/feed/useFeedInfiniteScroll';
import { Origin } from '../../lib/log';
import { DateFormat } from '../utilities';
import type { ReadHistoryInfiniteData } from '../../hooks/useInfiniteReadingHistory';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { useSharingVisibility } from '../../hooks/useSharingVisibility';
import { featureShareHistory } from '../../lib/featureManagement';

export interface ReadHistoryListProps {
  data: ReadHistoryInfiniteData;
  onHide: HideReadHistory;
  infiniteScrollRef: (node?: Element | null) => void;
}

export default function ReadHistoryList({
  data,
  onHide,
  infiniteScrollRef,
}: ReadHistoryListProps): ReactElement {
  const { isEnabled: isSharingVisible } = useSharingVisibility();
  // Per-surface flag; only evaluated once the master kill-switch is on.
  const { value: isShareHistoryEnabled } = useConditionalFeature({
    feature: featureShareHistory,
    shouldEvaluate: isSharingVisible,
  });
  const showCopyLink = isSharingVisible && isShareHistoryEnabled;

  const renderList = useCallback(() => {
    let currentDate: Date;

    return data?.pages.map((page, pageIndex) =>
      page.readHistory.edges.reduce<ReactElement[]>(
        (dom, { node: history }, edgeIndex) => {
          const { timestamp } = history;
          // NaN fallback keeps the pre-strict `new Date(undefined)` behavior
          // (Invalid Date) for the never-expected timestamp-less edge.
          const date = new Date(timestamp ?? Number.NaN);

          if (!currentDate || !isDateOnlyEqual(currentDate, date)) {
            currentDate = date;
            dom.push(
              <DateFormat
                key={date.toISOString()}
                date={date}
                type={TimeFormatType.ReadHistory}
                className="my-3 px-6 text-text-tertiary typo-body first:mt-0"
              />,
            );
          }

          const indexes = { page: pageIndex, edge: edgeIndex };

          dom.push(
            <PostItemCard
              key={`${history.post.id}-${timestamp}`}
              postItem={history}
              indexes={indexes}
              onHide={(params) => onHide({ ...params, ...indexes })}
              showVoteActions
              showCopyLink={showCopyLink}
              logOrigin={Origin.History}
            />,
          );

          return dom;
        },
        [],
      ),
    );
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, onHide, showCopyLink]);

  return (
    <section className="relative flex flex-col">
      {renderList()}
      <InfiniteScrollScreenOffset ref={infiniteScrollRef} />
    </section>
  );
}
