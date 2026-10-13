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
  plusSaleBannerBg,
  plusSaleBannerGlow,
  plusSaleBannerScrim,
  plusSaleMarkColor,
} from '../../styles/custom';
import { DevPlusIcon } from '../icons/DevPlus';
import { usePlusSale } from '../../hooks/usePlusSale';
import type { WithClassNameProps } from '../utilities/common';

export function PlusSummerSaleBanner({
  className,
}: WithClassNameProps): ReactElement | null {
  const { isActive, headline, description, code } = usePlusSale();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isActive || isDismissed) {
    return null;
  }

  return (
    <section
      className={classNames(
        'relative isolate w-full overflow-hidden rounded-16 px-5 py-4 tablet:px-8 tablet:py-6',
        className,
      )}
      style={{ background: plusSaleBannerBg }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1"
        style={{ background: plusSaleBannerGlow }}
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
        style={{ background: plusSaleBannerScrim }}
      />

      {/* pr-8 keeps the headline clear of the close button. */}
      <div className="flex max-w-[34rem] flex-col gap-2 pr-8">
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

      <CloseButton
        className="absolute right-3 top-3 z-1"
        size={ButtonSize.Small}
        onClick={() => setIsDismissed(true)}
        type="button"
      />
    </section>
  );
}
