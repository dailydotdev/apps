import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { isBefore } from 'date-fns';
import { TimeFormatType } from '../../../lib/dateFormat';
import { Separator } from './common';
import type { Post } from '../../../graphql/posts';
import { formatReadTime, TruncateText, DateFormat } from '../../utilities';
import { largeNumberFormat } from '../../../lib';
import { useFeedCardContext } from '../../../features/posts/FeedCardContext';
import { Tooltip } from '../../tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

interface PostMetadataProps
  extends Pick<Post, 'createdAt' | 'readTime' | 'numUpvotes'> {
  className?: string;
  description?: string;
  children?: ReactNode;
  isVideoType?: boolean;
  domain?: ReactNode;
  endsAt?: string;
  isPoll?: boolean;
  numPollVotes?: number;
  isAuthor?: boolean;
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
  endsAt,
  isPoll,
  numPollVotes,
  isAuthor,
}: PostMetadataProps): ReactElement {
  const timeActionContent = isVideoType ? 'watch' : 'read';
  const showReadTime = isVideoType ? Number.isInteger(readTime) : !!readTime;
  const { boostedBy } = useFeedCardContext();
  const shouldShowVotes = isPoll && (numPollVotes > 10 || isAuthor);

  return (
    <div
      className={classNames(
        'flex items-center text-text-tertiary typo-footnote',
        className,
      )}
    >
      <TruncateText>
        {boostedBy && (
          <Tooltip content={`Boosted by @${boostedBy.username}`}>
            <strong>Boosted</strong>
          </Tooltip>
        )}
        {boostedBy && (!!description || !!createdAt || showReadTime) && (
          <Separator />
        )}
        {!!description && description}
        {!endsAt ||
          (isBefore(new Date(), new Date(endsAt)) && (
            <>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Footnote}
                color={TypographyColor.StatusSuccess}
              >
                {numPollVotes >= 10 || isAuthor ? 'Voting open' : 'New poll'}
              </Typography>
              <Separator />
            </>
          ))}
        {shouldShowVotes && (
          <>
            <Typography tag={TypographyTag.Span} type={TypographyType.Footnote}>
              {largeNumberFormat(numPollVotes)} votes
            </Typography>
            <Separator />
          </>
        )}
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
