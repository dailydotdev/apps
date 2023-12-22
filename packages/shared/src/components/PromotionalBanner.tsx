import React, { ReactElement } from 'react';
import classNames from 'classnames';
import XIcon from './icons/MiniClose';
import { Button, ButtonSize } from './buttons/Button';
import { isTesting } from '../lib/constants';
import { BannerCustomTheme, BannerTheme } from '../graphql/banner';
import { Theme } from './utilities';
import { useBanner } from '../hooks/useBanner';

const classNamesByTheme: Record<BannerTheme, string[]> = {
  [BannerCustomTheme.CabbageOnion]: [
    'from-theme-color-cabbage to-theme-color-onion bg-gradient-to-r',
    'text-white',
    'bg-white text-pepper-90',
  ],
  [BannerCustomTheme.WhitePepper]: [
    'bg-theme-bg-reverse',
    'text-theme-label-invert',
    'text-white btn-primary-cabbage',
  ],
  [Theme.Avocado]: [
    'bg-theme-color-avocado',
    'text-pepper-90',
    'bg-white text-pepper-90',
  ],
  [Theme.Bacon]: [
    'bg-theme-color-bacon',
    'text-white',
    'bg-white text-pepper-90',
  ],
  [Theme.BlueCheese]: [
    'bg-theme-color-blueCheese',
    'text-pepper-90',
    'bg-white text-pepper-90',
  ],
  [Theme.Bun]: ['bg-theme-color-bun', 'text-white', 'bg-white text-pepper-90'],
  [Theme.Burger]: [
    'bg-theme-color-burger',
    'text-white',
    'bg-white text-pepper-90',
  ],
  [Theme.Cabbage]: [
    'bg-theme-color-cabbage',
    'text-white',
    'bg-white text-pepper-90',
  ],
  [Theme.Cheese]: [
    'bg-theme-color-cheese',
    'text-pepper-90',
    'bg-white text-pepper-90',
  ],
  [Theme.Ketchup]: [
    'bg-theme-color-ketchup',
    'text-white',
    'bg-white text-pepper-90',
  ],
  [Theme.Lettuce]: [
    'bg-theme-color-lettuce',
    'text-pepper-90',
    'bg-white text-pepper-90',
  ],
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

  const [container, text, button] =
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
        buttonSize={ButtonSize.XSmall}
        className={classNames('mt-2 laptop:ml-4 laptop:mt-0', button)}
      >
        {banner.cta}
      </Button>
      <Button
        buttonSize={ButtonSize.XSmall}
        className="btn-tertiary right-2 top-2 laptop:inset-y-0 laptop:my-auto"
        style={{ position: 'absolute' }}
        icon={<XIcon />}
        onClick={dismiss}
      />
    </div>
  );
}
