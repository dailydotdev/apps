import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { ProfileImageLink } from '../../profile/ProfileImageLink';
import { ProfileImageSize } from '../../ProfilePicture';
import { DateFormat } from '../../utilities';
import { TimeFormatType } from '../../../lib/dateFormat';
import { LazyImage } from '../../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../../lib/image';
import { OpenLinkIcon } from '../../icons';
import { Typography, TypographyType } from '../../typography/Typography';
import { ButtonSize, ButtonVariant } from '../../buttons/common';
import { Button } from '../../buttons/Button';

interface PostShortInfoProps {
  post: Post;
  className?: string;
  showImage?: boolean;
  showLinkIcon?: boolean;
}

export function PostShortInfo({
  post,
  className,
  showImage = true,
  showLinkIcon = true,
}: PostShortInfoProps): ReactElement {
  if (!post) {
    return null;
  }

  const { author, createdAt, title, image, permalink } = post;

  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {author && (
          <div className="flex items-center gap-2">
            <ProfileImageLink
              picture={{
                size: ProfileImageSize.Small,
                nativeLazyLoading: true,
                eager: true,
              }}
              user={author}
            />
            <Typography type={TypographyType.Callout} bold>
              {author.name}
            </Typography>
          </div>
        )}
        {title && (
          <Typography type={TypographyType.Body} bold truncate>
            {title}
          </Typography>
        )}
        <div className="flex items-center gap-2">
          {createdAt && (
            <DateFormat
              prefix="Published "
              date={createdAt}
              type={TimeFormatType.Post}
              className="text-text-tertiary typo-footnote"
            />
          )}
          {showLinkIcon && permalink && (
            <Button
              icon={<OpenLinkIcon />}
              variant={ButtonVariant.Tertiary}
              type="button"
              tag="a"
              target="_blank"
              rel="noopener noreferrer"
              href={permalink}
              size={ButtonSize.XSmall}
            />
          )}
        </div>
      </div>
      {showImage && image && (
        <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-8">
          <LazyImage
            imgSrc={image}
            imgAlt="Post cover image"
            ratio="75%"
            fallbackSrc={cloudinaryPostImageCoverPlaceholder}
          />
        </div>
      )}
    </div>
  );
}
