import type { CSSProperties, ReactElement } from 'react';
import React, { useEffect, useId, useRef, useState } from 'react';
import classNames from 'classnames';
import { VIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { LogEvent, TargetId } from '../../../lib/log';
import { allSceneFeatures } from './PlusCheckoutScenes';
import { orderFeatures } from './checkoutData';

const DWELL_MS = 4200;

/** Every feature, column by column from tablet up (1–5 left, 6–10 right). */
const gridClass =
  'grid grid-cols-1 gap-x-6 gap-y-1.5 tablet:grid-flow-col tablet:grid-cols-2 tablet:grid-rows-5';

const SceneWindow = ({
  sceneId,
  id,
}: {
  sceneId: string;
  id?: string;
}): ReactElement => {
  const feature =
    allSceneFeatures.find((item) => item.id === sceneId) ?? allSceneFeatures[0];
  return (
    <div
      key={feature.id}
      id={id}
      className="plus-banner-window bg-background-default"
      style={{ height: '13.5rem' }}
    >
      <div className="flex h-8 shrink-0 items-center border-b border-border-subtlest-tertiary px-3">
        <span className="truncate font-bold text-text-primary typo-footnote">
          {feature.perk}
        </span>
      </div>
      <feature.Scene />
    </div>
  );
};

/**
 * The checklist plays: every row has a scene in the window under the list.
 * It rotates every 4.2s; hovering or focusing a row shows that scene and holds
 * it while the pointer is on the list; leaving resumes. Grey highlight that
 * hugs the label, checks stay green. Reduced motion: no rotation, still scenes.
 */
export const PlusCheckoutFeatures = ({
  lead,
}: {
  lead: string[];
}): ReactElement => {
  const features = orderFeatures(lead);
  const ids = features.map(({ id }) => id);
  const isReducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState(ids[0]);
  const [paused, setPaused] = useState(false);
  const isPlaying = !paused && !isReducedMotion;
  const windowId = useId();
  const { logSubscriptionEvent } = usePlusSubscription();
  const logged = useRef(new Set<string>());

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const id = window.setTimeout(() => {
      setSelected((current) => ids[(ids.indexOf(current) + 1) % ids.length]);
    }, DWELL_MS);
    return () => window.clearTimeout(id);
    // ids is derived from lead, which is stable for a page view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, selected]);

  const show = (id: string) => {
    setSelected(id);
    // Once per feature per visit, and never for the automatic rotation.
    if (!logged.current.has(id)) {
      logged.current.add(id);
      logSubscriptionEvent({
        event_name: LogEvent.ClickPlusFeature,
        target_id: TargetId.PlusPage,
        extra: { feature: id },
      });
    }
  };

  return (
    <div
      className="flex flex-col gap-2.5"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <p className="font-bold text-text-secondary typo-footnote">
        Everything in Free, plus:
      </p>
      <ul className={gridClass}>
        {features.map((feature, index) => {
          const on = feature.id === selected;
          return (
            <li key={feature.id} className="flex">
              {/* Negative margin = the padding: labels stay on the list's grid. */}
              <button
                type="button"
                aria-pressed={on}
                aria-controls={windowId}
                onPointerEnter={() => show(feature.id)}
                onFocus={() => show(feature.id)}
                onClick={() => show(feature.id)}
                className={classNames(
                  'relative -mx-2 -my-0.5 flex items-center gap-2 overflow-hidden rounded-8 px-2 py-0.5 text-left text-text-primary transition-colors duration-200 typo-footnote',
                  on && 'bg-surface-float',
                )}
              >
                <VIcon
                  size={IconSize.XSmall}
                  className="flex-none text-accent-avocado-default"
                  aria-hidden
                />
                <span className={index < 3 ? 'font-bold' : undefined}>
                  {feature.label}
                </span>
                {on && isPlaying && (
                  <span
                    key={selected}
                    aria-hidden
                    className="plus-banner-progress bg-text-primary"
                    style={
                      {
                        '--plus-banner-dwell': `${DWELL_MS}ms`,
                        left: '0.5rem',
                        right: '0.5rem',
                      } as CSSProperties
                    }
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <SceneWindow sceneId={selected} id={windowId} />
    </div>
  );
};
