import React, { ReactElement, ReactNode, useState } from 'react';
import { ClickableText } from '../buttons/ClickableText';

interface ShowMoreContentProps {
  content: string;
  charactersLimit?: number;
}

export default function ShowMoreContent({
  content,
  charactersLimit = 150
}: ShowMoreContentProps): ReactElement {
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const linkName = isTextExpanded ? 'Show less' : 'Show more';

  const toggleTextExpanded = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  const getSlicedContent = () => {
      return content?.slice(0, charactersLimit);
  }
  return (
    <div>
      {isTextExpanded ? content : getSlicedContent()}
      <ClickableText className="pl-2 text-theme-label-link" flexRowApplied={false} underlined={false} onClick={toggleTextExpanded}>
        {linkName}
      </ClickableText>
    </div>
  );
}
