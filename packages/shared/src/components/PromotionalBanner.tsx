import React, { ReactElement } from 'react';
import classNames from 'classnames';
import XIcon from './icons/Close';
import { Button } from './buttons/Button';
import { isTesting } from '../lib/constants';
import { BannerCustomTheme, BannerData, BannerTheme } from '../graphql/banner';
import { Theme } from './utilities';

interface PromotionalBannerProps {
  bannerData: BannerData;
  setLastSeen: (value: Date) => Promise<void>;
}

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

export default function PromotionalBanner({
  bannerData,
  setLastSeen,
}: PromotionalBannerProps): ReactElement {
  // Disable this component in Jest environment
  if (isTesting) {
    return <></>;
  }

  if (!bannerData?.banner) {
    return <></>;
  }

  const { banner } = bannerData;
  const [container, text, button] =
    classNamesByTheme[banner.theme] ??
    classNamesByTheme[BannerCustomTheme.CabbageOnion];
  return (
    <div
      className={classNames(
        'relative z-3 laptop:fixed flex flex-col items-start py-3 pl-3 pr-12 typo-footnote laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0 w-full',
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
        buttonSize="xsmall"
        className={classNames('mt-2 laptop:ml-4 laptop:mt-0', button)}
      >
        {banner.cta}
      </Button>
      <Button
        buttonSize="xsmall"
        className="laptop:inset-y-0 top-2 right-2 laptop:my-auto btn-tertiary"
        style={{ position: 'absolute' }}
        icon={<XIcon />}
        onClick={() =>
          setLastSeen(new Date(new Date(banner.timestamp).getTime() + 60_000))
        }
      />
    </div>
  );
}
