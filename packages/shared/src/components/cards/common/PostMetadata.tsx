import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TimeFormatType } from '../../../lib/dateFormat';
import { Separator } from './common';
import type { Post } from '../../../graphql/posts';
import { formatReadTime, TruncateText, DateFormat } from '../../utilities';
import { largeNumberFormat } from '../../../lib';
import { useFeedCardContext } from '../../../features/posts/FeedCardContext';
import { Tooltip } from '../../tooltip/Tooltip';
import type { PollMetadataProps } from './PollMetadata';
import PollMetadata from './PollMetadata';
import { useScrambler } from '../../../hooks/useScrambler';

interface PostMetadataProps
  extends Pick<Post, 'createdAt' | 'readTime' | 'numUpvotes'> {
  className?: string;
  description?: string;
  children?: ReactNode;
  isVideoType?: boolean;
  domain?: ReactNode;
  pollMetadata?: PollMetadataProps;
}

export default function PostMetadata({
  createdAt,
  readTime,
  numUpvotes,
  className,
  children,
  description,
  isVideoType,
  domain,
  pollMetadata,
}: PostMetadataProps): ReactElement {
  const timeActionContent = isVideoType ? 'watch' : 'read';
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;
  const { boostedBy } = useFeedCardContext();

  const promotedText = useScrambler('Promoted');
  const promotedByTooltip = useScrambler(
    boostedBy ? `Promoted by @${boostedBy.username}` : null,
  );

  return (
    <div
      className={classNames(
        'flex items-center text-text-tertiary typo-footnote',
        className,
      )}
    >
      <TruncateText>
        {boostedBy && (
          <Tooltip content={promotedByTooltip}>
            <strong>{promotedText}</strong>
          </Tooltip>
        )}
        {boostedBy && (!!description || !!createdAt || showReadTime) && (
          <Separator />
        )}
        {!!description && description}
        {pollMetadata && <PollMetadata {...pollMetadata} />}
        {!!createdAt && !!description && !boostedBy && <Separator />}
        {!!createdAt && !boostedBy && (
          <DateFormat date={createdAt} type={TimeFormatType.Post} />
        )}
        {!boostedBy && !!createdAt && showReadTime && <Separator />}
        {showReadTime && (
          <span data-testid="readTime">
            {formatReadTime(readTime)} {timeActionContent} time
          </span>
        )}
        {!!showReadTime && domain && (
          <>
            <Separator /> {domain}
          </>
        )}
        {(!!createdAt || showReadTime) && !!numUpvotes && <Separator />}
        {!!numUpvotes && (
          <span data-testid="numUpvotes">
            {largeNumberFormat(numUpvotes)} upvote{numUpvotes > 1 ? 's' : ''}
          </span>
        )}
        {children}
      </TruncateText>
    </div>
  );
}
