import React, { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from './buttons/Button';
import { isTesting } from '../lib/constants';
import { BannerCustomTheme, BannerTheme } from '../graphql/banner';
import { Theme } from './utilities';
import { useBanner } from '../hooks/useBanner';
import CloseButton from './CloseButton';

const classNamesByTheme: Record<BannerTheme, string[]> = {
  [BannerCustomTheme.CabbageOnion]: [
    'from-theme-color-cabbage to-theme-color-onion bg-gradient-to-r',
    'text-white',
  ],
  [BannerCustomTheme.WhitePepper]: [
    'bg-surface-primary',
    'text-surface-invert',
  ],
  [Theme.Avocado]: ['bg-theme-color-avocado', 'text-raw-pepper-90'],
  [Theme.Bacon]: ['bg-theme-color-bacon', 'text-white'],
  [Theme.BlueCheese]: ['bg-theme-color-blueCheese', 'text-raw-pepper-90'],
  [Theme.Bun]: ['bg-theme-color-bun', 'text-white'],
  [Theme.Burger]: ['bg-theme-color-burger', 'text-white'],
  [Theme.Cabbage]: ['bg-theme-color-cabbage', 'text-white'],
  [Theme.Cheese]: ['bg-theme-color-cheese', 'text-raw-pepper-90'],
  [Theme.Ketchup]: ['bg-theme-color-ketchup', 'text-white'],
  [Theme.Lettuce]: ['bg-theme-color-lettuce', 'text-raw-pepper-90'],
};

export default function PromotionalBanner(): ReactElement {
  const { latestBanner: banner, dismiss } = useBanner();

  // Disable this component in Jest environment
  if (isTesting) {
    return <></>;
  }

  if (!banner) {
    return <></>;
  }

  const [container, text] =
    classNamesByTheme[banner.theme] ??
    classNamesByTheme[BannerCustomTheme.CabbageOnion];

  return (
    <div
      className={classNames(
        'relative z-3 flex w-full flex-col items-start py-3 pl-3 pr-12 typo-footnote laptop:fixed laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0',
        container,
        text,
      )}
    >
      <div>
        <strong>{banner.title}</strong>
        <span className="ml-0.5">{banner.subtitle}</span>
      </div>
      <Button
        tag="a"
        href={banner.url}
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Primary}
        color={
          banner.theme === BannerCustomTheme.WhitePepper
            ? ButtonColor.Cabbage
            : undefined
        }
        className="mt-2 laptop:ml-4 laptop:mt-0"
      >
        {banner.cta}
      </Button>
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2 laptop:inset-y-0 laptop:my-auto"
        onClick={dismiss}
      />
    </div>
  );
}
