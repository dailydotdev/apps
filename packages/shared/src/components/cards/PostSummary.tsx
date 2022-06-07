import React, { ReactElement } from 'react';
import { SummaryContainer, TLDRText } from '../utilities';
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
        threshold={50}
        contentPrefix={<TLDRText>TLDR</TLDRText>}
      />
    </SummaryContainer>
  );
}
