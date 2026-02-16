import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { Source } from '../../../graphql/sources';
import { useCardCover } from '../../../hooks/feed/useCardCover';
import { ProfileImageSize } from '../../ProfilePicture';
import { Image, ImageType } from '../../image/Image';
import type { ImageProps } from '../../image/Image';
import { SourceAvatar } from '../../profile/source/SourceAvatar';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';

interface SharedPostPreviewProps {
  post: Post;
  source?: Pick<Source, 'image' | 'handle' | 'name'>;
  title?: string;
  image?: string;
  className?: string;
  onShare?: (post: Post) => unknown;
  imageProps?: Pick<ImageProps, 'fetchPriority' | 'loading'>;
}

export function SharedPostPreview({
  post,
  source,
  title,
  image,
  className,
  onShare,
  imageProps,
}: SharedPostPreviewProps): ReactElement {
  const { overlay } = useCardCover({ post, onShare });
  const isUnknownSource = post.sharedPost.source.id === 'unknown';

  return (
    <div
      data-testid="shared-post-preview"
      className={classNames(
        'relative mb-1 mt-2 h-40 overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default',
        className,
      )}
    >
      {overlay}
      <div
        className={classNames(
          'flex h-full flex-col bg-background-default',
          !!overlay && 'opacity-16',
        )}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <Image
            {...imageProps}
            type={ImageType.Post}
            src={image}
            alt={title || 'Shared post cover image'}
            className="size-full object-cover"
          />
          <div className="absolute inset-x-0 top-0 ">
            <div className="flex flex-col gap-2 rounded-t-8 bg-background-subtle p-2">
              {source?.image && source.handle && (
                <div className="flex min-w-0 items-center gap-1">
                  <SourceAvatar
                    source={{
                      image: source.image,
                      handle: isUnknownSource
                        ? post.sharedPost.domain
                        : source.handle,
                    }}
                    size={ProfileImageSize.Size16}
                    className="shrink-0"
                  />
                  <Typography
                    tag={TypographyTag.Span}
                    type={TypographyType.Caption1}
                    color={TypographyColor.Primary}
                    className="truncate font-bold"
                  >
                    {isUnknownSource ? post.sharedPost.domain : source.handle}
                  </Typography>
                </div>
              )}
              {!!title && (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Primary}
                  className="line-clamp-2 break-words"
                >
                  {title}
                </Typography>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
