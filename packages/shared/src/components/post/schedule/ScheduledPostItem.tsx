import type { ReactElement } from 'react';
import React from 'react';
import Link from '../../utilities/Link';
import { SourceAvatar } from '../../profile/source/SourceAvatar';
import { ProfileImageSize } from '../../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { ScheduledPost } from '../../../graphql/posts';
import { webappUrl } from '../../../lib/constants';
import { formatScheduleDelta } from '../../../lib/scheduledPost';
import { dateFormatInTimezone } from '../../../lib/timezones';

interface ScheduledPostItemProps {
  post: ScheduledPost;
}

export function ScheduledPostItem({
  post,
}: ScheduledPostItemProps): ReactElement | null {
  const { user } = useAuthContext();
  const scheduledAt = post.flags?.scheduledAt;

  if (!scheduledAt) {
    return null;
  }

  const scheduledDate = new Date(scheduledAt);
  const absolute = dateFormatInTimezone(
    scheduledDate,
    'MMM d, yyyy · HH:mm',
    user?.timezone,
  );
  const delta = formatScheduleDelta(scheduledDate);

  return (
    <Link href={`${webappUrl}posts/${post.id}/edit`} passHref>
      <a className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3 hover:bg-surface-hover">
        <SourceAvatar
          source={post.source}
          size={ProfileImageSize.Medium}
          className="!mr-0"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Typography type={TypographyType.Body} bold truncate>
            {post.title || 'Untitled post'}
          </Typography>
          {post.source?.name && (
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              truncate
            >
              {post.source.name}
            </Typography>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end text-text-tertiary">
          <Typography type={TypographyType.Caption1}>{absolute}</Typography>
          {delta && (
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {delta}
            </Typography>
          )}
        </div>
      </a>
    </Link>
  );
}
