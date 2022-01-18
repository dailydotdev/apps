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
    if (content?.length > 300) {
      return linkName;
    }
    return '';
  };

  const getSlicedContent = () => {
    return content?.slice(0, charactersLimit);
  };
  return (
    <div className={className}>
      <p className="typo-callout">
        {contentPrefix}
        {isTextExpanded ? content : getSlicedContent()}
        &nbsp;
        <ClickableText
          className="text-theme-label-link"
          flexRowApplied={false}
          underlined={false}
          onClick={toggleTextExpanded}
        >
          {displayShowMoreLink()}
        </ClickableText>
      </p>
    </div>
  );
}
