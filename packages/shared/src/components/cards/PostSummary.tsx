import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  RefObject,
} from 'react';
import { SummaryContainer, TLDRText } from '../utilities';
import ShowMoreContent from './ShowMoreContent';

interface SummaryProps extends HTMLAttributes<HTMLDivElement> {
  summary: string;
}

function PostSummary(
  { summary, ...props }: SummaryProps,
  ref: RefObject<HTMLDivElement>,
): ReactElement {
  return (
    <SummaryContainer ref={ref} {...props}>
      <ShowMoreContent
        content={summary}
        charactersLimit={300}
        threshold={50}
        contentPrefix={<TLDRText>TLDR</TLDRText>}
      />
    </SummaryContainer>
  );
}

export default forwardRef(PostSummary);
