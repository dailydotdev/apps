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

  const getContent = () =>
    isTextExpanded ? content : content?.slice(0, charactersLimit);

  return (
    <div className={className}>
      <p className="typo-body">
        {contentPrefix}
        {getContent()}{' '}
        {displayShowMoreLink() && (
          <ClickableText
            className="inline-flex text-theme-label-link"
            onClick={toggleTextExpanded}
          >
            {linkName}
          </ClickableText>
        )}
      </p>
    </div>
  );
}
