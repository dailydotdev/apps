import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SharedPost } from '../../../graphql/posts';
import { ProfileImageSize } from '../../ProfilePicture';
import { SourceAvatar } from '../../profile/source/SourceAvatar';
import { Separator } from '../../cards/common/common';
import { DateFormat } from '../../utilities';
import { TimeFormatType } from '../../../lib/dateFormat';

export type ReadTimeUnit = 'read' | 'watch';

interface SharedPostMetaInfoProps {
  sharedPost: SharedPost;
  readTimeUnit?: ReadTimeUnit;
}

interface MetaItem {
  key: string;
  hideOnMobile?: boolean;
  content: ReactElement;
}

export const SharedPostMetaInfo = ({
  sharedPost,
  readTimeUnit = 'read',
}: SharedPostMetaInfoProps): ReactElement => {
  const sharedPostSource = sharedPost.source;
  const sourceName = sharedPostSource?.name;
  const hasNamedSource = !!sourceName && sourceName.toLowerCase() !== 'unknown';
  const readTimeLabel = readTimeUnit === 'watch' ? 'watch time' : 'read time';

  // Build the visible items first, then interleave separators only between
  // present items. This avoids a leading separator when earlier items are
  // absent (e.g. unknown source + no domain + only a date).
  const items: MetaItem[] = [];

  if (hasNamedSource && sharedPostSource) {
    items.push({
      key: 'source',
      content: (
        <>
          <SourceAvatar
            source={sharedPostSource}
            size={ProfileImageSize.XSmall}
            className="!mr-0"
          />
          <span className="font-medium text-text-secondary">{sourceName}</span>
        </>
      ),
    });
  }

  if (sharedPost.domain) {
    // When a named source is present, hide "From {domain}" on mobile to keep
    // the meta line uncluttered. The wrapper (with its leading separator) is
    // hidden together so we don't get a stray double-separator on mobile.
    items.push({
      key: 'domain',
      hideOnMobile: hasNamedSource,
      content: <>From {sharedPost.domain}</>,
    });
  }

  if (sharedPost.createdAt) {
    items.push({
      key: 'date',
      content: (
        <DateFormat date={sharedPost.createdAt} type={TimeFormatType.Post} />
      ),
    });
  }

  if (sharedPost.readTime) {
    items.push({
      key: 'readTime',
      content: (
        <>
          {sharedPost.readTime}m {readTimeLabel}
        </>
      ),
    });
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-text-tertiary typo-footnote">
      {items.map((item, index) => (
        // `display: contents` keeps the inner elements as direct flex items
        // of the parent so spacing/separators line up consistently.
        <span
          key={item.key}
          className={classNames(
            'contents',
            item.hideOnMobile && 'hidden tablet:contents',
          )}
        >
          {index > 0 && <Separator />}
          {item.content}
        </span>
      ))}
    </div>
  );
};
