import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useBrandSponsorship } from '../../hooks/useBrandSponsorship';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { OpenLinkIcon } from '../icons';

interface SponsoredTagHeroProps {
  tag: string;
  className?: string;
}

/**
 * Hero banner for sponsored tags
 * Shows brand imagery and CTA when a tag is sponsored
 * Features animated gradient border and floating orbs
 */
export const SponsoredTagHero = ({
  tag,
  className,
}: SponsoredTagHeroProps): ReactElement | null => {
  const { activeBrand, isTagSponsored, getHighlightedWordConfig } =
    useBrandSponsorship();

  // Only show for sponsored tags
  if (!isTagSponsored(tag) || !activeBrand) {
    return null;
  }

  const highlightedWordConfig = getHighlightedWordConfig();
  const ctaUrl = highlightedWordConfig.config?.ctaUrl;
  const ctaText = highlightedWordConfig.config?.ctaText || 'Learn more';

  const { primary, secondary } = activeBrand.colors;

  return (
    <div
      className={classNames('relative w-full overflow-hidden rounded-16', className)}
      style={{
        background: `linear-gradient(135deg, 
          ${primary} 0%, 
          ${secondary} 25%, 
          #a855f7 50%, 
          #ec4899 75%, 
          #f472b6 100%)`,
      }}
    >
      {/* Mesh gradient overlay for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 80%, #ec4899 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, ${primary} 0%, transparent 50%),
            radial-gradient(ellipse at 40% 40%, ${secondary} 0%, transparent 40%),
            radial-gradient(ellipse at 60% 60%, #a855f7 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated floating orbs - contained within bounds */}
      <div
        className="pointer-events-none absolute right-0 top-0 size-32 rounded-full opacity-40 blur-3xl"
        style={{
          background: '#f472b6',
          animation: 'heroFloat 6s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 size-28 rounded-full opacity-40 blur-3xl"
        style={{
          background: primary,
          animation: 'heroFloat 8s ease-in-out infinite reverse',
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-2xl"
        style={{
          background: secondary,
          animation: 'heroPulse 4s ease-in-out infinite',
        }}
      />

      {/* Content - white text for contrast */}
      <div className="relative flex flex-col gap-4 p-6 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex items-center gap-4">
          {/* Brand logo with glow */}
          {activeBrand.logo && (
            <div className="relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-full opacity-70 blur-md"
                style={{ background: 'white' }}
              />
              <img
                src={activeBrand.logo}
                alt={activeBrand.name}
                className="relative size-12 rounded-full bg-white object-cover p-1 shadow-2"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="typo-callout text-white/80">Sponsored by</span>
            <span className="typo-title3 font-bold text-white">
              {activeBrand.name}
            </span>
            {highlightedWordConfig.config?.tooltipDescription && (
              <span className="typo-body max-w-lg text-white/90">
                {highlightedWordConfig.config.tooltipDescription}
              </span>
            )}
          </div>
        </div>

        {/* CTA button - white style */}
        {ctaUrl && (
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            tag="a"
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 self-start bg-white !text-gray-900 hover:bg-white/90 tablet:self-center"
          >
            {ctaText}
            <OpenLinkIcon className="ml-2" />
          </Button>
        )}
      </div>

      {/* Inline keyframe styles */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-10px) translateX(5px); }
        }
        @keyframes heroPulse {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default SponsoredTagHero;
