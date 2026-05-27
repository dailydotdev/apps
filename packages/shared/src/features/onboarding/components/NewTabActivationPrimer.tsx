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
// Heartbeat pings the extension service worker. When the user picks
// "Change it back" on Chrome's dialog the extension is disabled and the
// heartbeat starts failing; two consecutive misses flips the primer to
// recovery so the user can re-enable the extension without waiting on
// the longer activation timeout.
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

// Placeholder slot for the demo video/GIF. Kept as an explicit dashed
// box so the layout, sizing, and position are exercised in advance —
// dropping in a real <video> element later is a one-line swap. Aspect
// is 16:9 to match the most likely screen recording.
function VideoPlaceholder(): ReactElement {
  return (
    <div
      role="img"
      aria-label="Placeholder for the activation demo video"
      className="relative aspect-video w-full max-w-[32rem] overflow-hidden rounded-16 border-2 border-dashed border-border-subtlest-tertiary bg-background-subtle"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-float">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="ml-1 h-7 w-7 text-text-tertiary"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 5v14l11-7-11-7Z" />
          </svg>
        </span>
        <p className="font-bold text-text-tertiary typo-callout">
          Video / GIF placeholder
        </p>
        <p className="text-text-tertiary typo-caption1">
          Demo of the Chrome dialog and the &ldquo;Keep it&rdquo; click
        </p>
      </div>
    </div>
  );
}

// Wrapper that pairs the video slot with the payoff caption underneath.
// The caption is the line that flips Chrome's framing — "Change back to
// Google?" implies daily.dev is unknown; the caption claims the feed
// the user is about to keep.
function ActivationVisual(): ReactElement {
  return (
    <div className="flex w-full max-w-[32rem] flex-col items-center gap-2">
      <VideoPlaceholder />
      <p className="text-text-tertiary typo-caption1">
        This is what opens every time you hit ⌘T.
      </p>
    </div>
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

// Three tight one-line trust bullets under the CTA. Each line stands on
// its own — no apologetic "Chrome shows this prompt…" framing, which
// would surface objections the user hasn't raised yet.
function TrustBullets(): ReactElement {
  const bullets: Array<{ label: string; body: string }> = [
    { label: 'Private', body: 'we never read your browsing history' },
    { label: 'Curated', body: 'top engineering posts, zero clickbait' },
    {
      label: 'Reversible',
      body: 'one click in chrome://extensions to undo',
    },
  ];
  return (
    <ul className="flex flex-col items-start gap-1.5">
      {bullets.map((bullet) => (
        <li
          key={bullet.label}
          className="flex items-center gap-2 text-text-tertiary typo-footnote"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 shrink-0 text-status-success"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m4 12 5 5L20 6" />
          </svg>
          <span>
            <span className="font-bold text-text-secondary">
              {bullet.label}
            </span>{' '}
            — {bullet.body}
          </span>
        </li>
      ))}
    </ul>
  );
}

// TODO: swap ChromeDialogMockup for a short autoplay/loop/muted video
// once recorded. Pattern to use (see OnboardingPlusVariationV1.tsx):
//   <video src={url} poster={posterUrl} muted autoPlay loop playsInline
//          disablePictureInPicture controls={false} className="..." />
// The video should show: new tab opens → "Change back to Google?" dialog
// appears → cursor moves to the "Keep it" button → click → daily.dev
// feed loads. Until the asset exists, the static mockup conveys the
// same information.

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
  // Captured the moment the user clicks "Keep it" on the primer so we
  // can measure the time-to-activation on the Chrome dialog. A small
  // number means the priming worked — the user's muscle memory was
  // primed and they tapped Keep it quickly. A large number means they
  // hesitated, and we lost the click-through.
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

  // Heartbeat: ping the extension every couple of seconds so we can flip
  // to recovery immediately when Chrome disables it (the side effect of
  // the user picking "Change it back" on the override dialog). Two
  // consecutive failures trigger recovery — a single missed ping during
  // service-worker sleep is forgiven.
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
    // Fire one immediately so a missing extension at mount time is caught
    // before the first interval tick.
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
    // extension when the user picked "Change it back". Web pages cannot
    // navigate to chrome:// URLs without an enabled extension proxying
    // the navigation, so fall back to telling the user to do it.
    setShowManualHint(true);
  }, []);

  const isRecovery = state === 'recovery';
  const isWaiting = state === 'waiting';

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center px-6 py-8">
      <div
        className={classNames(
          'flex w-full max-w-[36rem] flex-col items-center gap-5 text-center',
        )}
      >
        {!isRecovery && (
          <span className="rounded-full bg-surface-float px-3 py-1 text-text-tertiary typo-caption1">
            Step 1 of 1 · Takes 2 seconds
          </span>
        )}

        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          color={TypographyColor.Primary}
          bold
        >
          {isRecovery ? 'Almost there' : 'Tap "Keep it" when Chrome asks.'}
        </Typography>

        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Body}
          color={TypographyColor.Secondary}
        >
          {isRecovery
            ? 'Looks like daily.dev was turned off. Open the extensions page, find daily.dev, and flip the toggle back on.'
            : "Chrome's confirmation pops up the moment you click below."}
        </Typography>

        {!isRecovery && <ActivationVisual />}

        {!isRecovery && (
          <div className="flex w-full flex-col items-center gap-4">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              disabled={isWaiting}
              onClick={handleActivateClick}
            >
              {isWaiting ? 'Waiting for you to confirm…' : 'Keep it'}
            </Button>
            <TrustBullets />
          </div>
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
