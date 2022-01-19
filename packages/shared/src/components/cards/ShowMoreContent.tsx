import React, { ReactElement, ReactNode, useState } from 'react';
import { ClickableText } from '../buttons/ClickableText';

interface ShowMoreContentProps {
  content: string;
  charactersLimit?: number;
  contentPrefix?: ReactNode;
  className?: string;
}

export default function ShowMoreContent({
  content,
  charactersLimit = 150,
  contentPrefix,
  className,
}: ShowMoreContentProps): ReactElement {
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const linkName = isTextExpanded ? 'Show less' : 'Show more';

  const toggleTextExpanded = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  const displayShowMoreLink = () => {
    if (content && content?.length > charactersLimit) {
      return true;
    }
    return false;
  };

  const getContent = () => {
    return isTextExpanded ? content : content?.slice(0, charactersLimit);
  };
  return (
    <div className={className}>
      <p className="typo-body">
        {contentPrefix}
        {getContent()}{' '}
        {displayShowMoreLink() && (
          <ClickableText
            className="inline-flex text-theme-label-link"
            onClick={toggleTextExpanded}
            tag="a"
          >
            {linkName}
          </ClickableText>
        )}
      </p>
    </div>
  );
}
