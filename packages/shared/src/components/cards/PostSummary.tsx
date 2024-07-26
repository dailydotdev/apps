import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  RefObject,
} from 'react';
import classNames from 'classnames';
import { SummaryContainer, TLDRText } from '../utilities';
import ShowMoreContent from './ShowMoreContent';
import { PostSummaryButton } from '../post/PostSummaryButton';

interface SummaryProps extends HTMLAttributes<HTMLDivElement> {
  summary: string;
}

function PostSummary(
  { summary, ...props }: SummaryProps,
  ref: RefObject<HTMLDivElement>,
): ReactElement {
  return (
    <SummaryContainer
      ref={ref}
      {...props}
      className={classNames('relative', props.className)}
    >
      <PostSummaryButton summary={summary} />
      <ShowMoreContent
        className="overflow-hidden"
        content={summary}
        charactersLimit={330}
        threshold={50}
        contentPrefix={<TLDRText>TLDR</TLDRText>}
      />
    </SummaryContainer>
  );
}

export default forwardRef(PostSummary);
