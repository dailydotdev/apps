import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useAdUtm } from '@dailydotdev/shared/src/features/monetization/useAdUtm';
import {
  ADS_ALLOWED_CLASS,
  CONTENT_IGNITE_PRECONNECT_ORIGINS,
  injectContentIgniteTag,
  reloadContentIgnite,
  setContentIgniteUtmTargeting,
  subscribeContentIgniteEvents,
} from '@dailydotdev/shared/src/features/monetization/contentIgnite';

export interface ContentIgniteTagProps {
  /** Whether this page may carry ads right now; the caller owns the gating. */
  enabled: boolean;
}

/**
 * Loads the Content Ignite publisher tag for a page that may carry ads, and
 * keeps the tag in step with the app afterwards: the body class its unit
 * selectors are gated on, a rebuild on every client-side navigation (the
 * tag counts page impressions and places units on load, so a route change
 * is invisible to it otherwise), and the tag's own events forwarded to our
 * slot telemetry.
 *
 * The tag is per domain and never unloads. A page that stops allowing ads
 * drops the body class and asks for a rebuild, which removes every unit:
 * their selectors no longer match anything.
 */
export function ContentIgniteTag({
  enabled,
}: ContentIgniteTagProps): ReactElement | null {
  const router = useRouter();
  const utm = useAdUtm();
  const { logEvent } = useLogContext();

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    document.body.classList.add(ADS_ALLOWED_CLASS);
    setContentIgniteUtmTargeting(utm);
    // Deferred a tick: the CMP stub is injected by an effect in _app, which
    // React runs after this page's, and Content Ignite wants the stub on the
    // page before its tag.
    const timeout = globalThis.setTimeout(injectContentIgniteTag, 0);

    return () => {
      globalThis.clearTimeout(timeout);
      document.body.classList.remove(ADS_ALLOWED_CLASS);
      reloadContentIgnite();
    };
  }, [enabled, utm]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const onRouteChange = (): void => reloadContentIgnite();
    router.events.on('routeChangeComplete', onRouteChange);
    return () => router.events.off('routeChangeComplete', onRouteChange);
  }, [enabled, router.events]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return subscribeContentIgniteEvents(logEvent, utm);
  }, [enabled, logEvent, utm]);

  if (!enabled) {
    return null;
  }

  return (
    <Head>
      {CONTENT_IGNITE_PRECONNECT_ORIGINS.map((origin) => (
        <link key={origin} rel="preconnect" href={origin} crossOrigin="" />
      ))}
    </Head>
  );
}
