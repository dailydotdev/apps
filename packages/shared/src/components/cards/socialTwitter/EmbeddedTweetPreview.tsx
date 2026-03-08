import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { UserImageProps } from '../../ProfilePicture';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import { Image } from '../../image/Image';
import { isPlaceholderImage } from '../../../lib/image';
import { getSocialTextDirectionProps } from './socialTwitterHelpers';

interface EmbeddedTweetPreviewProps {
  post: Post;
  embeddedTweetAvatarUser: UserImageProps;
  embeddedTweetIdentity: string;
  className?: string;
  textClampClass: string;
  bodyClassName?: string;
  showXLogo?: boolean;
  showMedia?: boolean;
  mediaContainerClassName?: string;
  mediaClassName?: string;
}

const isLikelyTweetMediaUrl = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  const normalized = url.toLowerCase();
  if (
    normalized.includes('/profile_images/') ||
    normalized.includes('/profile_banners/') ||
    isPlaceholderImage(url)
  ) {
    return false;
  }

  return true;
};

export function EmbeddedTweetPreview({
  post,
  embeddedTweetAvatarUser,
  embeddedTweetIdentity,
  className,
  textClampClass,
  bodyClassName,
  showXLogo = false,
  showMedia = false,
  mediaContainerClassName,
  mediaClassName,
}: EmbeddedTweetPreviewProps): ReactElement {
  const resolvedBodyClassName = bodyClassName ?? 'typo-callout';
  const mediaSrc = post.sharedPost?.image || post.image;
  const shouldShowMedia = showMedia && isLikelyTweetMediaUrl(mediaSrc);
  const tweetLanguage = post.sharedPost?.language || post.language;
  const tweetTextDirectionProps = getSocialTextDirectionProps(tweetLanguage);

  return (
    <div
      className={classNames(
        'overflow-hidden rounded-12 border border-border-subtlest-tertiary p-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <ProfilePicture
            user={embeddedTweetAvatarUser}
            size={ProfileImageSize.Size16}
            rounded="full"
            className="shrink-0"
            nativeLazyLoading
          />
          <div className="min-w-0 flex-1">
            {!!embeddedTweetIdentity && (
              <p
                dir="ltr"
                suppressHydrationWarning
                className={classNames(
                  'w-full truncate font-bold typo-caption1',
                  post.read ? 'text-text-tertiary' : 'text-text-primary',
                )}
              >
                {embeddedTweetIdentity}
              </p>
            )}
          </div>
        </div>
        {showXLogo && (
          <TwitterIcon
            className="ml-auto shrink-0 text-text-tertiary"
            size={IconSize.XSmall}
          />
        )}
      </div>
      <p
        {...tweetTextDirectionProps}
        suppressHydrationWarning
        className={classNames(
          'mt-1 whitespace-pre-line break-words',
          resolvedBodyClassName,
          post.read ? 'text-text-tertiary' : 'text-text-primary',
          textClampClass,
        )}
      >
        {post.sharedPost?.title || post.title}
      </p>
      {shouldShowMedia && !!mediaSrc && (
        <div
          className={classNames(
            'mt-2 overflow-hidden rounded-12',
            mediaContainerClassName,
          )}
        >
          <Image
            src={mediaSrc}
            alt="Tweet media"
            className={classNames('h-auto w-full object-cover', mediaClassName)}
          />
        </div>
      )}
    </div>
  );
}
