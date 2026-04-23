import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { getDailyQuote } from './zenQuotes';

export const ZenQuote = (): ReactElement => {
  const quote = useMemo(() => getDailyQuote(), []);

  return (
    <figure
      aria-label="Quote of the day"
      className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center"
    >
      <Typography
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="text-balance italic"
      >
        &ldquo;{quote.text}&rdquo;
      </Typography>
      <figcaption className="text-text-tertiary typo-footnote">
        &mdash; {quote.author}
      </figcaption>
    </figure>
  );
};
