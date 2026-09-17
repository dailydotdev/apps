import type { ReactElement } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import { FunnelTargetId } from '../../../features/onboarding/types/funnelEvents';
import { ExtensionShowcaseStage } from './ExtensionShowcaseStage';
import {
  defaultExtensionShowcaseFeatureId,
  defaultExtensionShowcaseFeatures,
} from './defaultFeatures';
import type { ExtensionShowcaseFeature } from './types';

export interface ExtensionShowcaseProps {
  features?: ExtensionShowcaseFeature[];
  defaultFeatureId?: string;
  onFeatureChange?: (featureId: string) => void;
  className?: string;
  /** Applied to the stage wrapper, e.g. to cap its width. */
  stageClassName?: string;
}

interface ShowcaseTabProps {
  feature: ExtensionShowcaseFeature;
  isActive: boolean;
  onClick: () => void;
}

function ShowcaseTab({
  feature,
  isActive,
  onClick,
}: ShowcaseTabProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      data-funnel-track={FunnelTargetId.ExtensionFeature}
      className={classNames(
        'shrink-0 whitespace-nowrap rounded-12 border px-4 py-2 transition-all',
        isActive
          ? 'scale-105 shadow-2'
          : 'border-border-subtlest-tertiary text-text-tertiary hover:border-border-subtlest-secondary hover:text-text-primary',
      )}
      style={
        isActive
          ? {
              color: feature.accent,
              borderColor: `color-mix(in srgb, ${feature.accent} 42%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${feature.accent} 14%, transparent)`,
            }
          : undefined
      }
    >
      <Typography tag={TypographyTag.Span} type={TypographyType.Callout} bold>
        {feature.label}
      </Typography>
    </button>
  );
}

export function ExtensionShowcase({
  features = defaultExtensionShowcaseFeatures,
  defaultFeatureId = defaultExtensionShowcaseFeatureId,
  onFeatureChange,
  className,
  stageClassName,
}: ExtensionShowcaseProps): ReactElement | null {
  const [activeId, setActiveId] = useState(defaultFeatureId);
  const activeFeature =
    features.find((feature) => feature.id === activeId) ?? features[0];
  const activeFeatureId = activeFeature?.id;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasCentered = useRef(false);

  // The selected tab sits in the middle and the rest fan out to both sides,
  // like the product tour on the homepage. The first paint centers instantly
  // and again once web fonts settle the tab widths; later selections glide.
  useLayoutEffect(() => {
    const centerActiveTab = (behavior: ScrollBehavior): void => {
      const scroller = scrollerRef.current;
      const tab = scroller?.querySelector<HTMLElement>('[aria-pressed="true"]');
      if (!scroller || !tab) {
        return;
      }

      const scrollerRect = scroller.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      scroller.scrollTo({
        left:
          scroller.scrollLeft +
          (tabRect.left - scrollerRect.left) -
          (scroller.clientWidth - tabRect.width) / 2,
        behavior,
      });
    };

    if (hasCentered.current) {
      centerActiveTab('smooth');
      return undefined;
    }

    centerActiveTab('auto');
    hasCentered.current = true;
    let isCurrent = true;
    document.fonts?.ready.then(() => {
      if (isCurrent) {
        centerActiveTab('auto');
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [activeFeatureId]);

  if (!activeFeature) {
    return null;
  }

  const selectFeature = (featureId: string): void => {
    setActiveId(featureId);
    onFeatureChange?.(featureId);
  };

  return (
    <section
      className={classNames('flex w-full flex-col items-center', className)}
    >
      <Typography
        key={activeFeature.id}
        tag={TypographyTag.P}
        type={TypographyType.Body}
        color={TypographyColor.Secondary}
        className="animate-showcase-caption-in mx-auto min-h-[3.25rem] max-w-xl text-balance text-center"
      >
        {activeFeature.description}
      </Typography>
      <nav
        ref={scrollerRef}
        aria-label="Extension features"
        className="no-scrollbar showcase-carousel-mask mt-6 w-full overflow-x-auto"
      >
        <div className="flex w-max items-center gap-2.5 px-[50%] py-3">
          {features.map((feature) => (
            <ShowcaseTab
              key={feature.id}
              feature={feature}
              isActive={feature.id === activeFeature.id}
              onClick={() => selectFeature(feature.id)}
            />
          ))}
        </div>
      </nav>
      <div className={classNames('mt-4 w-full', stageClassName)}>
        <ExtensionShowcaseStage feature={activeFeature} />
      </div>
    </section>
  );
}
