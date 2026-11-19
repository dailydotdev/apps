import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import CloseButton from '../CloseButton';
import { ButtonSize } from '../buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import {
  plusBlackFridayAccent,
  plusBlackFridayBannerBg,
  plusBlackFridayBannerGlow,
  plusBlackFridayBannerScrim,
  plusSaleBannerBg,
  plusSaleBannerGlow,
  plusSaleBannerScrim,
  plusSaleMarkColor,
} from '../../styles/custom';
import { DevPlusIcon } from '../icons/DevPlus';
import { usePlusSale } from '../../hooks/usePlusSale';
import type { WithClassNameProps } from '../utilities/common';

const blackFridayStyle = {
  background: plusBlackFridayBannerBg,
  glow: plusBlackFridayBannerGlow,
  scrim: plusBlackFridayBannerScrim,
};

const summerStyle = {
  background: plusSaleBannerBg,
  glow: plusSaleBannerGlow,
  scrim: plusSaleBannerScrim,
};

export function PlusSaleBanner({
  className,
}: WithClassNameProps): ReactElement | null {
  const { isActive, headline, description, code, label, theme } = usePlusSale();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isActive || isDismissed) {
    return null;
  }

  const isBlackFriday = theme === 'blackFriday';
  const style = isBlackFriday ? blackFridayStyle : summerStyle;

  return (
    <section
      className={classNames(
        'relative isolate w-full overflow-hidden rounded-16 px-5 py-4 tablet:px-8 tablet:py-6',
        isBlackFriday && 'border border-border-subtlest-tertiary',
        className,
      )}
      style={{ background: style.background }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1"
        style={{ background: style.glow }}
      />
      <DevPlusIcon
        aria-hidden
        secondary
        className="opacity-80 absolute -bottom-12 -right-8 -z-1 hidden !size-52 rotate-12 mobileL:block"
        style={{ color: plusSaleMarkColor }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1"
        style={{ background: style.scrim }}
      />

      <div className="flex items-center gap-6">
        {/* pr-8 keeps the headline clear of the close button. */}
        <div className="flex max-w-[34rem] flex-1 flex-col gap-2 pr-8">
          {isBlackFriday && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              className="uppercase tracking-widest"
              style={{ color: plusBlackFridayAccent }}
              bold
            >
              Black Friday
            </Typography>
          )}
          <Typography
            tag={TypographyTag.H2}
            type={TypographyType.Title2}
            color={TypographyColor.Primary}
            bold
          >
            {headline}
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Primary}
          >
            {description}
          </Typography>
          {!!code && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Footnote}
              color={TypographyColor.Primary}
              className="mt-1 w-fit rounded-8 border border-dashed border-border-subtlest-primary px-3 py-1 tracking-widest"
              bold
            >
              {code}
            </Typography>
          )}
        </div>
        {isBlackFriday && (
          <Typography
            aria-hidden
            tag={TypographyTag.Span}
            type={TypographyType.LargeTitle}
            className="ml-auto hidden whitespace-nowrap pr-16 uppercase tablet:block"
            style={{ color: plusBlackFridayAccent }}
            bold
          >
            {label}
          </Typography>
        )}
      </div>

      <CloseButton
        className="absolute right-3 top-3 z-1"
        size={ButtonSize.Small}
        onClick={() => setIsDismissed(true)}
        type="button"
      />
    </section>
  );
}
