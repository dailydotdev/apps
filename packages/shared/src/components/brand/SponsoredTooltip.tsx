import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { BrandColors, HighlightedWordConfig } from '../../lib/brand';
import { ButtonV2, ButtonSize, ButtonVariant } from '../buttons/ButtonV2';

interface SponsoredTooltipProps {
  config: HighlightedWordConfig;
  brandName: string;
  brandLogo: string | null;
  colors: BrandColors | null;
  className?: string;
}

/**
 * SponsoredTooltip Component
 *
 * A beautiful tooltip content for highlighted words showing brand info and CTA.
 * Features gradient background based on brand colors and a prominent CTA button.
 */
export const SponsoredTooltip = ({
  config,
  brandName,
  brandLogo,
  className,
}: SponsoredTooltipProps): ReactElement => {
  const handleCtaClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    if (config.ctaUrl) {
      window.open(config.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={classNames(
        'flex w-72 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2',
        className,
      )}
    >
      {/* Header with logo and brand name */}
      <div className="flex items-center gap-2.5">
        {brandLogo && (
          <img
            src={brandLogo}
            alt={brandName}
            className="size-8 rounded-full bg-surface-float object-cover p-0.5"
          />
        )}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-text-quaternary">
            Sponsored by
          </span>
          <span className="font-bold text-text-primary">
            {config.tooltipTitle}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed text-text-secondary">
        {config.tooltipDescription}
      </p>

      {/* CTA ButtonV2 */}
      {config.ctaText && config.ctaUrl && (
        <ButtonV2
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={handleCtaClick}
          className="mt-1 w-full"
        >
          {config.ctaText}
        </ButtonV2>
      )}
    </div>
  );
};
