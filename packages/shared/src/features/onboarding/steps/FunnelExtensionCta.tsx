import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { FunnelStepExtensionCta } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useOnboardingExtension } from '../../../components/onboarding/Extension/useOnboardingExtension';
import { BrowserName } from '../../../lib/func';
import { cloudinaryOnboardingExtension } from '../../../lib/image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { Button, ButtonVariant } from '../../../components/buttons/Button';
import { ButtonSize } from '../../../components/buttons/common';
import { downloadBrowserExtension } from '../../../lib/constants';
import { ChromeIcon, EdgeIcon, LockIcon } from '../../../components/icons';
import { anchorDefaultRel } from '../../../lib/strings';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { IconSize } from '../../../components/Icon';

function AnimatedCounter({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}): ReactElement {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = target / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function ExtensionCtaComponent({
  onTransition,
}: FunnelStepExtensionCta): ReactElement {
  const { browserName } = useOnboardingExtension();
  const isEdge = browserName === BrowserName.Edge;
  const imageUrls =
    cloudinaryOnboardingExtension[browserName] ??
    cloudinaryOnboardingExtension[BrowserName.Chrome];

  return (
    <div className="mt-10 flex flex-1 flex-col items-center laptop:justify-between">
      <div className="flex flex-col items-center gap-6 text-center">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
        >
          Open this every time you open a new tab
        </Typography>

        {/* Trust anchor */}
        <div className="flex items-center gap-2 rounded-12 bg-surface-float px-4 py-2">
          <LockIcon size={IconSize.Small} className="text-status-success" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            This only controls your new tab. It doesn&apos;t run on any other
            website.
          </Typography>
        </div>

        {/* Extension screenshot with floating animation */}
        <figure className="pointer-events-none mx-auto w-full animate-float laptopL:w-2/3">
          <img
            alt="daily.dev browser extension screenshot"
            className="w-full rounded-16 shadow-2"
            loading="lazy"
            role="presentation"
            src={imageUrls.default}
            srcSet={`${imageUrls.default} 820w, ${imageUrls.retina} 1640w`}
          />
        </figure>

        {/* CTA */}
        <Button
          href={downloadBrowserExtension}
          icon={isEdge ? <EdgeIcon aria-hidden /> : <ChromeIcon aria-hidden />}
          onClick={() => {
            onTransition({
              type: FunnelStepTransitionType.Complete,
              details: { browserName },
            });
          }}
          rel={anchorDefaultRel}
          size={ButtonSize.XLarge}
          tag="a"
          target="_blank"
          variant={ButtonVariant.Primary}
        >
          Add to {isEdge ? 'Edge' : 'Chrome'}
        </Button>

        {/* Skip link */}
        <button
          type="button"
          className="text-text-quaternary transition-colors typo-callout hover:text-text-tertiary"
          onClick={() =>
            onTransition({ type: FunnelStepTransitionType.Complete })
          }
        >
          Continue without extension &rarr;
        </button>

        {/* Social proof */}
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Quaternary}
          className="pb-6"
        >
          Trusted by{' '}
          <span className="font-bold text-text-secondary">
            <AnimatedCounter target={1000000} suffix="+" />
          </span>{' '}
          developers
        </Typography>
      </div>
    </div>
  );
}

export const FunnelExtensionCta = withIsActiveGuard(ExtensionCtaComponent);
