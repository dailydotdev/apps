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

// The whole non-recovery primer visual: a single autoplay/loop video
// that rehearses the upcoming click — bubble fades in, cursor lands on
// "Keep it", bubble dismisses, feed flashes. Subtitles are intended to
// be burned into the video itself so the user learns the motor sequence
// visually + verbally in a single artifact.
//
// TODO(BEFORE-MERGE): currently served from webapp/public for local
// testing. Upload to Cloudinary and swap ACTIVATION_DEMO_URL for the
// hosted URL before merging. While re-recording for production, bake
// in subtitles per the design brief:
//   0:00 "In a moment, Chrome will ask…"
//   0:02 "Tap Keep it — left button."
//   0:04 "Done. Your new tab is live."
const ACTIVATION_DEMO_URL = '/activate-demo.mp4';

function ActivationDemoVideo(): ReactElement {
  return (
    <video
      src={ACTIVATION_DEMO_URL}
      className="aspect-video w-full max-w-[36rem] rounded-16 border border-border-subtlest-tertiary bg-background-subtle"
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

// Stylized recreation of the daily.dev card on the chrome://extensions
// page with the toggle highlighted in the OFF position. Used by the
// recovery screen to show the user exactly what to look for when they
// need to re-enable the extension.
function ExtensionsPageCardMockup(): ReactElement {
  return (
    <div
      role="img"
      aria-label="Mockup of the chrome://extensions card for daily.dev showing the on/off toggle on the right with a callout to turn it on."
      className="relative w-full max-w-[28rem] select-none"
    >
      <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 shadow-2">
        <div className="flex items-start gap-3">
          <div
            aria-hidden
            className="h-12 w-12 shrink-0 rounded-12 bg-gradient-to-br from-raw-cabbage-50 to-raw-pepper-90 shadow-2"
          />
          <div className="flex-1 overflow-hidden">
            <div className="flex items-baseline gap-2">
              <p className="truncate font-bold text-text-primary typo-callout">
                daily.dev | Developer News Done Righ…
              </p>
              <span className="shrink-0 text-text-tertiary typo-footnote">
                3.45.3
              </span>
            </div>
            <p className="mt-1 text-text-secondary typo-footnote">
              Developer news, personalized to your stack, in every new tab.
            </p>
            <p className="mt-2 text-text-tertiary typo-caption1">
              ID: jlmpjdjjbgclbocgajdjefcidcncaied
            </p>
          </div>
          <div className="relative shrink-0">
            <span
              aria-hidden
              className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-8 bg-action-upvote-default px-2 py-1 font-bold text-white shadow-2 typo-caption1"
            >
              Turn this on
            </span>
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="absolute -top-3 left-1/2 h-4 w-4 -translate-x-1/2 animate-bounce text-action-upvote-default"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 16 0 6h5V0h6v6h5L8 16Z" />
            </svg>
            <span
              aria-hidden
              className="inline-flex h-6 w-11 items-center rounded-full bg-text-disabled p-0.5 ring-2 ring-action-upvote-default ring-offset-2 ring-offset-background-default"
            >
              <span className="h-5 w-5 rounded-full bg-white shadow-2" />
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-12 border border-border-subtlest-tertiary px-3 py-1 text-text-tertiary typo-footnote">
            Details
          </span>
          <span className="inline-flex items-center justify-center rounded-12 border border-border-subtlest-tertiary px-3 py-1 text-text-tertiary typo-footnote">
            Remove
          </span>
        </div>
      </div>
    </div>
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
    <div className="flex min-h-dvh w-full flex-col items-center justify-center px-6 py-10">
      <div
        className={classNames(
          'flex w-full max-w-[36rem] flex-col items-center gap-6 text-center',
        )}
      >
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          color={TypographyColor.Primary}
          bold
        >
          {isRecovery ? 'Almost there' : 'One click and you’re in'}
        </Typography>

        {isRecovery && (
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            Looks like daily.dev was turned off. Open the extensions page, find
            daily.dev, and flip the toggle back on.
          </Typography>
        )}

        {!isRecovery && <ActivationDemoVideo />}

        {!isRecovery && (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            disabled={isWaiting}
            onClick={handleActivateClick}
          >
            {isWaiting ? 'Opening…' : 'Activate new tab'}
          </Button>
        )}

        {isRecovery && <ExtensionsPageCardMockup />}

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
