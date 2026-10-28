import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import type { Post } from '../../../../graphql/posts';
import { ClickableText } from '../../../buttons/ClickableText';
import type { Callback } from '../common';

interface CardTldrProps {
  post: Post;
  onExpand?: Callback;
}

/**
 * The post's TLDR on a list card, clamped to three lines. Tapping the clamped
 * text or "Show more" expands it in place for good, and from then on tapping
 * the text opens the post like the rest of the card. A share shows the TLDR of
 * the post it shares.
 */
export const CardTldr = ({
  post,
  onExpand,
}: CardTldrProps): ReactElement | null => {
  const summary = (post.sharedPost ?? post).summary?.trim();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const canExpand = isTruncated && !isExpanded;

  useEffect(() => {
    const text = textRef.current;
    if (!text || isExpanded) {
      return undefined;
    }

    const measure = () =>
      setIsTruncated(text.scrollHeight > text.clientHeight + 1);

    measure();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(text);

    return () => observer.disconnect();
  }, [isExpanded, summary]);

  if (!summary) {
    return null;
  }

  const expand = () => {
    setIsExpanded(true);
    onExpand?.(post);
  };

  return (
    <div
      className={classNames(
        'mt-2 flex flex-col items-start',
        canExpand && 'relative z-1',
      )}
    >
      <p
        ref={textRef}
        className={classNames(
          'break-words text-text-primary typo-callout',
          !isExpanded && 'line-clamp-3',
        )}
      >
        {summary}
      </p>
      {canExpand && (
        <ClickableText
          type="button"
          className="mt-1 !text-text-link after:absolute after:inset-0"
          onClick={expand}
        >
          Show more
        </ClickableText>
      )}
    </div>
  );
};
