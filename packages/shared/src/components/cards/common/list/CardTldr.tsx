import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import classNames from 'classnames';
import type { Post } from '../../../../graphql/posts';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { featureListCardTldr } from '../../../../lib/featureManagement';
import { ClickableText } from '../../../buttons/ClickableText';
import type { Callback } from '../common';

interface CardTldrProps {
  post: Post;
  onExpand?: Callback;
}

/**
 * The post's TLDR on a list card, clamped to three lines with "Read more" to
 * expand it in place. A share shows the TLDR of the post it shares. The text
 * stays part of the card, so tapping it still opens the post.
 */
export const CardTldr = ({
  post,
  onExpand,
}: CardTldrProps): ReactElement | null => {
  const summary = (post.sharedPost ?? post).summary?.trim();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureListCardTldr,
    shouldEvaluate: !!summary,
  });
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

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
  }, [isExpanded, isEnabled, summary]);

  if (!isEnabled || !summary) {
    return null;
  }

  const toggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      onExpand?.(post);
      return;
    }

    // Collapsing shrinks the card being read, which would pull the rest of the
    // feed up under the reader. Keep the card's bottom edge where it was, so
    // the next card lands where "Show less" was.
    const card = textRef.current?.closest('article');
    const bottomBefore = card?.getBoundingClientRect().bottom;
    flushSync(() => setIsExpanded(false));
    if (card && bottomBefore !== undefined) {
      window.scrollBy(0, card.getBoundingClientRect().bottom - bottomBefore);
    }
  };

  return (
    <div className="mt-2 flex flex-col items-start">
      <p
        ref={textRef}
        className={classNames(
          'break-words text-text-secondary typo-callout',
          !isExpanded && 'line-clamp-3',
        )}
      >
        {summary}
      </p>
      {(isTruncated || isExpanded) && (
        <ClickableText
          type="button"
          aria-expanded={isExpanded}
          defaultTypo={false}
          className="relative z-1 mt-1 font-bold !text-text-link typo-footnote"
          onClick={toggle}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </ClickableText>
      )}
    </div>
  );
};
