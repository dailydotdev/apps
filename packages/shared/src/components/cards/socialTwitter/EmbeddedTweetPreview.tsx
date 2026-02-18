import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { UserImageProps } from '../../ProfilePicture';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';

interface EmbeddedTweetPreviewProps {
  post: Post;
  embeddedTweetAvatarUser: UserImageProps;
  embeddedTweetIdentity: string;
  className?: string;
  textClampClass: string;
}

export function EmbeddedTweetPreview({
  post,
  embeddedTweetAvatarUser,
  embeddedTweetIdentity,
  className,
  textClampClass,
}: EmbeddedTweetPreviewProps): ReactElement {
  return (
    <div
      className={classNames(
        'rounded-12 border border-border-subtlest-tertiary p-3',
        className,
      )}
    >
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
            <p className="truncate font-bold text-text-primary typo-caption1">
              {embeddedTweetIdentity}
            </p>
          )}
        </div>
      </div>
      <p
        className={classNames(
          'mt-1 whitespace-pre-line break-words typo-callout',
          post.read ? 'text-text-tertiary' : 'text-text-primary',
          textClampClass,
        )}
      >
        {post.sharedPost?.title}
      </p>
    </div>
  );
}
