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
import { DateFormat } from '../../../utilities/DateFormat';
import { formatDate, TimeFormatType } from '../../../../lib/dateFormat';
import { isNullOrUndefined } from '../../../../lib/func';
import Link from '../../../utilities/Link';
import { webappUrl } from '../../../../lib/constants';
import type { Post } from '../../../../graphql/posts';
import { briefSourcesLimit } from '../../../../types';

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
  children,
}: BriefCardReadyProps): ReactElement => {
  const postsCount = post?.flags?.posts || 0;
  const sourcesCount = post?.flags?.sources || 0;

  return (
    <Link href={`${webappUrl}posts/${post.slug}`}>
      <a
        className={classNames(
          'flex rounded-16 border border-white bg-transparent',
          className,
        )}
      >
        <div
          style={rootStyle}
          className={classNames(
            'flex flex-1 flex-col gap-4 rounded-16 px-6 py-4 text-black',
            'backdrop-blur-3xl',
            'border-4 border-black',
          )}
        >
          <BriefIcon secondary size={IconSize.Size48} />
          <Typography type={TypographyType.Title2} bold>
            {title}
          </Typography>
          <Typography type={TypographyType.Callout}>
            <DateFormat
              date={post.updatedAt || post.createdAt}
              type={TimeFormatType.Post}
            />
          </Typography>
          <div className="flex flex-col gap-1">
            {post.flags?.generatedAt && (
              <Typography type={TypographyType.Callout}>
                Brief completed in{' '}
                {formatDate({
                  value: new Date(post.createdAt),
                  now: new Date(post.flags?.generatedAt),
                  type: TimeFormatType.LiveTimer,
                })}
              </Typography>
            )}
            {post.flags?.savedTime && (
              <Typography type={TypographyType.Callout}>
                Save{' '}
                {formatDate({
                  value: new Date(),
                  now: new Date(Date.now() + post.flags.savedTime * 60 * 1000),
                  type: TimeFormatType.LiveTimer,
                })}{' '}
                of reading
              </Typography>
            )}
          </div>
          {children}
          <div className="mt-auto flex flex-col gap-3">
            {!isNullOrUndefined(post.readTime) && (
              <Pill
                className="rounded-20 border border-b-overlay-secondary-pepper px-2.5 py-2"
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
      </a>
    </Link>
  );
};
