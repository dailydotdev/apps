import React, { Fragment } from 'react';
import type { MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import type { PillProps } from '../Pill';
import { Pill } from '../Pill';
import { IconSize } from '../Icon';
import { BriefGradientIcon, LockIcon } from '../icons';
import type { Origin, TargetId } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import useOnPostClick from '../../hooks/useOnPostClick';
import type { Post } from '../../graphql/posts';
import { isNullOrUndefined } from '../../lib/func';
import { CardLink } from '../cards/common/Card';
import { webappUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import { combinedClicks } from '../../lib/click';
import Link from '../utilities/Link';
import { useLogContext } from '../../contexts/LogContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';

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
  targetId: TargetId;
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
  targetId,
}: BriefListItemProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const onPostClick = useOnPostClick({ origin });

  const onCombinedClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof onClick === 'function') {
      onClick(post, event);
    }

    onPostClick({ post });

    logEvent({
      event_name: LogEvent.ClickBrief,
      target_id: targetId,
      extra: JSON.stringify({
        is_demo: !isPlus,
        brief_date: post.createdAt,
      }),
    });
  };

  return (
    <article
      className={classNames(
        'relative flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-3',
        className,
      )}
    >
      <Link href={`${webappUrl}posts/${post.slug ?? post.id}`} passHref>
        <CardLink
          className="cursor-pointer"
          title={post.title}
          rel={anchorDefaultRel}
          {...combinedClicks(onCombinedClick)}
        />
      </Link>
      <div className="hidden items-center mobileXL:flex">
        <BriefGradientIcon secondary={!isRead} size={IconSize.Size48} />
      </div>
      <div className="flex w-full flex-col gap-1">
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
            <LockIcon className="text-text-quaternary" size={IconSize.Small} />
          )}
        </div>
        <div className="flex">
          <Typography
            className="gap-1"
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            truncate
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
              `Based on ${postsCount ?? 0} posts from ${
                sourcesCount ?? 0
              } sources`,
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
  );
};
