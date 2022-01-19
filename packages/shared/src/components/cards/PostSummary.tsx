import React, { ReactElement } from 'react';
import { SummaryContainer } from '../utilities';
import ShowMoreContent from './ShowMoreContent';

interface SummaryProps {
  summary: string;
}

export default function PostSummary({ summary }: SummaryProps): ReactElement {
  return (
    <SummaryContainer>
      <ShowMoreContent
        content={summary}
        charactersLimit={300}
        contentPrefix={
          <span className="pr-1 typo-headline text-theme-status-cabbage">
            TLDR
          </span>
        }
      />
    </SummaryContainer>
  );
}
