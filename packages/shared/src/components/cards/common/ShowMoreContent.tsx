import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../../buttons/ClickableText';
import { useToggle } from '../../../hooks/useToggle';

export interface ShowMoreContentProps {
  content: string;
  charactersLimit?: number;
  threshold?: number;
  contentPrefix?: ReactNode;
  className?: {
    wrapper?: string;
    text?: string;
  };
}

const getSlicedContent = (content: string, charactersLimit: number): string => {
  if (!content || content.length <= charactersLimit) {
    return content;
  }

  const trimmed = content.slice(0, charactersLimit);
  const lastSpaceIndex = trimmed.lastIndexOf(' ');

  return lastSpaceIndex > 0 ? trimmed.slice(0, lastSpaceIndex) : trimmed;
};

export default function ShowMoreContent({
  content,
  charactersLimit = 150,
  threshold = 50,
  contentPrefix,
  className,
}: ShowMoreContentProps): ReactElement {
  const [isTextExpanded, toggleTextExpanded] = useToggle(false);
  const showMore = {
    isVisible: (content?.length ?? 0) > charactersLimit + threshold,
    text: isTextExpanded ? 'Show less' : 'Show more',
  };
  const shownContent = useMemo(() => {
    const text =
      isTextExpanded || !showMore.isVisible
        ? content
        : getSlicedContent(content, charactersLimit);
    return `${text} `;
  }, [isTextExpanded, showMore.isVisible, content, charactersLimit]);

  return (
    <div className={className?.wrapper}>
      <p
        className={classNames(
          'typo-markdown select-text break-words',
          className?.text,
        )}
        data-testid="tldr-container"
      >
        {contentPrefix}
        {shownContent}
        {showMore.isVisible && (
          <ClickableText
            className="!text-text-link inline-flex"
            onClick={() => toggleTextExpanded()}
          >
            {showMore.text}
          </ClickableText>
        )}
      </p>
    </div>
  );
}
