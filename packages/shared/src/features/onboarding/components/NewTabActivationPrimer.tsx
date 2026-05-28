import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
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
  newTabActivationRejectedKey,
  newTabActivationSuccessKey,
  pingExtensionFromPage,
  requestOpenExtensionsPageFromPage,
  requestOpenNewTabFromPage,
} from '../../extensionEmbed/newTabActivationBridge';

type NewTabActivationPrimerProps = {
  onComplete: () => void;
};

type PrimerState = 'idle' | 'waiting' | 'recovery';

const ACTIVATION_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 250;
// Heartbeat pings the extension service worker. If Chrome later
// disables the extension (a side effect of "Change it back" in some
// Chrome behaviors, or a manual disable), the ping starts failing.
// Two consecutive misses flips the primer to recovery.
const HEARTBEAT_INTERVAL_MS = 2_000;
const HEARTBEAT_FAILURES_BEFORE_RECOVERY = 2;

const clearActivationStorage = (): void => {
  try {
    localStorage.removeItem(newTabActivationSuccessKey);
    localStorage.removeItem(newTabActivationRejectedKey);
  } catch {
    // Ignore — storage failures fall back to the recovery screen.
  }
};

const readActivationStorage = (): {
  success: boolean;
  rejected: boolean;
} => {
  try {
    return {
      success: !!localStorage.getItem(newTabActivationSuccessKey),
      rejected: !!localStorage.getItem(newTabActivationRejectedKey),
    };
  } catch {
    return { success: false, rejected: false };
  }
};

// TODO(BEFORE-MERGE): videos currently served from webapp/public for
// local testing. Upload both to Cloudinary and swap the URL constants
// for the hosted URLs before merging. Aspect ratios below match the
// source dimensions exactly so the element hugs the frame without
// letterbox padding — update them if the production videos are
// re-recorded at different dimensions.
const PRIMARY_DEMO_URL = '/activate-demo.mp4'; // 1748×1080
const RECOVERY_DEMO_URL = '/recovery-demo.mp4'; // 1152×720 (16:10)

// Video is THE visual on both the primary and recovery screens —
// large (full container width, ~50% viewport height), autoplay/loop,
// burned-in subtitles intended.
function ActivationDemoVideo({
  variant,
}: {
  variant: 'primary' | 'recovery';
}): ReactElement {
  const src = variant === 'primary' ? PRIMARY_DEMO_URL : RECOVERY_DEMO_URL;
  const aspect =
    variant === 'primary' ? 'aspect-[1748/1080]' : 'aspect-[1152/720]';
  const ariaLabel =
    variant === 'primary'
      ? "Rehearsal of Chrome's confirmation bubble and the Keep it click"
      : 'Walkthrough of re-enabling daily.dev from chrome://extensions';
  return (
    <video
      src={src}
      className={classNames(
        aspect,
        'w-full rounded-16 border border-border-subtlest-tertiary bg-background-subtle shadow-2',
      )}
      muted
      autoPlay
      loop
      playsInline
      disablePictureInPicture
      controls={false}
      aria-label={ariaLabel}
    />
  );
}

export function NewTabActivationPrimer({
  onComplete,
}: NewTabActivationPrimerProps): ReactElement {
  const { logEvent } = useLogContext();
  const [state, setState] = useState<PrimerState>('idle');
  const stateRef = useRef<PrimerState>('idle');
  const pollTimerRef = useRef<ReturnType<typeof globalThis.setInterval>>();
  const timeoutTimerRef = useRef<ReturnType<typeof globalThis.setTimeout>>();
  const heartbeatTimerRef = useRef<ReturnType<typeof globalThis.setInterval>>();
  const heartbeatFailuresRef = useRef(0);
  const completedRef = useRef(false);
  // Captured the moment the user clicks the primer CTA so we can measure
  // the time-to-activation on Chrome's bubble. Small = priming worked
  // (user tapped Keep it quickly). Large = hesitation = we lost the
  // click-through.
  const ctaClickAtRef = useRef<number | undefined>(undefined);

  const updateState = useCallback((next: PrimerState): void => {
    stateRef.current = next;
    setState(next);
  }, []);

  const goToRecovery = useCallback((): void => {
    if (completedRef.current || stateRef.current === 'recovery') {
      return;
    }
    logEvent({ event_name: LogEvent.ExtensionPrimerRecoveryShown });
    updateState('recovery');
  }, [logEvent, updateState]);

  const stopPolling = useCallback((): void => {
    if (pollTimerRef.current !== undefined) {
      globalThis.clearInterval(pollTimerRef.current);
      pollTimerRef.current = undefined;
    }
    if (timeoutTimerRef.current !== undefined) {
      globalThis.clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = undefined;
    }
  }, []);

  const stopHeartbeat = useCallback((): void => {
    if (heartbeatTimerRef.current !== undefined) {
      globalThis.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = undefined;
    }
  }, []);

  const finish = useCallback(
    (reason: 'activated' | 'skipped'): void => {
      if (completedRef.current) {
        return;
      }
      completedRef.current = true;
      stopPolling();
      stopHeartbeat();
      if (reason === 'activated') {
        const clickedAt = ctaClickAtRef.current;
        const elapsedMs =
          clickedAt !== undefined ? Date.now() - clickedAt : undefined;
        logEvent({
          event_name: LogEvent.ExtensionNewTabActivated,
          // KeepItClickTimeMs — the primary optimization metric. Time
          // from the user clicking the primer CTA to Chrome's dialog
          // resolving in our favor. Smaller = the priming worked.
          extra:
            elapsedMs !== undefined
              ? JSON.stringify({ keep_it_click_time_ms: elapsedMs })
              : undefined,
        });
      }
      onComplete();
    },
    [logEvent, onComplete, stopPolling, stopHeartbeat],
  );

  useEffect(() => {
    logEvent({ event_name: LogEvent.ExtensionPrimerShown });
    clearActivationStorage();
    return () => {
      stopPolling();
      stopHeartbeat();
    };
  }, [logEvent, stopPolling, stopHeartbeat]);

  // Heartbeat: detect when the extension goes away (uninstall or some
  // disabled-by-Chrome edge cases) and flip to recovery quickly.
  useEffect(() => {
    const runHeartbeat = async (): Promise<void> => {
      if (completedRef.current || stateRef.current === 'recovery') {
        return;
      }
      const { alive } = await pingExtensionFromPage();
      if (alive) {
        heartbeatFailuresRef.current = 0;
        return;
      }
      heartbeatFailuresRef.current += 1;
      if (heartbeatFailuresRef.current < HEARTBEAT_FAILURES_BEFORE_RECOVERY) {
        return;
      }
      logEvent({ event_name: LogEvent.ExtensionDialogRejected });
      goToRecovery();
    };

    heartbeatTimerRef.current = globalThis.setInterval(
      runHeartbeat,
      HEARTBEAT_INTERVAL_MS,
    );
    runHeartbeat();

    return stopHeartbeat;
  }, [goToRecovery, logEvent, stopHeartbeat]);

  const startPolling = useCallback((): void => {
    stopPolling();
    pollTimerRef.current = globalThis.setInterval(() => {
      const { success, rejected } = readActivationStorage();
      if (success) {
        finish('activated');
        return;
      }
      if (rejected) {
        stopPolling();
        logEvent({ event_name: LogEvent.ExtensionDialogRejected });
        goToRecovery();
      }
    }, POLL_INTERVAL_MS);

    timeoutTimerRef.current = globalThis.setTimeout(() => {
      stopPolling();
      goToRecovery();
    }, ACTIVATION_TIMEOUT_MS);
  }, [finish, goToRecovery, logEvent, stopPolling]);

  const handleActivateClick = useCallback(async (): Promise<void> => {
    ctaClickAtRef.current = Date.now();
    logEvent({ event_name: LogEvent.ExtensionPrimerCtaClick });
    updateState('waiting');
    startPolling();
    const result = await requestOpenNewTabFromPage();
    if (result.triggered) {
      logEvent({ event_name: LogEvent.ExtensionNewTabTriggered });
      return;
    }
    stopPolling();
    goToRecovery();
  }, [goToRecovery, logEvent, startPolling, stopPolling, updateState]);

  const [showManualHint, setShowManualHint] = useState(false);

  const handleOpenExtensionsPage = useCallback(async (): Promise<void> => {
    const result = await requestOpenExtensionsPageFromPage();
    if (result.opened) {
      return;
    }
    // Bridge failed — almost always because Chrome already disabled the
    // extension. Web pages cannot navigate to chrome:// URLs without an
    // enabled extension proxying, so fall back to telling the user.
    setShowManualHint(true);
  }, []);

  const isRecovery = state === 'recovery';
  const isWaiting = state === 'waiting';

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-10">
      <div
        className={classNames(
          'flex w-full flex-col items-center gap-5 text-center',
          isRecovery ? 'max-w-[36rem]' : 'max-w-[48rem]',
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
            // text-wrap: balance distributes the headline across lines
            // evenly, which prevents the orphaned-trailing-word "floating
            // line" effect on copy that wraps at narrow widths.
            className="text-balance"
          >
            {isRecovery
              ? 'Let’s get your new tab back'
              : 'Welcome! Let’s activate your new tab.'}
          </Typography>

          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            className="text-balance"
          >
            {isRecovery
              ? 'Open chrome://extensions and toggle daily.dev on.'
              : 'Tap “Keep it” on the Chrome popup.'}
          </Typography>
        </div>

        <ActivationDemoVideo variant={isRecovery ? 'recovery' : 'primary'} />

        {!isRecovery && (
          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              disabled={isWaiting}
              onClick={handleActivateClick}
            >
              {isWaiting ? 'Opening…' : 'Open new tab'}
            </Button>
            <p className="text-text-tertiary typo-caption1">
              Takes 2 seconds. Reversible anytime.
            </p>
          </div>
        )}

        {isRecovery && (
          <div className="flex w-full flex-col items-center gap-3">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={handleOpenExtensionsPage}
            >
              Open extensions page
            </Button>
            {showManualHint && (
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Footnote}
                color={TypographyColor.Tertiary}
                className="text-center"
              >
                Couldn&apos;t open it automatically — open a new tab and go to{' '}
                <span className="text-text-primary">chrome://extensions</span>{' '}
                to turn daily.dev back on.
              </Typography>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
