import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../../buttons/ClickableText';

/**
 * Video TL;DR clamped to four lines with a "Show more" that expands it in
 * place, the way the list card's TLDR does.
 */
export const PostHybridVideoSummary = ({
  summary,
  trailing,
}: {
  summary: string;
  trailing?: ReactNode;
}): ReactElement => {
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

  return (
    <div className="flex flex-col items-start gap-1">
      <p
        ref={textRef}
        className={classNames(
          'select-text break-words text-text-secondary typo-markdown',
          !isExpanded && 'line-clamp-4',
        )}
        data-testid="tldr-container"
      >
        {summary}
        {!canExpand && trailing}
      </p>
      {canExpand && (
        <div className="flex items-center gap-1">
          <ClickableText
            type="button"
            className="!text-text-link"
            onClick={() => setIsExpanded(true)}
          >
            Show more
          </ClickableText>
          {trailing}
        </div>
      )}
    </div>
  );
};
