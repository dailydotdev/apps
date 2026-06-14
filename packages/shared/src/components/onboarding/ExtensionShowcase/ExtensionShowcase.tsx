import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { Button } from '../../buttons/Button';
import { ButtonVariant, ButtonSize } from '../../buttons/common';
import { ChromeIcon } from '../../icons';
import { downloadBrowserExtension } from '../../../lib/constants';
import { anchorDefaultRel } from '../../../lib/strings';
import { ExtensionShowcaseMedia } from './ExtensionShowcaseMedia';
import { defaultExtensionShowcaseFeatures } from './defaultFeatures';
import type { ExtensionShowcaseFeature } from './types';

export interface ExtensionShowcaseProps {
  /** Features to render. Defaults to the daily.dev extension feature set. */
  features?: ExtensionShowcaseFeature[];
  /** Feature selected on first render. Defaults to the first feature. */
  defaultFeatureId?: string;
  /** Static heading above the card. */
  title?: string;
  /** Static sub-heading above the card. */
  subtitle?: string;
  /** Fallback CTA label used when the active feature defines no `cta`. */
  ctaLabel?: string;
  /** CTA destination. Defaults to the extension download link. */
  ctaHref?: string;
  /** Fires when the CTA is clicked (for tracking / step transitions). */
  onCtaClick?: () => void;
  /** Fires when the selected feature changes. */
  onFeatureChange?: (featureId: string) => void;
  className?: string;
}

interface ShowcaseNavItemProps {
  feature: ExtensionShowcaseFeature;
  isActive: boolean;
  vertical: boolean;
  onClick: () => void;
}

function ShowcaseNavItem({
  feature,
  isActive,
  vertical,
  onClick,
}: ShowcaseNavItemProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={classNames(
        'flex items-center rounded-12 transition-colors',
        vertical
          ? 'w-full flex-row gap-3 p-3'
          : 'shrink-0 flex-row gap-2 px-3 py-2',
        isActive ? 'bg-surface-float' : 'hover:bg-surface-hover',
      )}
    >
      {React.cloneElement(feature.icon, {
        secondary: isActive,
        className: classNames(!isActive && 'text-text-tertiary'),
      })}
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Callout}
        color={isActive ? TypographyColor.Primary : TypographyColor.Tertiary}
        className="whitespace-nowrap"
        bold={isActive}
      >
        {feature.label}
      </Typography>
    </button>
  );
}

export function ExtensionShowcase({
  features = defaultExtensionShowcaseFeatures,
  defaultFeatureId,
  title = 'Everything the extension unlocks',
  subtitle,
  ctaLabel = 'Get the daily.dev extension',
  ctaHref = downloadBrowserExtension,
  onCtaClick,
  onFeatureChange,
  className,
}: ExtensionShowcaseProps): ReactElement {
  if (!features.length) {
    throw new Error('ExtensionShowcase requires at least one feature');
  }

  const [activeId, setActiveId] = useState(defaultFeatureId ?? features[0].id);
  const activeFeature =
    features.find((feature) => feature.id === activeId) ?? features[0];

  const selectFeature = (featureId: string): void => {
    setActiveId(featureId);
    onFeatureChange?.(featureId);
  };

  const ctaText = activeFeature.cta ?? ctaLabel;

  return (
    <section
      className={classNames(
        'flex w-full flex-col items-center gap-6 rounded-24 bg-overlay-float-cabbage px-4 py-8 laptop:gap-8 laptop:px-10 laptop:py-10',
        className,
      )}
    >
      {(title || subtitle) && (
        <header className="flex flex-col items-center gap-2 text-center">
          {title && (
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title1}
              bold
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="max-w-xl text-balance"
            >
              {subtitle}
            </Typography>
          )}
        </header>
      )}

      <div className="w-full rounded-24 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2 laptop:p-6">
        <div className="flex flex-col gap-4 laptop:flex-row laptop:gap-8">
          <nav
            aria-label="Extension features"
            className="hidden laptop:flex laptop:w-64 laptop:shrink-0 laptop:flex-col laptop:gap-1"
          >
            {features.map((feature) => (
              <ShowcaseNavItem
                key={feature.id}
                feature={feature}
                isActive={feature.id === activeFeature.id}
                vertical
                onClick={() => selectFeature(feature.id)}
              />
            ))}
          </nav>

          <nav
            aria-label="Extension features"
            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 laptop:hidden"
          >
            {features.map((feature) => (
              <ShowcaseNavItem
                key={feature.id}
                feature={feature}
                isActive={feature.id === activeFeature.id}
                vertical={false}
                onClick={() => selectFeature(feature.id)}
              />
            ))}
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <ExtensionShowcaseMedia media={activeFeature.media} />
            <div className="flex flex-col gap-2">
              <Typography
                tag={TypographyTag.H3}
                type={TypographyType.Title3}
                bold
              >
                {activeFeature.title}
              </Typography>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Body}
                color={TypographyColor.Secondary}
              >
                {activeFeature.description}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {ctaText && (
        <Button
          className="w-full max-w-lg"
          tag="a"
          href={ctaHref}
          target="_blank"
          rel={anchorDefaultRel}
          variant={ButtonVariant.Primary}
          size={ButtonSize.XLarge}
          icon={<ChromeIcon aria-hidden />}
          onClick={onCtaClick}
        >
          {ctaText}
        </Button>
      )}
    </section>
  );
}
