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
    'from-accent-cabbage-default to-accent-onion-default bg-gradient-to-r',
    'text-white',
  ],
  [BannerCustomTheme.WhitePepper]: [
    'bg-surface-primary',
    'text-surface-invert',
  ],
  [Theme.Avocado]: ['bg-accent-avocado-default', 'text-raw-pepper-90'],
  [Theme.Bacon]: ['bg-accent-bacon-default', 'text-white'],
  [Theme.BlueCheese]: ['bg-accent-blueCheese-default', 'text-raw-pepper-90'],
  [Theme.Bun]: ['bg-accent-bun-default', 'text-white'],
  [Theme.Burger]: ['bg-accent-burger-default', 'text-white'],
  [Theme.Cabbage]: ['bg-accent-cabbage-default', 'text-white'],
  [Theme.Cheese]: ['bg-accent-cheese-default', 'text-raw-pepper-90'],
  [Theme.Ketchup]: ['bg-accent-ketchup-default', 'text-white'],
  [Theme.Lettuce]: ['bg-accent-lettuce-default', 'text-raw-pepper-90'],
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
        'relative z-3 flex w-full flex-col items-start py-3 pl-3 pr-12 typo-footnote tablet:pl-20 laptop:fixed laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0',
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
