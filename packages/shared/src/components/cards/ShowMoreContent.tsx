import React, { ReactElement, ReactNode, useState } from 'react';
import { ClickableText } from '../buttons/ClickableText';

interface ShowMoreContentProps {
  content: string;
  charactersLimit?: number;
  threshold?: number;
  contentPrefix?: ReactNode;
  className?: string;
}

export default function ShowMoreContent({
  content,
  charactersLimit = 150,
  threshold = 50,
  contentPrefix,
  className,
}: ShowMoreContentProps): ReactElement {
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const linkName = isTextExpanded ? 'Show less' : 'Show more';

  const toggleTextExpanded = () => setIsTextExpanded(!isTextExpanded);

  const displayShowMoreLink = () =>
    content && content?.length > charactersLimit + threshold;

  const getSlicedContent = () => {
    const trimmedContent = content?.slice(0, charactersLimit);
    return trimmedContent.slice(
      0,
      Math.min(trimmedContent.length, trimmedContent.lastIndexOf(' ')),
    );
  };

  const getContent = () =>
    isTextExpanded || !displayShowMoreLink() ? content : getSlicedContent();

  return (
    <div className={className}>
      <p className="select-text break-words typo-body">
        {contentPrefix}
        {getContent()}{' '}
        {displayShowMoreLink() && (
          <ClickableText
            className="inline-flex !text-text-link"
            onClick={toggleTextExpanded}
          >
            {linkName}
          </ClickableText>
        )}
      </p>
    </div>
  );
}
