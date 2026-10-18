import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import { ErrorBoundary } from '@dailydotdev/shared/src/components/ErrorBoundary';
import { NextSeo } from 'next-seo';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';

export default function Custom404Seo(): ReactElement {
  const { logEvent } = useLogContext();
  const logImpression = useRef(false);

  useEffect(() => {
    if (logImpression.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.View404Page,
    });
    logImpression.current = true;
  }, [logEvent, logImpression]);

  return (
    <ErrorBoundary feature="404-page">
      <Custom404 showRecoveryLinks>
        <NextSeo title="Page not found" nofollow noindex />
      </Custom404>
    </ErrorBoundary>
  );
}

// A wrong turn on a phone keeps the bottom bar, so there is a way on to
// every root; wider screens render the page bare, as before.
Custom404Seo.getLayout = getFooterNavBarLayout;
