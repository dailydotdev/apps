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
import { BriefGradientIcon, LinkIcon, LockIcon, ShareIcon } from '../icons';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Tooltip } from '../tooltip/Tooltip';
import type { Origin, TargetId } from '../../lib/log';
import { LogEvent } from '../../lib/log';
import useOnPostClick from '../../hooks/useOnPostClick';
import type { Post } from '../../graphql/posts';
import { isNullOrUndefined, isSpecialKeyPressed } from '../../lib/func';
import { CardLink } from '../cards/common/Card';
import { webappUrl } from '../../lib/constants';
import { anchorDefaultRel } from '../../lib/strings';
import Link from '../utilities/Link';
import { useLogContext } from '../../contexts/LogContext';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { useSharePost } from '../../hooks/useSharePost';
import { CopyStateIcon } from '../share/CopyStateIcon';
import { featureBriefingShareControls } from '../../lib/featureManagement';
import { useSharePlacement } from '../../features/snapshot/useSharePlacement';

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
  const { copyLink, isCopying, openSharePost } = useSharePost(origin);
  const withShareControls = useSharePlacement({
    feature: featureBriefingShareControls,
  });

  const trackBriefClick = () => {
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

  const onPostCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isSpecialKeyPressed({ event })) {
      onClick?.(post, event);
    }
    trackBriefClick();
  };

  return (
    <article
      className={classNames(
        'relative flex w-full items-center gap-4 rounded-16 border border-border-subtlest-tertiary p-3',
        className,
      )}
    >
      <div className="hidden items-center mobileXL:flex">
        <BriefGradientIcon secondary={!isRead} size={IconSize.Size48} />
      </div>
      <div
        className={classNames(
          'flex flex-col gap-1',
          // `w-full` overflows the card once a control shares the row: the
          // column claims 100% of the article and pushes the button past the
          // border. Shrinkable + greedy is the same width without the overflow.
          withShareControls ? 'min-w-0 flex-1' : 'w-full',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Typography
            type={TypographyType.Title3}
            bold
            color={
              isRead ? TypographyColor.Quaternary : TypographyColor.Primary
            }
            truncate={withShareControls}
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
      <Link href={`${webappUrl}posts/${post.slug ?? post.id}`} passHref>
        <CardLink
          className="cursor-pointer"
          title={post.title}
          rel={anchorDefaultRel}
          onClick={onPostCardClick}
          onAuxClick={(event) => event.button === 1 && trackBriefClick()}
        />
      </Link>
      {withShareControls && (
        // After the CardLink and above it: the overlay covers the whole row,
        // so anything rendered before it never receives the click.
        <div className="relative z-1 flex shrink-0 items-center gap-1">
          <Tooltip content={isCopying ? 'Copied!' : 'Copy link'}>
            <Button
              aria-label="Copy link"
              icon={<CopyStateIcon copied={isCopying} idle={LinkIcon} />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={() => copyLink({ post })}
            />
          </Tooltip>
          <Tooltip content="Share">
            <Button
              aria-label="Share briefing"
              icon={<ShareIcon />}
              size={ButtonSize.Small}
              variant={ButtonVariant.Tertiary}
              onClick={() => openSharePost({ post })}
            />
          </Tooltip>
        </div>
      )}
    </article>
  );
};
