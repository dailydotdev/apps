import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { IconSize } from '../../Icon';
import { TwitterIcon } from '../../icons';
import {
  getSocialTextDirectionProps,
  getSocialTwitterMetadata,
} from './socialTwitterHelpers';

interface EmbeddedTweetPreviewProps {
  post: Post;
  className?: string;
  textClampClass: string;
  bodyClassName?: string;
  showXLogo?: boolean;
  fillAvailableHeight?: boolean;
}

export function EmbeddedTweetPreview({
  post,
  className,
  textClampClass,
  bodyClassName,
  showXLogo = true,
  fillAvailableHeight = false,
}: EmbeddedTweetPreviewProps): ReactElement {
  const resolvedBodyClassName = bodyClassName ?? 'typo-callout';
  const tweetLanguage = post.sharedPost?.language || post.language;
  const tweetTextDirectionProps = getSocialTextDirectionProps(tweetLanguage);
  const tweetBody = post.sharedPost?.title || post.title;
  const tweetBodyHtml =
    post.sharedPost?.titleHtml || post.sharedPost?.title || post.titleHtml;

  const { embeddedTweetIdentity, embeddedTweetAvatarUser } =
    getSocialTwitterMetadata(post);

  const tweetBodyClassName = classNames(
    'min-h-0 whitespace-pre-line break-words',
    resolvedBodyClassName,
    post.read ? 'text-text-tertiary' : 'text-text-primary',
    textClampClass,
  );

  return (
    <div
      className={classNames(
        'flex min-h-0 flex-col overflow-hidden rounded-12 border border-border-subtlest-tertiary p-3',
        fillAvailableHeight && 'flex-1',
        className,
      )}
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2">
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
      <div
        className={classNames(
          'mt-1 min-h-0',
          fillAvailableHeight && 'flex-1 overflow-hidden',
        )}
      >
        {tweetBodyHtml ? (
          <p
            {...tweetTextDirectionProps}
            suppressHydrationWarning
            className={tweetBodyClassName}
            dangerouslySetInnerHTML={{ __html: tweetBodyHtml }}
          />
        ) : (
          <p
            {...tweetTextDirectionProps}
            suppressHydrationWarning
            className={tweetBodyClassName}
          >
            {tweetBody}
          </p>
        )}
      </div>
    </div>
  );
}
