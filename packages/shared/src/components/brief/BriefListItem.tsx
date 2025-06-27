import React, { Fragment } from 'react';
import type { MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { BriefGradientIcon } from '../icons/BriefGradient';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { PillProps } from '../Pill';
import { Pill } from '../Pill';
import { IconSize } from '../Icon';
import { LockIcon } from '../icons';
import { webappUrl } from '../../lib/constants';
import type { Origin } from '../../lib/log';
import useOnPostClick from '../../hooks/useOnPostClick';
import type { Post } from '../../graphql/posts';
import { isNullOrUndefined } from '../../lib/func';

export type BriefListItemProps = {
  className?: string;
  title: ReactNode;
  pill?: Omit<PillProps, 'className'>;
  readTime?: number;
  postsCount?: number;
  sourcesCount?: number;
  isRead?: boolean;
  isLocked?: boolean;
  onClick?: (post: Post, event: MouseEvent<HTMLAnchorElement>) => void;
  origin: Origin;
  post: Post;
};

export const BriefListItem = ({
  className,
  title,
  pill,
  readTime,
  postsCount,
  sourcesCount,
  isRead,
  isLocked,
  onClick,
  origin,
  post,
}: BriefListItemProps): ReactElement => {
  const onPostClick = useOnPostClick({ origin });

  return (
    <Link
      href={`${webappUrl}posts/${post.slug}`}
      onClick={(event) => {
        if (typeof onClick === 'function') {
          onClick(post, event);
        }

        onPostClick({ post });
      }}
    >
      <article
        className={classNames(
          'flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-3',
          className,
        )}
      >
        <div className="flex items-center">
          <BriefGradientIcon secondary={!isRead} size={IconSize.Size48} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Typography
              type={TypographyType.Title3}
              bold
              color={
                isRead ? TypographyColor.Quaternary : TypographyColor.Primary
              }
            >
              {title}
            </Typography>
            {!!pill && (
              <Pill
                {...pill}
                className="invert !self-auto bg-accent-bacon-default py-0.5 text-text-primary"
              />
            )}
            {isLocked && (
              <LockIcon
                className="text-text-quaternary"
                size={IconSize.Small}
              />
            )}
          </div>
          <div className="flex">
            <Typography
              className="flex flex-row gap-2"
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
            >
              {[
                !isNullOrUndefined(readTime) && (
                  <Typography
                    tag={TypographyTag.Span}
                    key="read-time"
                    color={TypographyColor.Primary}
                  >
                    {readTime}m read time
                  </Typography>
                ),
                postsCount && `${postsCount} posts`,
                sourcesCount && `${sourcesCount} sources`,
              ]
                .filter(Boolean)
                .map((item, index) => {
                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <Fragment key={index}>
                      {index > 0 ? ' • ' : undefined}
                      {item}
                    </Fragment>
                  );
                })}
            </Typography>
          </div>
        </div>
      </article>
    </Link>
  );
};
