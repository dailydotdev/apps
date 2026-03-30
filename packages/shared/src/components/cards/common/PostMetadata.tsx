import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TimeFormatType } from '../../../lib/dateFormat';
import { Separator } from './common';
import type { Post } from '../../../graphql/posts';
import { formatReadTime, DateFormat } from '../../utilities';
import { largeNumberFormat } from '../../../lib';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureUpvoteCountThreshold } from '../../../lib/featureManagement';
import { getUpvoteCountDisplay } from '../../../lib/post';
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
  userHasUpvoted?: boolean;
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
  userHasUpvoted = false,
}: PostMetadataProps): ReactElement {
  const timeActionContent = isVideoType ? 'watch' : 'read';
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;
  const { boostedBy } = useFeedCardContext();

  const { value: upvoteThresholdConfig } = useConditionalFeature({
    feature: featureUpvoteCountThreshold,
  });
  const {
    showCount: showUpvoteCount,
    belowThresholdLabel: upvoteLabel,
  } = getUpvoteCountDisplay(
    numUpvotes ?? 0,
    upvoteThresholdConfig.threshold,
    upvoteThresholdConfig.belowThresholdLabel,
    userHasUpvoted,
  );

  const promotedText = useScrambler('Promoted');
  const promotedByTooltip = useScrambler(
    boostedBy ? `Promoted by @${boostedBy.username}` : null,
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
          {formatReadTime(readTime)} {timeActionContent} time
        </span>
      ),
    },
    !!showReadTime && domain && { key: 'domain', node: domain },
    showUpvoteCount &&
      numUpvotes && {
        key: 'upvotes',
        node: (
          <span data-testid="numUpvotes">
            {largeNumberFormat(numUpvotes)} upvote{numUpvotes > 1 ? 's' : ''}
          </span>
        ),
      },
    !showUpvoteCount &&
      upvoteLabel && {
        key: 'upvotes',
        node: <span data-testid="numUpvotes">{upvoteLabel}</span>,
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
