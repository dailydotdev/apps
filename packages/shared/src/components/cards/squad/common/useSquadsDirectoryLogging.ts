import { useInView } from 'react-intersection-observer';
import { useCallback, useEffect, useRef } from 'react';
import type { Ad } from '../../../../graphql/posts';
import { adLogEvent, feedLogExtra } from '../../../../lib/feed';
import { LogEvent } from '../../../../lib/log';
import { OtherFeedPage } from '../../../../lib/query';
import { useLogContext } from '../../../../contexts/LogContext';

export const useSquadsDirectoryLogging = (ad: Ad) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const { logEvent } = useLogContext();
  const isLoggedRef = useRef(false);
  const shouldLogEvent = inView && ad && !isLoggedRef.current;

  const onLogAdEvent = useCallback(
    (action: LogEvent.Impression | LogEvent.Click) => {
      logEvent(adLogEvent(action, ad, feedLogExtra(OtherFeedPage.Squad)));
    },
    [ad, logEvent],
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

  return { ref, onClickAd };
};
