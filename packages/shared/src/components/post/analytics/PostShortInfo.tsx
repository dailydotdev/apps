import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { BoostingLabel } from './BoostingLabel';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
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
import { webappUrl } from '../../../lib/constants';

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
  const postLink = useMemo(() => {
    if (!post) {
      return undefined;
    }

    const postObject = post.sharedPost || post;

    if (
      [
        PostType.Collection,
        PostType.Brief,
        PostType.Freeform,
        PostType.Welcome,
      ].includes(post.type)
    ) {
      return `${webappUrl}posts/${post.slug || post.id}`;
    }

    if (post.sharedPost?.type === PostType.Share) {
      return `${webappUrl}posts/${post.sharedPost.id}`;
    }

    return postObject.permalink;
  }, [post]);

  if (!post) {
    return null;
  }

  const { author, createdAt, title, image, sharedPost } = post;

  const postTitle = title || sharedPost?.title;
  const postImage = sharedPost?.image || image;
  const isBoosting = !!post.flags?.campaignId;

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
        {postTitle && (
          <Typography type={TypographyType.Body} bold truncate>
            {postTitle}
          </Typography>
        )}
        <div className="flex items-center gap-2">
          {isBoosting && <BoostingLabel />}
          {createdAt && (
            <DateFormat
              prefix="Published "
              date={createdAt}
              type={TimeFormatType.Post}
              className="text-text-tertiary typo-footnote"
            />
          )}
          {showLinkIcon && postLink && (
            <Button
              icon={<OpenLinkIcon />}
              variant={ButtonVariant.Tertiary}
              type="button"
              tag="a"
              target="_blank"
              rel="noopener noreferrer"
              href={postLink}
              size={ButtonSize.XSmall}
            />
          )}
        </div>
      </div>
      {showImage && postImage && (
        <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-8">
          <LazyImage
            imgSrc={postImage}
            imgAlt="Post cover image"
            ratio="75%"
            fallbackSrc={cloudinaryPostImageCoverPlaceholder}
          />
        </div>
      )}
    </div>
  );
}
