import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { Image } from '../../components/image/Image';
import type { Post } from '../../graphql/posts';
import type { Squad } from '../../graphql/sources';
import { SourceType } from '../../graphql/sources';
import { largeNumberFormat } from '../../lib';

interface BoostTargetProps {
  post?: Post;
  squad?: Squad;
  /** A line under the title, defaults to where the post lives or the handle. */
  subtitle?: ReactNode;
  /** Shown at the end of the row, an open link for example. */
  action?: ReactNode;
  className?: string;
}

const getPostSubtitle = (post: Post): string | undefined =>
  post.source?.type === SourceType.Squad ? post.source.name : undefined;

const getSquadSubtitle = (squad: Squad): string => {
  const members = squad.membersCount
    ? ` · ${largeNumberFormat(squad.membersCount)} members`
    : '';

  return `@${squad.handle}${members}`;
};

/** What is being boosted: a post's thumbnail and title, or a Squad's avatar. */
export function BoostTarget({
  post,
  squad,
  subtitle,
  action,
  className,
}: BoostTargetProps): ReactElement | null {
  if (!post && !squad) {
    return null;
  }

  const image = post ? (post.sharedPost?.image ?? post.image) : squad?.image;
  const title = post ? (post.title ?? post.sharedPost?.title) : squad?.name;
  const caption =
    subtitle ??
    (post ? getPostSubtitle(post) : squad && getSquadSubtitle(squad));

  return (
    <div
      className={classNames(
        'flex min-w-0 flex-row items-center gap-3',
        className,
      )}
    >
      {image && (
        <Image
          src={image}
          alt=""
          className={classNames(
            'shrink-0 bg-surface-float object-cover',
            post ? 'h-12 w-16 rounded-12' : 'size-12 rounded-max',
          )}
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Callout}
          className="line-clamp-2 break-words"
          bold={!post}
        >
          {title}
        </Typography>
        {!!caption && (
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {caption}
          </Typography>
        )}
      </span>
      {action}
    </div>
  );
}
