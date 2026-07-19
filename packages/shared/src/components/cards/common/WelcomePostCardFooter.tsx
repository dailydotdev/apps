import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { CardSpace } from './Card';
import type { Post } from '../../../graphql/posts';
import { CardCover } from './CardCover';
import { useCardCover } from '../../../hooks/feed/useCardCover';
import { sanitizeMessage } from '../../../features/onboarding/shared';

interface WelcomePostCardFooterProps {
  post: Post;
  image?: string;
  contentHtml?: string;
  onShare?: (post: Post) => void;
  imageClassName?: string;
  contentClassName?: string;
  glassActions?: boolean;
}

export const WelcomePostCardFooter = ({
  post,
  image,
  onShare,
  contentHtml,
  imageClassName,
  contentClassName,
  glassActions = false,
}: WelcomePostCardFooterProps): ReactElement | null => {
  const { overlay } = useCardCover({
    post,
    className: {
      bookmark: {
        container: !image
          ? '!justify-start !items-start ml-2 mt-4 gap-1'
          : undefined,
      },
    },
  });
  const content = useMemo(
    () => (contentHtml ? sanitizeMessage(contentHtml, []) : ''),
    [contentHtml],
  );
  const decodedText = useMemo(() => {
    const span = document.createElement('div');
    span.innerHTML = content || '';
    return span.innerText || content;
  }, [content]);

  if (image) {
    return (
      <>
        <CardSpace />
        <CardCover
          onShare={onShare}
          post={post}
          shareCoverClassName={glassActions ? 'pb-12' : undefined}
          imageProps={{
            src: image,
            className: classNames('mb-1 mt-2 w-full px-1', imageClassName),
            alt: 'Post Cover image',
          }}
        />
      </>
    );
  }

  if (overlay) {
    return <>{overlay}</>;
  }

  if (content) {
    return (
      <p
        className={classNames(
          'mt-1 break-words px-4 typo-callout',
          // The glass action bar floats over the card bottom. Clamp one line
          // tighter and reserve its height (pb-12) so text never sits under it.
          glassActions ? 'line-clamp-5 pb-12' : 'line-clamp-6',
          contentClassName,
        )}
      >
        {decodedText}
      </p>
    );
  }

  return null;
};
