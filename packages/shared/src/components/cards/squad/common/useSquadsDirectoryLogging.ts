import { useInView } from 'react-intersection-observer';
import { useCallback, useEffect, useRef } from 'react';
import type { Ad } from '../../../../graphql/posts';
import { adLogEvent, feedLogExtra } from '../../../../lib/feed';
import { LogEvent } from '../../../../lib/log';
import { OtherFeedPage } from '../../../../lib/query';
import { useLogContext } from '../../../../contexts/LogContext';
import { AdActions } from '../../../../lib/ads';
import type { ViewabilityData } from '../../../../features/monetization/viewability';
import { viewabilityLogExtra } from '../../../../features/monetization/viewability';

export const useSquadsDirectoryLogging = (ad?: Ad) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { logEvent } = useLogContext();
  const isLoggedRef = useRef(false);
  const shouldLogEvent = inView && ad && !isLoggedRef.current;

  const onLogAdEvent = useCallback(
    (
      action: LogEvent.Impression | LogEvent.Click | AdActions.Viewable,
      extra?: Record<string, unknown>,
    ) => {
      if (!ad) {
        throw new Error('Missing ad for squads directory logging');
      }

      logEvent(
        adLogEvent(action, ad, {
          extra: { ...feedLogExtra(OtherFeedPage.Squad).extra, ...extra },
        }),
      );
    },
    [ad, logEvent],
  );

  const onViewableAd = useCallback(
    (data: ViewabilityData) =>
      onLogAdEvent(AdActions.Viewable, viewabilityLogExtra(data)),
    [onLogAdEvent],
  );

  useEffect(() => {
    if (!shouldLogEvent) {
      return;
    }

    isLoggedRef.current = true;
    onLogAdEvent(LogEvent.Impression);
  }, [ad, onLogAdEvent, shouldLogEvent]);

  const onClickAd = () => {
    if (!ad) {
      return;
    }

    onLogAdEvent(LogEvent.Click);
  };

  return { ref, onClickAd, onViewableAd };
};
