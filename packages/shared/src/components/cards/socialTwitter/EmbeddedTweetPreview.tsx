import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { UserImageProps } from '../../ProfilePicture';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';

interface EmbeddedTweetPreviewProps {
  post: Post;
  embeddedTweetAvatarUser: UserImageProps;
  embeddedTweetIdentity: string;
  className?: string;
  textClampClass: string;
  bodyClassName?: string;
  showXLogo?: boolean;
}

export function EmbeddedTweetPreview({
  post,
  embeddedTweetAvatarUser,
  embeddedTweetIdentity,
  className,
  textClampClass,
  bodyClassName,
  showXLogo = false,
}: EmbeddedTweetPreviewProps): ReactElement {
  const resolvedBodyClassName = bodyClassName ?? 'typo-callout';

  return (
    <div
      className={classNames(
        'rounded-12 border border-border-subtlest-tertiary p-3',
        className,
      )}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <ProfilePicture
            user={embeddedTweetAvatarUser}
            size={ProfileImageSize.Size16}
            rounded="full"
            className="shrink-0"
            nativeLazyLoading
          />
          <div className="min-w-0">
            {!!embeddedTweetIdentity && (
              <p
                className={classNames(
                  'truncate font-bold typo-caption1',
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
            className="shrink-0 text-text-tertiary"
            size={IconSize.XSmall}
          />
        )}
      </div>
      <p
        className={classNames(
          'mt-1 whitespace-pre-line break-words',
          resolvedBodyClassName,
          post.read ? 'text-text-tertiary' : 'text-text-primary',
          textClampClass,
        )}
      >
        {post.sharedPost?.title}
      </p>
    </div>
  );
}
