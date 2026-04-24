import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import type { TagBrandingStyle } from '../../lib/brand';
import { Tooltip } from '../tooltip/Tooltip';
import { SponsoredTooltip } from './SponsoredTooltip';
import styles from './BrandedTag.module.css';

interface BrandedTagProps {
  tag: string;
  className?: string;
  onClick?: () => void;
  /** Render as span instead of button (for use inside links) */
  asSpan?: boolean;
  /** Force disable branding even if tag is sponsored */
  disableBranding?: boolean;
}

/**
 * BrandedTag Component
 *
 * Renders a tag with optional brand sponsorship animation.
 * When a tag is sponsored, it animates to show the brand association.
 *
 * Animation styles:
 * - 'suffix': "ai" -> "ai - powered by Copilot"
 * - 'replace': "ai" -> "Copilot"
 * - 'arrow': "ai" -> "Copilot →"
 */
export const BrandedTag = ({
  tag,
  className,
  onClick,
  asSpan = false,
  disableBranding = false,
}: BrandedTagProps): ReactElement => {
  const { getSponsoredTag, getHighlightedWordConfig } = useBrandSponsorship();
  const rawSponsorInfo = getSponsoredTag(tag);
  // Allow disabling branding externally (e.g., to limit to one sponsored tag per list)
  const sponsorInfo = disableBranding
    ? { ...rawSponsorInfo, isSponsored: false }
    : rawSponsorInfo;
  const isAnimated = sponsorInfo.isSponsored && !!sponsorInfo.branding;
  const showBranding = isAnimated;

  const getBrandedContent = (style: TagBrandingStyle): string => {
    if (!sponsorInfo.brandName) {
      return `#${tag}`;
    }

    switch (style) {
      case 'suffix':
        return `#${tag} - powered by ${sponsorInfo.brandName}`;
      case 'replace':
        return `#${sponsorInfo.brandName}`;
      case 'arrow':
        return `${sponsorInfo.brandName} →`;
      default:
        return `#${tag}`;
    }
  };

  const handleClick = (e: React.MouseEvent): void => {
    // When used as a span inside a link (asSpan=true), don't intercept - let the parent link handle navigation
    // For standalone buttons with branding shown, open brand URL in new tab
    if (!asSpan && sponsorInfo.targetUrl && showBranding) {
      e.preventDefault();
      e.stopPropagation();
      window.open(sponsorInfo.targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    onClick?.();
  };

  const baseClassName = classNames(
    'flex h-6 items-center justify-center rounded-8 border border-border-subtlest-tertiary px-2 text-text-quaternary typo-footnote',
    className,
  );

  const sponsoredClassName = classNames(
    styles.brandedTag,
    'relative flex h-6 items-center overflow-hidden rounded-8 border px-2 typo-footnote',
    {
      'border-border-subtlest-tertiary text-text-quaternary': !isAnimated,
      [styles.animated]: isAnimated,
    },
    className,
  );

  const sponsoredStyle =
    isAnimated && sponsorInfo.colors
      ? ({
          borderColor: sponsorInfo.colors.primary,
          background: `linear-gradient(135deg, ${sponsorInfo.colors.primary}15 0%, ${sponsorInfo.colors.secondary}15 100%)`,
          '--brand-primary': sponsorInfo.colors.primary,
        } as React.CSSProperties)
      : undefined;

  const brandedText = sponsorInfo.branding
    ? getBrandedContent(sponsorInfo.branding.style)
    : '';

  const content = (
    <>
      {/* Original tag — hidden when branded */}
      {!showBranding && (
        <span className={classNames(styles.tagContent, 'whitespace-nowrap')}>
          #{tag}
        </span>
      )}

      {/* Branded content with logo and styled text */}
      {showBranding && sponsorInfo.branding && (
        <span
          className={classNames(
            styles.brandedContent,
            styles.fadeIn,
            'flex items-center justify-center gap-1.5 whitespace-nowrap text-text-tertiary',
          )}
        >
          {sponsorInfo.branding.showLogo !== false && sponsorInfo.brandLogo && (
            <img
              src={sponsorInfo.brandLogo}
              alt={sponsorInfo.brandName || ''}
              className={classNames(styles.brandLogo, 'size-3.5 rounded-full')}
            />
          )}
          <span className={styles.brandText}>{brandedText}</span>
        </span>
      )}
    </>
  );

  // Get tooltip config for sponsored tags
  const highlightedWordResult = getHighlightedWordConfig([tag]);
  const showTooltip =
    showBranding &&
    sponsorInfo.isSponsored &&
    highlightedWordResult.config &&
    sponsorInfo.brandName;

  const tooltipContent = showTooltip ? (
    <SponsoredTooltip
      config={highlightedWordResult.config}
      brandName={sponsorInfo.brandName}
      brandLogo={sponsorInfo.brandLogo}
      colors={sponsorInfo.colors}
    />
  ) : null;

  // Render as span for use inside links
  if (asSpan) {
    const spanElement = (
      <span
        role="presentation"
        onClick={handleClick}
        className={sponsorInfo.isSponsored ? sponsoredClassName : baseClassName}
        style={sponsorInfo.isSponsored ? sponsoredStyle : undefined}
      >
        {content}
      </span>
    );

    if (showTooltip) {
      return (
        <Tooltip
          content={tooltipContent}
          side="bottom"
          noArrow
          className="!max-w-none !rounded-16 !bg-transparent !p-0"
        >
          {spanElement}
        </Tooltip>
      );
    }

    return spanElement;
  }

  // Render as button for standalone use
  const buttonElement = (
    <button
      type="button"
      onClick={handleClick}
      className={sponsorInfo.isSponsored ? sponsoredClassName : baseClassName}
      style={sponsorInfo.isSponsored ? sponsoredStyle : undefined}
    >
      {content}
    </button>
  );

  if (showTooltip) {
    return (
      <Tooltip
        content={tooltipContent}
        side="bottom"
        noArrow
        className="!max-w-none !rounded-16 !bg-transparent !p-0"
      >
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};
