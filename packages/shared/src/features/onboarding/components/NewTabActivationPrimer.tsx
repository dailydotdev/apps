import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import {
  newTabActivationSuccessKey,
  requestOpenNewTabFromPage,
} from '../../extensionEmbed/newTabActivationBridge';

type NewTabActivationPrimerProps = {
  onComplete: () => void;
};

const POLL_INTERVAL_MS = 250;

const clearActivationStorage = (): void => {
  try {
    localStorage.removeItem(newTabActivationSuccessKey);
  } catch {
    // Ignore — primer will simply not auto-advance.
  }
};

const readActivationSuccess = (): boolean => {
  try {
    return !!localStorage.getItem(newTabActivationSuccessKey);
  } catch {
    return false;
  }
};

// Aspect ratio matches source dimensions so the element hugs the frame.
const DEMO_URL = '/activate-demo.mp4'; // 1748×1080

function ActivationDemoVideo(): ReactElement {
  return (
    <video
      src={DEMO_URL}
      className="aspect-[1748/1080] w-full max-w-[43rem] rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2"
      muted
      autoPlay
      loop
      playsInline
      disablePictureInPicture
      controls={false}
      aria-label="Rehearsal of Chrome's confirmation bubble and the Keep it click"
    />
  );
}

export function NewTabActivationPrimer({
  onComplete,
}: NewTabActivationPrimerProps): ReactElement {
  const { logEvent } = useLogContext();
  const [isWaiting, setIsWaiting] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof globalThis.setInterval>>();
  const completedRef = useRef(false);
  // Captured the moment the user clicks the primer CTA so we can measure
  // the time-to-activation on Chrome's bubble.
  const ctaClickAtRef = useRef<number | undefined>(undefined);

  const stopPolling = useCallback((): void => {
    if (pollTimerRef.current !== undefined) {
      globalThis.clearInterval(pollTimerRef.current);
      pollTimerRef.current = undefined;
    }
  }, []);

  const finish = useCallback((): void => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    stopPolling();
    const clickedAt = ctaClickAtRef.current;
    const elapsedMs =
      clickedAt !== undefined ? Date.now() - clickedAt : undefined;
    logEvent({
      event_name: LogEvent.ExtensionNewTabActivated,
      extra:
        elapsedMs !== undefined
          ? JSON.stringify({ keep_it_click_time_ms: elapsedMs })
          : undefined,
    });
    onComplete();
  }, [logEvent, onComplete, stopPolling]);

  useEffect(() => {
    logEvent({ event_name: LogEvent.ExtensionPrimerShown });
    clearActivationStorage();
    return stopPolling;
  }, [logEvent, stopPolling]);

  const startPolling = useCallback((): void => {
    stopPolling();
    pollTimerRef.current = globalThis.setInterval(() => {
      if (readActivationSuccess()) {
        finish();
      }
    }, POLL_INTERVAL_MS);
  }, [finish, stopPolling]);

  const handleActivateClick = useCallback(async (): Promise<void> => {
    ctaClickAtRef.current = Date.now();
    logEvent({ event_name: LogEvent.ExtensionPrimerCtaClick });
    setIsWaiting(true);
    startPolling();
    const result = await requestOpenNewTabFromPage();
    if (result.triggered) {
      logEvent({ event_name: LogEvent.ExtensionNewTabTriggered });
      return;
    }
    stopPolling();
    setIsWaiting(false);
  }, [logEvent, startPolling, stopPolling]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-10">
      <div className="flex w-full max-w-[48rem] flex-col items-center gap-5 text-center">
        <div className="flex flex-col items-center gap-2">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
            className="text-balance"
          >
            Welcome! Let&apos;s activate your new tab.
          </Typography>

          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            className="text-balance"
          >
            Tap “Keep it” on the Chrome popup.
          </Typography>
        </div>

        <ActivationDemoVideo />

        <div className="flex flex-col items-center gap-4">
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.XLarge}
            disabled={isWaiting}
            onClick={handleActivateClick}
          >
            {isWaiting ? 'Opening…' : 'Open new tab'}
          </Button>
          <p className="text-text-tertiary typo-callout">
            Takes 2 seconds. Reversible anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
