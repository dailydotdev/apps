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
import { fallbackImages } from '../../lib/config';

export interface QuoteImageCardProps {
  quote: string;
  title: string;
  sourceName?: string | null;
  authorName?: string | null;
  /** Avatar of the post author, badged with the source below. */
  authorImage?: string | null;
  /** Source (publication or squad) logo. */
  sourceImage?: string | null;
}

/**
 * Author avatar with the source badged on its corner, falling back to whichever
 * one exists. Shapes follow the app: users are rounded squares (`ProfilePicture`
 * radii) and sources are circles (`SourceAvatar`). Sized against the attribution
 * text beside it rather than the card, so it reads as part of that strip.
 *
 * Plain `<img>` on purpose: the screenshot service renders this page once and
 * captures it, so there is nothing for lazy loading to defer to.
 */
const Attribution = ({
  authorImage,
  authorName,
  sourceImage,
  sourceName,
}: Pick<
  QuoteImageCardProps,
  'authorImage' | 'authorName' | 'sourceImage' | 'sourceName'
>): ReactElement | null => {
  const avatar = authorName ? authorImage ?? fallbackImages.avatar : null;

  if (!avatar && !sourceImage) {
    return null;
  }

  if (!avatar) {
    return (
      <img
        alt={sourceName ?? ''}
        className="size-14 shrink-0 rounded-full bg-surface-float object-cover"
        src={sourceImage}
      />
    );
  }

  return (
    <div className="relative size-14 shrink-0">
      <img
        alt={authorName ?? ''}
        className="size-14 rounded-16 bg-surface-float object-cover"
        src={avatar}
      />
      {!!sourceImage && (
        <img
          alt={sourceName ?? ''}
          className="absolute -bottom-1.5 -right-1.5 size-7 rounded-full border-4 border-background-default bg-surface-float object-cover"
          src={sourceImage}
        />
      )}
    </div>
  );
};

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
  authorImage,
  sourceImage,
}: QuoteImageCardProps): ReactElement => {
  const attribution = [authorName, sourceName].filter(Boolean).join(' · ');

  return (
    <div
      className="flex h-[630px] w-[1200px] flex-col justify-between bg-background-default p-16"
      data-testid="quoteImageCard"
    >
      {/* Brand resolves to the cabbage accent — the lavender purple. */}
      <Typography
        aria-hidden
        bold
        color={TypographyColor.Brand}
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
        <div className="flex min-w-0 items-center gap-6">
          <Attribution
            authorImage={authorImage}
            authorName={authorName}
            sourceImage={sourceImage}
            sourceName={sourceName}
          />
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
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LogoIcon className={{ container: 'h-10' }} />
          <LogoText className={{ container: 'h-10' }} />
        </div>
      </div>
    </div>
  );
};
