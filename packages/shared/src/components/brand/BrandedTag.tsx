import type { ReactElement } from 'react';
import React, { useState, useEffect, useRef } from 'react';
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
  const [isAnimated, setIsAnimated] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sponsorInfo.isSponsored && sponsorInfo.branding) {
      // Start animation after the configured delay
      timeoutRef.current = setTimeout(() => {
        setIsAnimated(true);
        // Small delay before showing new content for smoother transition
        setTimeout(() => {
          setShowBranding(true);
        }, 150);
      }, sponsorInfo.branding.delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sponsorInfo.isSponsored, sponsorInfo.branding]);

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
    'rounded-8 border border-border-subtlest-tertiary px-2 h-6 flex items-center justify-center typo-footnote text-text-quaternary',
    className,
  );

  const sponsoredClassName = classNames(
    styles.brandedTag,
    'relative overflow-hidden rounded-8 border px-2 h-6 flex items-center typo-footnote transition-all duration-500',
    {
      'border-border-subtlest-tertiary text-text-quaternary': !isAnimated,
      [styles.animated]: isAnimated,
    },
    className,
  );

  const sponsoredStyle =
    isAnimated && sponsorInfo.colors
      ? {
          borderColor: sponsorInfo.colors.primary,
          background: `linear-gradient(135deg, ${sponsorInfo.colors.primary}15 0%, ${sponsorInfo.colors.secondary}15 100%)`,
        }
      : undefined;

  const brandedText = sponsorInfo.branding
    ? getBrandedContent(sponsorInfo.branding.style)
    : '';

  const content = (
    <>
      {/* Original tag content - hidden when branding shows but still takes space initially */}
      <span
        className={classNames(
          styles.tagContent,
          'transition-all duration-300 whitespace-nowrap',
          {
            [styles.fadeOut]: showBranding && sponsorInfo.isSponsored,
            'invisible w-0': showBranding && sponsorInfo.isSponsored,
          },
        )}
      >
        #{tag}
      </span>

      {/* Branded content - uses normal flow to expand container */}
      {sponsorInfo.isSponsored && sponsorInfo.branding && (
        <span
          className={classNames(
            styles.brandedContent,
            'flex items-center justify-center gap-1.5 transition-all duration-300 whitespace-nowrap text-text-tertiary',
            {
              [styles.fadeIn]: showBranding,
              'invisible w-0 overflow-hidden': !showBranding,
            },
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

      {/* Shimmer effect during transition */}
      {sponsorInfo.isSponsored && isAnimated && !showBranding && (
        <span
          className={styles.shimmer}
          style={
            sponsorInfo.colors
              ? {
                  background: `linear-gradient(90deg, transparent 0%, ${sponsorInfo.colors.primary}40 50%, transparent 100%)`,
                }
              : undefined
          }
        />
      )}
    </>
  );

  // Get tooltip config for sponsored tags
  const highlightedWordResult = getHighlightedWordConfig();
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
          className="no-arrow !max-w-none !rounded-16 !bg-transparent !p-0"
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
        className="!max-w-none !rounded-16 !bg-transparent !p-0 [&_.TooltipArrow]:hidden"
      >
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};

export default BrandedTag;
