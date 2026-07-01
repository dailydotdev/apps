import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import CloseButton from '../CloseButton';
import { ButtonSize } from '../buttons/Button';
import { EngagementAdCta } from './EngagementAdCta';
import type { ResolvedCreative } from '../../lib/engagementAds';

// Append an 8-digit-hex alpha to a #rrggbb brand color so the banner's
// background wash and hairline stay subtle. Returns the color unchanged if it
// isn't a 6-digit hex (e.g. an advertiser supplied rgb()/named color), so we
// never produce an invalid value.
const hexWithAlpha = (color: string, alphaHex: string): string =>
  /^#[0-9a-fA-F]{6}$/.test(color) ? `${color}${alphaHex}` : color;

type EngagementBannerProps = {
  creative: ResolvedCreative;
  className?: string;
  onDismiss?: () => void;
};

// Compact, single-row product announcement bar driven by an engagement
// creative that opted into the top-banner placement: brand logo + inline
// message, brand CTA, dismissible via the shared CloseButton. The background is
// a subtle wash derived from the campaign's two brand colors over the app's
// subtle surface.
export const EngagementBanner = ({
  creative,
  className,
  onDismiss,
}: EngagementBannerProps): ReactElement | null => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const { name, body, cta, url, logo, primaryColor, secondaryColor } = creative;

  return (
    <div
      className={classNames(
        'flex w-full items-center gap-3 overflow-hidden rounded-12 px-3 py-2',
        className,
      )}
      style={{
        background: `linear-gradient(90deg, ${hexWithAlpha(
          primaryColor,
          '29',
        )} 0%, ${hexWithAlpha(
          secondaryColor,
          '29',
        )} 100%), var(--theme-background-subtle)`,
        border: `1px solid ${hexWithAlpha(primaryColor, '52')}`,
      }}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-8 bg-background-default">
        <img src={logo} alt={name} className="size-5 object-contain" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col tablet:flex-row tablet:items-center tablet:gap-2">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Primary}
          bold
          className="whitespace-nowrap"
        >
          {name}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
          className="min-w-0 truncate"
        >
          {body}
        </Typography>
      </div>
      <EngagementAdCta
        href={url}
        brandColor={primaryColor}
        className="shrink-0 !px-4 !py-1.5 typo-footnote"
      >
        {cta}
      </EngagementAdCta>
      <CloseButton
        size={ButtonSize.Small}
        className="shrink-0"
        onClick={() => {
          setDismissed(true);
          onDismiss?.();
        }}
      />
    </div>
  );
};
