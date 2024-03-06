import React, { ReactElement, useContext, useEffect, useRef } from 'react';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import { NextSeo } from 'next-seo';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';

export default function Custom404Seo(): ReactElement {
  const { trackEvent } = useContext(AnalyticsContext);
  const trackedImpression = useRef(false);

  useEffect(() => {
    if (trackedImpression.current) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.View404Page,
    });
    trackedImpression.current = true;
  }, [trackEvent, trackedImpression]);

  return (
    <Custom404>
      <NextSeo title="Page not found" nofollow noindex />
    </Custom404>
  );
}
