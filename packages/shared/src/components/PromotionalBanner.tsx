import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from './buttons/Button';
import { isTesting } from '../lib/constants';
import type { Banner, BannerTheme } from '../graphql/banner';
import { BannerCustomTheme } from '../graphql/banner';
import { Theme } from './utilities';
import { useBanner } from '../hooks/useBanner';
import CloseButton from './CloseButton';
import { useLogContext } from '../contexts/LogContext';
import { LogEvent, TargetType } from '../lib/log';
import useLogEventOnce from '../hooks/log/useLogEventOnce';
import { useViewSize, ViewSize } from '../hooks/useViewSize';

type Ink = 'white' | 'pepper' | 'invert' | 'theme';

const inkClassNames: Record<Ink, string> = {
  white: 'text-white',
  pepper: 'text-raw-pepper-90',
  invert: 'text-surface-invert',
  theme: 'text-text-primary',
};

type ThemeStyle = { fill: string; ink: Ink; invertedCta?: boolean };

// The CTA is the theme's primary button; only the neutral fills that flip
// with the theme (white in dark mode, dark in light mode) invert it.
const stylesByTheme: Record<BannerTheme, ThemeStyle> = {
  [BannerCustomTheme.CabbageOnion]: {
    fill: 'from-accent-cabbage-subtler to-accent-onion-subtler bg-gradient-to-r',
    ink: 'invert',
  },
  [BannerCustomTheme.WhitePepper]: {
    fill: 'bg-surface-primary',
    ink: 'invert',
    invertedCta: true,
  },
  [Theme.Avocado]: { fill: 'bg-accent-avocado-default', ink: 'pepper' },
  [Theme.Bacon]: { fill: 'bg-accent-bacon-default', ink: 'pepper' },
  [Theme.BlueCheese]: { fill: 'bg-accent-blueCheese-default', ink: 'pepper' },
  [Theme.Bun]: { fill: 'bg-accent-bun-default', ink: 'pepper' },
  [Theme.Burger]: { fill: 'bg-accent-burger-default', ink: 'white' },
  [Theme.Cabbage]: { fill: 'bg-accent-cabbage-default', ink: 'invert' },
  [Theme.Cheese]: { fill: 'bg-accent-cheese-default', ink: 'pepper' },
  [Theme.Ketchup]: { fill: 'bg-accent-ketchup-default', ink: 'invert' },
  [Theme.Lettuce]: { fill: 'bg-accent-lettuce-default', ink: 'pepper' },
  [Theme.Onion]: { fill: 'bg-accent-onion-default', ink: 'white' },
  [Theme.Water]: { fill: 'bg-accent-water-default', ink: 'invert' },
  [Theme.Salt]: {
    fill: 'bg-accent-salt-default',
    ink: 'invert',
    invertedCta: true,
  },
  [Theme.Pepper]: { fill: 'bg-accent-pepper-default', ink: 'theme' },
  [Theme.Background]: { fill: 'bg-background-default', ink: 'theme' },
};

export type PromotionalBannerViewProps = {
  banner: Banner;
  onCtaClick?: () => void;
  onDismiss?: () => void;
  className?: string;
};

export function PromotionalBannerView({
  banner,
  onCtaClick,
  onDismiss,
  className,
}: PromotionalBannerViewProps): ReactElement {
  const { fill, ink, invertedCta } =
    stylesByTheme[banner.theme] ??
    stylesByTheme[BannerCustomTheme.CabbageOnion];
  const isLaptop = useViewSize(ViewSize.Laptop);
  const buttonSize = isLaptop ? ButtonSize.XSmall : ButtonSize.Small;

  return (
    <div
      className={classNames(
        'relative z-3 flex w-full flex-col items-start py-3 pl-3 pr-12 typo-footnote tablet:pl-20 laptop:fixed laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:px-10 laptop:py-0',
        fill,
        inkClassNames[ink],
        className,
      )}
    >
      <p className="laptop:min-w-0 laptop:shrink laptop:truncate">
        <strong>{banner.title}</strong> {banner.subtitle}
      </p>
      <Button
        tag="a"
        href={banner.url}
        size={buttonSize}
        variant={ButtonVariant.Primary}
        className={classNames(
          'mt-2 laptop:ml-4 laptop:mt-0',
          invertedCta && 'btn-primary-inverted',
        )}
        onClick={onCtaClick}
      >
        {banner.cta}
      </Button>
      <CloseButton
        size={buttonSize}
        className="btn-on-fill absolute right-2 top-1 laptop:inset-y-0 laptop:my-auto"
        onClick={onDismiss}
      />
    </div>
  );
}

export default function PromotionalBanner(): ReactElement {
  const { latestBanner: banner, dismiss } = useBanner();
  const { logEvent } = useLogContext();

  useLogEventOnce(
    () => ({
      event_name: LogEvent.Impression,
      target_type: TargetType.PromotionalBanner,
      target_id: banner?.timestamp,
    }),
    { condition: !isTesting && !!banner },
  );

  const onCtaClick = useCallback(() => {
    if (!banner) {
      return;
    }
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PromotionalBanner,
      target_id: banner.timestamp,
    });
  }, [banner, logEvent]);

  const onDismiss = useCallback(() => {
    if (banner) {
      logEvent({
        event_name: LogEvent.MarketingCtaDismiss,
        target_type: TargetType.PromotionalBanner,
        target_id: banner.timestamp,
      });
    }
    dismiss();
  }, [banner, dismiss, logEvent]);

  if (isTesting) {
    return <></>;
  }

  if (!banner) {
    return <></>;
  }

  return (
    <PromotionalBannerView
      banner={banner}
      onCtaClick={onCtaClick}
      onDismiss={onDismiss}
    />
  );
}
