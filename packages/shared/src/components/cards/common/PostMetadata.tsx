import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TimeFormatType } from '../../../lib/dateFormat';
import { Separator } from './common';
import type { Post } from '../../../graphql/posts';
import { formatReadTime, DateFormat } from '../../utilities';
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
  const hasUpvoteCount = typeof numUpvotes === 'number';
  const upvoteCount = numUpvotes ?? 0;
  const readTimeValue = readTime ?? 0;
  const timeActionContent = isVideoType ? 'watch' : 'read';
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;
  const { boostedBy } = useFeedCardContext();

  const promotedText = useScrambler('Promoted');
  const promotedByTooltip = useScrambler(
    boostedBy ? `Promoted by @${boostedBy.username}` : undefined,
  );

  const items: { key: string; node: ReactNode }[] = [
    boostedBy && {
      key: 'promoted',
      node: (
        <Tooltip content={promotedByTooltip}>
          <strong>{promotedText}</strong>
        </Tooltip>
      ),
    },
    !!description && { key: 'description', node: description },
    pollMetadata && {
      key: 'poll',
      node: <PollMetadata {...pollMetadata} />,
    },
    !!createdAt &&
      !boostedBy && {
        key: 'date',
        node: <DateFormat date={createdAt} type={TimeFormatType.Post} />,
      },
    showReadTime && {
      key: 'readTime',
      node: (
        <span data-testid="readTime">
          {formatReadTime(readTimeValue)} {timeActionContent} time
        </span>
      ),
    },
    !!showReadTime && domain && { key: 'domain', node: domain },
    hasUpvoteCount &&
      upvoteCount > 0 && {
        key: 'upvotes',
        node: (
          <span data-testid="numUpvotes">
            {largeNumberFormat(upvoteCount)} upvote{upvoteCount > 1 ? 's' : ''}
          </span>
        ),
      },
  ].filter(Boolean) as { key: string; node: ReactNode }[];

  return (
    <div
      className={classNames(
        'flex items-center text-text-tertiary typo-footnote',
        className,
      )}
    >
      {items.map(({ key, node }, i) => (
        <React.Fragment key={key}>
          {i > 0 && <Separator />}
          {node}
        </React.Fragment>
      ))}
      {children}
    </div>
  );
}
