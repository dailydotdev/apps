import type { ComponentProps, KeyboardEvent, ReactElement } from 'react';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import classNames from 'classnames';
import { isToday } from 'date-fns';
import { useInView } from 'react-intersection-observer';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { DevPlusIcon } from '../icons/DevPlus';
import { IconSize } from '../Icon';
import { accentStyle, plusBannerFeatures } from './PlusFeedBannerScenes';
import { plusUrl } from '../../lib/constants';
import { LogEvent, TargetId, TargetType } from '../../lib/log';
import { isValidDate } from '../../lib/dateFormat';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useEventListener } from '../../hooks/useEventListener';
import { usePlusSubscription } from '../../hooks/usePlusSubscription';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';

const DWELL_MS = 4200;

export const PlusFeedBanner = ({
  className,
  ...attrs
}: ComponentProps<'section'>): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();
  const isReducedMotion = usePrefersReducedMotion();
  const [selected, setSelected] = useState(plusBannerFeatures[0].id);
  const [pinned, setPinned] = useState(false);
  const [paused, setPaused] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const { ref: inViewRef, inView } = useInView({ threshold: 0.4 });
  const isPlaying = inView && !pinned && !paused && !isReducedMotion;
  const uid = useId();
  const tabId = (id: string) => `${uid}-tab-${id.replace(/\s+/g, '-')}`;
  const panelId = `${uid}-panel`;
  const feature =
    plusBannerFeatures.find((item) => item.id === selected) ??
    plusBannerFeatures[0];

  useLogEventOnce(() => ({
    event_name: LogEvent.Impression,
    target_type: TargetType.Plus,
    target_id: TargetId.Scroll,
  }));

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const id = window.setTimeout(() => {
      setSelected((current) => {
        const index = plusBannerFeatures.findIndex(
          (item) => item.id === current,
        );
        return plusBannerFeatures[(index + 1) % plusBannerFeatures.length].id;
      });
    }, DWELL_MS);
    return () => window.clearTimeout(id);
  }, [isPlaying, selected]);

  useEffect(() => {
    const tabs = tabsRef.current;
    const tab = tabs?.querySelector<HTMLElement>(`[data-id="${selected}"]`);
    if (!tabs || !tab || tabs.scrollWidth <= tabs.clientWidth) {
      return;
    }
    tabs.scrollTo({
      left: tab.offsetLeft - 24,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  }, [selected, isReducedMotion]);

  const select = (id: string) => {
    setPinned(true);
    setSelected(id);
  };

  const pick = (id: string) => {
    select(id);
    logSubscriptionEvent({
      event_name: LogEvent.ClickPlusFeature,
      target_id: TargetId.Scroll,
      extra: { feature: id },
    });
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = plusBannerFeatures.findIndex((item) => item.id === selected);
    const next = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: plusBannerFeatures.length - 1,
    }[event.key];
    if (next === undefined) {
      return;
    }
    event.preventDefault();
    const target =
      plusBannerFeatures[
        (next + plusBannerFeatures.length) % plusBannerFeatures.length
      ];
    select(target.id);
    document.getElementById(tabId(target.id))?.focus();
  };

  return (
    <section
      ref={inViewRef}
      aria-label="daily.dev Plus"
      className={classNames(
        'plus-banner relative isolate overflow-hidden rounded-20 p-1.5',
        className,
      )}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      {...attrs}
    >
      <span
        aria-hidden
        className="plus-banner-orb -left-24 -top-32 size-80 bg-accent-cabbage-default"
      />
      <span
        aria-hidden
        className="plus-banner-orb plus-banner-orb--delay -right-16 -top-24 size-72 bg-accent-onion-default"
      />
      <div className="plus-banner-body plus-banner-glass relative rounded-14">
        <span
          aria-hidden
          className="plus-banner-topglow pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-14"
        />
        <div className="plus-banner-head relative">
          <div className="plus-banner-copy">
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Title2}
              bold
              className="plus-banner-title"
            >
              <span className="block">Still scrolling?</span>
              <span className="block">Upgrade the feed.</span>
            </Typography>
          </div>
          <div className="plus-banner-cta">
            <Link href={plusUrl} passHref>
              <Button
                tag="a"
                data-testid="plus-feed-banner-cta"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Small}
                icon={<DevPlusIcon secondary />}
                className="plus-banner-cta-button"
                onClick={() =>
                  logSubscriptionEvent({
                    event_name: LogEvent.UpgradeSubscription,
                    target_id: TargetId.Scroll,
                    extra: { feature: selected },
                  })
                }
              >
                Get Plus
              </Button>
            </Link>
          </div>
        </div>
        <div className="plus-banner-stage relative">
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Plus features"
            className="plus-banner-tabs"
          >
            {plusBannerFeatures.map((item) => {
              const active = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={tabId(item.id)}
                  data-id={item.id}
                  aria-selected={active}
                  aria-controls={active ? panelId : undefined}
                  tabIndex={active ? 0 : -1}
                  onClick={() => pick(item.id)}
                  onKeyDown={onTabKeyDown}
                  className={classNames(
                    'plus-banner-tab relative shrink-0 overflow-hidden rounded-10 typo-footnote',
                    active
                      ? 'bg-surface-float font-bold text-text-primary'
                      : 'text-text-tertiary hover:bg-surface-hover hover:text-text-secondary',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={classNames(
                        'flex',
                        active && 'plus-banner-tint-text',
                      )}
                      style={accentStyle(item.accent)}
                    >
                      <item.Icon secondary={active} size={IconSize.Size16} />
                    </span>
                    {item.label}
                  </span>
                  {active && isPlaying && (
                    <span
                      key={selected}
                      aria-hidden
                      className="plus-banner-progress bg-text-primary"
                      style={
                        {
                          '--plus-banner-dwell': `${DWELL_MS}ms`,
                        } as React.CSSProperties
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div
            key={feature.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId(feature.id)}
            className="plus-banner-window bg-background-default"
          >
            <div className="flex h-8 shrink-0 items-center border-b border-border-subtlest-tertiary px-3">
              <span className="truncate font-bold text-text-primary typo-footnote">
                {feature.perk}
              </span>
            </div>
            <feature.Scene />
          </div>
        </div>
      </div>
    </section>
  );
};

const isTodayDate = (value?: Date | number | string | null): boolean => {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return isValidDate(date) && isToday(date);
};

// Shown once a day to free members. The seen timestamp is written on
// unload or unmount rather than on sight so the banner doesn't vanish while
// the reader is still looking at it.
export const PlusFeedBannerSlot = ({
  style,
  ...props
}: ComponentProps<'section'>): ReactElement | null => {
  const { alerts, loadedAlerts, updateAlerts } = useAlertsContext();
  const { isLoggedIn } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const bannerLastSeenRef = useRef<Date | null>(null);
  const haveSeenBannerToday =
    loadedAlerts && isTodayDate(alerts.briefBannerLastSeen);
  const shouldShowBanner = isLoggedIn && !isPlus && !haveSeenBannerToday;

  const saveBannerState = useCallback(() => {
    if (bannerLastSeenRef.current !== null) {
      updateAlerts?.({ briefBannerLastSeen: bannerLastSeenRef.current });
      bannerLastSeenRef.current = null;
    }
  }, [updateAlerts]);

  const { ref: bannerRef, inView } = useInView({
    threshold: 0.5,
    skip: !shouldShowBanner,
  });

  useEffect(() => {
    if (inView && shouldShowBanner && bannerLastSeenRef.current === null) {
      bannerLastSeenRef.current = new Date();
    }
  }, [inView, shouldShowBanner]);

  useEventListener(window, 'beforeunload', saveBannerState, {
    passive: true,
    once: true,
  });

  useEffect(() => saveBannerState, [saveBannerState]);

  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div ref={bannerRef} style={style} data-testid="plus-feed-banner">
      <PlusFeedBanner {...props} />
    </div>
  );
};
