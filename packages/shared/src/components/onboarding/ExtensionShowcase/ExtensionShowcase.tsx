import type { KeyboardEvent, ReactElement } from 'react';
import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
  id: string;
  panelId: string;
  isActive: boolean;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

function ShowcaseTab({
  feature,
  id,
  panelId,
  isActive,
  onClick,
  onKeyDown,
}: ShowcaseTabProps): ReactElement {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
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

const nextTabIndex = (key: string, current: number, count: number): number => {
  switch (key) {
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'ArrowRight':
      return (current + 1) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return -1;
  }
};

const prefersReducedMotion = (): boolean =>
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const hasCentered = useRef(false);

  // The selected tab sits in the middle and the rest fan out to both sides,
  // like the product tour on the homepage. The first paint centers instantly
  // and again once web fonts settle the tab widths; later selections glide.
  useLayoutEffect(() => {
    const centerActiveTab = (behavior: ScrollBehavior): void => {
      tablistRef.current
        ?.querySelector<HTMLElement>('[aria-selected="true"]')
        ?.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
    };

    if (hasCentered.current) {
      centerActiveTab(prefersReducedMotion() ? 'auto' : 'smooth');
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

  // Warm the illustrations up so the first click on a tab shows its stage
  // instead of the glows alone while the image lands.
  useEffect(() => {
    features.forEach(({ media }) => {
      if (media.type === 'image') {
        new Image().src = media.src;
      }
    });
  }, [features]);

  if (!activeFeature) {
    return null;
  }

  const tabId = (featureId: string): string => `${baseId}-tab-${featureId}`;
  const panelId = `${baseId}-panel`;

  const selectFeature = (featureId: string): void => {
    setActiveId(featureId);
    onFeatureChange?.(featureId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const nextIndex = nextTabIndex(
      event.key,
      features.indexOf(activeFeature),
      features.length,
    );
    if (nextIndex < 0) {
      return;
    }

    event.preventDefault();
    const next = features[nextIndex];
    selectFeature(next.id);
    document.getElementById(tabId(next.id))?.focus();
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
        aria-live="polite"
        className="animate-showcase-caption-in mx-auto min-h-[3.25rem] max-w-xl text-balance text-center"
      >
        {activeFeature.description}
      </Typography>
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Extension features"
        className="no-scrollbar showcase-carousel-mask mt-6 w-full overflow-x-auto"
      >
        <div className="flex w-max items-center gap-2.5 px-[50%] py-3">
          {features.map((feature) => (
            <ShowcaseTab
              key={feature.id}
              feature={feature}
              id={tabId(feature.id)}
              panelId={panelId}
              isActive={feature.id === activeFeature.id}
              onClick={() => selectFeature(feature.id)}
              onKeyDown={onKeyDown}
            />
          ))}
        </div>
      </div>
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(activeFeature.id)}
        className={classNames('mt-4 w-full', stageClassName)}
      >
        <ExtensionShowcaseStage feature={activeFeature} />
      </div>
    </section>
  );
}
