import React, { Fragment } from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import { Typography, TypographyType } from '../../../typography/Typography';
import { briefCardBgSecondary } from '../../../../styles/custom';
import type { BriefCardProps } from './BriefCard';
import { BriefIcon, TimerIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import { Pill } from '../../../Pill';
import { ProfileImageSize } from '../../../ProfilePicture';
import { CollectionPillSources } from '../../../post/collection/CollectionPillSources';
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import { isNullOrUndefined } from '../../../../lib/func';
import type { Post } from '../../../../graphql/posts';
import { briefSourcesLimit } from '../../../../types';
import { LogEvent } from '../../../../lib/log';
import { useLogContext } from '../../../../contexts/LogContext';
import { usePlusSubscription } from '../../../../hooks';
import { webappUrl } from '../../../../lib/constants';
import Link from '../../../utilities/Link';
import { anchorDefaultRel } from '../../../../lib/strings';
import { combinedClicks } from '../../../../lib/click';
import { CardLink } from '../../common/Card';

export type BriefCardReadyProps = BriefCardProps & {
  post: Post;
};

const rootStyle = {
  background: briefCardBgSecondary,
};

export const BriefCardReady = ({
  post,
  className,
  title,
  targetId,
  children,
}: BriefCardReadyProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { logEvent } = useLogContext();
  const postsCount = post?.flags?.posts || 0;
  const sourcesCount = post?.flags?.sources || 0;

  const onCombinedClick = () => {
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
    <div
      className={classNames(
        'relative flex flex-1 rounded-16 border border-white bg-transparent',
        className,
      )}
    >
      <Link href={`${webappUrl}posts/${post.slug ?? post.id}`} passHref>
        <CardLink
          className="z-[1000000] cursor-pointer"
          title={post.title}
          rel={anchorDefaultRel}
          {...combinedClicks(onCombinedClick)}
        />
      </Link>
      <div
        style={rootStyle}
        className={classNames(
          'flex flex-1 flex-col gap-2 rounded-16 px-6 py-4 text-black laptop:gap-4',
          'backdrop-blur-3xl',
          'border-4 border-black',
        )}
      >
        <div className="flex flex-1 flex-row items-center gap-2 laptop:flex-col laptop:items-start laptop:gap-4">
          <BriefIcon secondary size={IconSize.Size48} />
          <div className="flex flex-1 flex-col laptop:gap-4 ">
            <Typography className="typo-callout laptop:typo-title2" bold>
              {title}
            </Typography>
            <Typography type={TypographyType.Callout}>{post.title}</Typography>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 laptop:gap-4">
          <div className="flex flex-row gap-1 laptop:flex-col">
            <Typography type={TypographyType.Callout} className="w-full">
              {post.flags?.generatedAt &&
                `Your AI agent spent ${formatDate({
                  value: new Date(post.createdAt),
                  now: new Date(post.flags?.generatedAt),
                  type: TimeFormatType.LiveTimer,
                })} on this presidential briefing. `}
              {post.flags.savedTime &&
                `It saved you ${formatDate({
                  value: new Date(),
                  now: new Date(Date.now() + post.flags.savedTime * 60 * 1000),
                  type: TimeFormatType.LiveTimer,
                })}  of trying to keep up. `}
              Proceed responsibly (or don&apos;t, your call).
            </Typography>
          </div>
        </div>
        {children}
        <div className="mt-auto flex flex-col gap-3">
          {!isNullOrUndefined(post.readTime) && (
            <Pill
              className="absolute right-4 top-4 rounded-20 border border-b-overlay-secondary-pepper px-2.5 py-2 laptop:relative laptop:right-auto laptop:top-auto"
              label={
                <div className="flex items-center gap-1">
                  <TimerIcon />
                  <Typography type={TypographyType.Footnote}>
                    {post.readTime}m read
                  </Typography>
                </div>
              }
            />
          )}
          <div className="flex items-center">
            {post.collectionSources?.length > 0 && (
              <CollectionPillSources
                alwaysShowSources
                className={{
                  main: classNames('m-2'),
                }}
                sources={post.collectionSources}
                totalSources={post.collectionSources.length}
                size={ProfileImageSize.Size16}
                limit={briefSourcesLimit}
              />
            )}
            <Typography
              className="flex flex-row gap-2"
              type={TypographyType.Subhead}
            >
              {[
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
      </div>
    </div>
  );
};
