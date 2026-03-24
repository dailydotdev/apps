import type { HTMLAttributes } from 'react';
import React, { forwardRef } from 'react';
import { SummaryContainer, TLDRText } from '../../utilities';
import ShowMoreContent from './ShowMoreContent';

interface SummaryProps extends HTMLAttributes<HTMLDivElement> {
  summary: string;
}

const PostSummary: React.ForwardRefRenderFunction<
  HTMLDivElement,
  SummaryProps
> = ({ summary, ...props }, ref) => {
  return (
    <SummaryContainer ref={ref} {...props}>
      <ShowMoreContent
        className={{ wrapper: 'overflow-hidden' }}
        content={summary}
        charactersLimit={330}
        threshold={50}
        contentPrefix={<TLDRText>TLDR</TLDRText>}
      />
    </SummaryContainer>
  );
};

export default forwardRef(PostSummary);
