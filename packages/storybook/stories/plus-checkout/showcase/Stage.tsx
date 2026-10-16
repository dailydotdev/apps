import type { CSSProperties, KeyboardEvent, ReactElement } from 'react';
import React, { useEffect, useId, useRef, useState } from 'react';
import classNames from 'classnames';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { usePrefersReducedMotion } from '@dailydotdev/shared/src/hooks/usePrefersReducedMotion';
import { accentStyle, plusBannerFeatures } from '@dailydotdev/shared/src/components/plus/PlusFeedBannerScenes';
import { allSceneFeatures } from '@dailydotdev/shared/src/components/plus/checkout/PlusCheckoutScenes';
import './stage.css';

/* The stage of PR #6868's PlusFeedBanner — feature tabs + the animated scene
   window — without the feed-banner chrome (orbs, "Still scrolling?", Get Plus).
   Same behaviour as the PR: rotates every 4.2s while visible, pauses on hover
   or focus, stops once a tab is picked, one tab stop with arrow/Home/End,
   reduced motion shows the still state. In production this would be an export
   of PlusFeedBanner.tsx, not a copy. */

const DWELL_MS = 4200;

/** Checkout feature ids (data.ts) → the PR's ids (same as plusFeatureListApiFirst). */
export const sceneIdFor: Record<string, string> = {
  ads: 'ad-free',
  brief: 'presidential-briefing',
  clean: 'clean titles',
  feeds: 'custom feeds',
  keywords: 'keyword filter',
  folders: 'bookmark folders',
  // moreScenes.tsx: the four #6868 doesn't animate.
  api: 'public-api',
  translate: 'auto-translate',
  quests: 'bonus-quest-slots',
  support: 'member squad',
};

export const hasScene = (featureId: string): boolean => featureId in sceneIdFor;

export const useRotation = ({
  ids,
  autoplay = true,
  visible = true,
}: {
  ids: string[];
  autoplay?: boolean;
  visible?: boolean;
}) => {
  const isReducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState(ids[0]);
  const [pinned, setPinned] = useState(false);
  const [paused, setPaused] = useState(false);
  const isPlaying = autoplay && visible && !pinned && !paused && !isReducedMotion;
  const key = ids.join(',');

  useEffect(() => {
    if (!ids.includes(selected)) {
      setSelected(ids[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const t = window.setTimeout(() => {
      setSelected((current) => ids[(ids.indexOf(current) + 1) % ids.length]);
    }, DWELL_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, selected, key]);

  return {
    selected,
    isPlaying,
    pick: (id: string) => {
      setPinned(true);
      setSelected(id);
    },
    show: setSelected,
    pause: setPaused,
  };
};

export const SceneWindow = ({
  sceneId,
  className,
  style,
  id,
  labelledBy,
}: {
  sceneId: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  labelledBy?: string;
}): ReactElement => {
  const feature = allSceneFeatures.find((f) => f.id === sceneId) ?? allSceneFeatures[0];
  return (
    <div
      key={feature.id}
      id={id}
      role={labelledBy ? 'tabpanel' : undefined}
      aria-labelledby={labelledBy}
      className={classNames('plus-banner-window bg-background-default', className)}
      style={style}
    >
      <div className="flex h-8 shrink-0 items-center border-b border-border-subtlest-tertiary px-3">
        <span className="truncate font-bold text-text-primary typo-footnote">{feature.perk}</span>
      </div>
      <feature.Scene />
    </div>
  );
};

/** Tabs + window, laid out by the PR's container queries (stacked when narrow, tabs beside the window from 600px). */
export const Stage = ({
  ids = plusBannerFeatures.map((f) => f.id),
  autoplay = true,
  className,
  windowStyle,
}: {
  ids?: string[];
  autoplay?: boolean;
  className?: string;
  windowStyle?: CSSProperties;
}): ReactElement => {
  const { selected, isPlaying, pick, pause } = useRotation({ ids, autoplay });
  const tabsRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const tabId = (id: string) => `${uid}-tab-${id.replace(/\s+/g, '-')}`;
  const panelId = `${uid}-panel`;
  const features = ids.map((id) => allSceneFeatures.find((f) => f.id === id)!).filter(Boolean);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = ids.indexOf(selected);
    const next = { ArrowDown: index + 1, ArrowRight: index + 1, ArrowUp: index - 1, ArrowLeft: index - 1, Home: 0, End: ids.length - 1 }[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    const target = ids[(next + ids.length) % ids.length];
    pick(target);
    document.getElementById(tabId(target))?.focus();
  };

  return (
    <div
      className={classNames('checkout-stage min-w-0', className)}
      style={{ containerType: 'inline-size' }}
      onPointerEnter={() => pause(true)}
      onPointerLeave={() => pause(false)}
      onFocus={() => pause(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          pause(false);
        }
      }}
    >
      <div className="plus-banner-stage relative">
        <div ref={tabsRef} role="tablist" aria-label="Plus features" className="plus-banner-tabs">
          {features.map((item) => {
            const active = item.id === selected;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={tabId(item.id)}
                aria-selected={active}
                aria-controls={active ? panelId : undefined}
                tabIndex={active ? 0 : -1}
                onClick={() => pick(item.id)}
                onKeyDown={onKeyDown}
                className={classNames(
                  'plus-banner-tab relative shrink-0 overflow-hidden rounded-10 typo-footnote',
                  active ? 'bg-surface-float font-bold text-text-primary' : 'text-text-tertiary hover:bg-surface-hover hover:text-text-secondary',
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className={classNames('flex', active && 'plus-banner-tint-text')} style={accentStyle(item.accent)}>
                    <item.Icon secondary={active} size={IconSize.Size16} />
                  </span>
                  {item.label}
                </span>
                {active && isPlaying && (
                  <span
                    key={selected}
                    aria-hidden
                    className="plus-banner-progress bg-text-primary"
                    style={{ '--plus-banner-dwell': `${DWELL_MS}ms` } as CSSProperties}
                  />
                )}
              </button>
            );
          })}
        </div>
        <SceneWindow sceneId={selected} id={panelId} labelledBy={tabId(selected)} style={windowStyle} />
      </div>
    </div>
  );
};
