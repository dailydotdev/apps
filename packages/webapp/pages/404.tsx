import React, { ReactElement, useContext, useEffect, useRef } from 'react';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import { NextSeo } from 'next-seo';
import { LogsEvent } from '@dailydotdev/shared/src/lib/logs';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';

export default function Custom404Seo(): ReactElement {
  const { trackEvent } = useContext(LogContext);
  const trackedImpression = useRef(false);

  useEffect(() => {
    if (trackedImpression.current) {
      return;
    }

    trackEvent({
      event_name: LogsEvent.View404Page,
    });
    trackedImpression.current = true;
  }, [trackEvent, trackedImpression]);

  return (
    <Custom404>
      <NextSeo title="Page not found" nofollow noindex />
    </Custom404>
  );
}
