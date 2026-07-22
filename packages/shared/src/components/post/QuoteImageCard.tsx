import type { ReactElement } from 'react';
import React from 'react';
import LogoIcon from '../../svg/LogoIcon';
import LogoText from '../../svg/LogoText';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

export interface QuoteImageCardProps {
  quote: string;
  title: string;
  sourceName?: string | null;
  authorName?: string | null;
}

/**
 * The 1200x630 quote card the screenshot service renders into a shareable
 * image. Sized in fixed pixels because the output is a bitmap, not a
 * responsive page.
 */
export const QuoteImageCard = ({
  quote,
  title,
  sourceName,
  authorName,
}: QuoteImageCardProps): ReactElement => {
  const attribution = [authorName, sourceName].filter(Boolean).join(' · ');

  return (
    <div
      className="flex h-[630px] w-[1200px] flex-col justify-between bg-background-default p-16"
      data-testid="quoteImageCard"
    >
      <Typography
        aria-hidden
        bold
        color={TypographyColor.Quaternary}
        tag={TypographyTag.Span}
        type={TypographyType.Tera}
        className="h-16 leading-none"
      >
        “
      </Typography>
      <Typography
        bold
        tag={TypographyTag.P}
        type={TypographyType.Mega1}
        className="line-clamp-6 break-words"
      >
        {quote}
      </Typography>
      <div className="flex items-end justify-between gap-8">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography
            bold
            color={TypographyColor.Secondary}
            className="line-clamp-1"
            type={TypographyType.Title2}
          >
            {title}
          </Typography>
          {!!attribution && (
            <Typography
              color={TypographyColor.Tertiary}
              type={TypographyType.Title3}
            >
              {attribution}
            </Typography>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LogoIcon className={{ container: 'h-10' }} />
          <LogoText className={{ container: 'h-10' }} />
        </div>
      </div>
    </div>
  );
};
