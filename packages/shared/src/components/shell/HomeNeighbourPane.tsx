import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FeedProps } from '../Feed';
import Feed from '../Feed';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { happeningNowSegmentKey } from './HomeSegments';

// The pane beside Home's lit feed while the finger pages: the neighbour's
// feed with the query its page would run, or, for Happening now, which is
// its own page, the shape of one until the page opens.
export const HomeNeighbourPane = ({
  segmentKey,
  feedProps,
  className,
}: {
  segmentKey: string;
  feedProps: FeedProps<unknown> | null;
  className?: string;
}): ReactElement | null => {
  if (segmentKey === happeningNowSegmentKey || !feedProps) {
    return (
      <div
        aria-hidden
        className={classNames('flex flex-col gap-4 px-4 py-6', className)}
      >
        <ElementPlaceholder className="h-6 w-40 rounded-8" />
        <ElementPlaceholder className="h-48 w-full rounded-16" />
        <ElementPlaceholder className="h-48 w-full rounded-16" />
        <ElementPlaceholder className="h-48 w-full rounded-16" />
      </div>
    );
  }

  return <Feed {...feedProps} disableTopHero className={className} />;
};
