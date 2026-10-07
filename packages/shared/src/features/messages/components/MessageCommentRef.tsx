import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { dmCommentContextQueryOptions } from '../queries';
import { DmContextCard } from './DmContextCard';

// The sender controls everything in a received <comment-ref>, so only its id
// is trusted: the card shows the comment as daily-api returns it, and only
// when that comment really is by the expected author.
export const MessageCommentRef = ({
  commentId,
  expectedAuthorId,
  label,
  className,
}: {
  commentId: string;
  expectedAuthorId: string;
  label: string;
  className?: string;
}): ReactElement | null => {
  const { user } = useAuthContext();
  const { data: comment, isPending } = useQuery(
    dmCommentContextQueryOptions(user, commentId),
  );

  if (isPending) {
    return null;
  }

  if (!comment || comment.authorId !== expectedAuthorId) {
    return (
      <div
        className={classNames(
          'rounded-12 border-l-2 border-border-subtlest-secondary bg-surface-float px-3 py-2',
          className,
        )}
      >
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          Comment no longer available
        </Typography>
      </div>
    );
  }

  return (
    <DmContextCard context={comment} label={label} className={className} />
  );
};
