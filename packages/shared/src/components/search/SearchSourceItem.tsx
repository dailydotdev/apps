import React, { ReactElement } from 'react';
import { ClickableText } from '../buttons/ClickableText';

export const SourceItem = (): ReactElement => (
  <div className="w-60 laptop:w-full">
    <ClickableText
      tag="a"
      target="_blank"
      href="#"
      className="mb-2 typo-callout"
    >
      Understanding the LLaMa model and paper- mercurylabs.io
    </ClickableText>
    <p className="line-clamp-4 typo-footnote text-theme-label-tertiary multi-truncate">
      When sampling the LLaMA model, it is important to note that LLaMA, unlike
      popular models like ChatGPT, was not optimized or fine-tuned for some more
      text that will get cut off automatically
    </p>
  </div>
);
