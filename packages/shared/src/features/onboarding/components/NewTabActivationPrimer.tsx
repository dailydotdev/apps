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
  requestOpenNewTabFromPage,
} from '../../extensionEmbed/newTabActivationBridge';

type NewTabActivationPrimerProps = {
  onComplete: () => void;
};

type PrimerState = 'idle' | 'waiting' | 'recovery';

const ACTIVATION_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 250;

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

// Recreation of Chrome's "Change back to Google?" override-confirmation
// bubble. Button colors match Chrome's actual palette (#1a73e8 / #d3e3fd)
// so when the real dialog appears the user sees identical UI to the
// preview. The "Tap this" callout sits outside the dialog frame in our
// brand color so it reads clearly as our annotation, not part of Chrome's
// surface.
function ChromeDialogMockup(): ReactElement {
  return (
    <div
      role="img"
      aria-label='Chrome dialog asking "Change back to Google?" with a callout pointing to the "Keep it" button.'
      className="relative w-full max-w-[28rem] select-none"
    >
      <div className="rounded-24 bg-raw-pepper-90 p-5 shadow-2 ring-1 ring-border-subtlest-tertiary">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.232c1.89-1.741 2.98-4.305 2.98-7.351Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.964-.895 6.62-2.422l-3.233-2.51c-.895.6-2.04.955-3.387.955-2.605 0-4.81-1.76-5.596-4.123H3.064v2.59A9.997 9.997 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.404 13.9A6.002 6.002 0 0 1 6.09 12c0-.66.114-1.3.314-1.9V7.51H3.064A9.996 9.996 0 0 0 2 12c0 1.614.386 3.14 1.064 4.49l3.34-2.59Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.977c1.47 0 2.786.505 3.823 1.496l2.868-2.868C16.96 2.991 14.695 2 12 2A9.997 9.997 0 0 0 3.064 7.51l3.34 2.59C7.19 7.737 9.395 5.977 12 5.977Z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white typo-callout">
              Change back to Google?
            </p>
            <p className="text-white/70 mt-1 typo-footnote">
              This page was changed by the &quot;daily.dev&quot; extension.
            </p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <span className="inline-flex items-center justify-center rounded-12 bg-[#1a73e8] px-5 py-2 font-bold text-white ring-2 ring-action-upvote-default ring-offset-2 ring-offset-raw-pepper-90 typo-callout">
            Keep it
          </span>
          <span className="inline-flex items-center justify-center rounded-12 bg-[#d3e3fd] px-5 py-2 font-bold text-[#0b57d0] typo-callout">
            Change it back
          </span>
        </div>
      </div>

      <div className="mt-3 flex justify-end pr-6">
        <div className="flex flex-col items-center gap-1">
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-4 w-4 rotate-180 text-action-upvote-default"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M8 16 0 6h5V0h6v6h5L8 16Z" />
          </svg>
          <span className="rounded-8 bg-action-upvote-default px-2 py-1 font-bold text-white shadow-2 typo-caption1">
            Tap this button
          </span>
        </div>
      </div>
    </div>
  );
}

function TrustBullets(): ReactElement {
  const items: Array<{ title: string; body: string }> = [
    {
      title: 'No browsing history.',
      body: 'The new tab only fetches your daily.dev feed.',
    },
    {
      title: 'No clickbait.',
      body: 'A curated stream of dev news ranked by what other developers find useful.',
    },
    {
      title: 'One click to disable.',
      body: 'chrome://extensions → daily.dev → toggle off.',
    },
  ];

  return (
    <ul className="flex w-full flex-col gap-3 text-left">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mt-0.5 h-5 w-5 shrink-0 text-status-success"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m4 12 5 5L20 6" />
          </svg>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            <span className="font-bold text-text-primary">{item.title}</span>{' '}
            {item.body}
          </Typography>
        </li>
      ))}
    </ul>
  );
}

function WhyChromeAsks(): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className="text-text-tertiary underline-offset-2 typo-footnote hover:underline"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        Why does Chrome ask this?
      </button>
      {open && (
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="max-w-[28rem] text-center"
        >
          Chrome shows this any time an extension changes your new tab —
          it&apos;s a privacy guardrail we actually appreciate, even when the
          wording is confusing.
        </Typography>
      )}
    </div>
  );
}

export function NewTabActivationPrimer({
  onComplete,
}: NewTabActivationPrimerProps): ReactElement {
  const { logEvent } = useLogContext();
  const [state, setState] = useState<PrimerState>('idle');
  const pollTimerRef = useRef<ReturnType<typeof globalThis.setInterval>>();
  const timeoutTimerRef = useRef<ReturnType<typeof globalThis.setTimeout>>();
  const completedRef = useRef(false);

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

  const finish = useCallback(
    (reason: 'activated' | 'skipped'): void => {
      if (completedRef.current) {
        return;
      }
      completedRef.current = true;
      stopPolling();
      if (reason === 'activated') {
        logEvent({ event_name: LogEvent.ExtensionNewTabActivated });
      }
      onComplete();
    },
    [logEvent, onComplete, stopPolling],
  );

  useEffect(() => {
    logEvent({ event_name: LogEvent.ExtensionPrimerShown });
    clearActivationStorage();
    return stopPolling;
  }, [logEvent, stopPolling]);

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
        logEvent({ event_name: LogEvent.ExtensionPrimerRecoveryShown });
        setState('recovery');
      }
    }, POLL_INTERVAL_MS);

    timeoutTimerRef.current = globalThis.setTimeout(() => {
      stopPolling();
      if (completedRef.current) {
        return;
      }
      logEvent({ event_name: LogEvent.ExtensionPrimerRecoveryShown });
      setState('recovery');
    }, ACTIVATION_TIMEOUT_MS);
  }, [finish, logEvent, stopPolling]);

  const handleActivateClick = useCallback(async (): Promise<void> => {
    logEvent({ event_name: LogEvent.ExtensionPrimerCtaClick });
    setState('waiting');
    startPolling();
    const result = await requestOpenNewTabFromPage();
    if (result.triggered) {
      logEvent({ event_name: LogEvent.ExtensionNewTabTriggered });
      return;
    }
    stopPolling();
    if (completedRef.current) {
      return;
    }
    logEvent({ event_name: LogEvent.ExtensionPrimerRecoveryShown });
    setState('recovery');
  }, [logEvent, startPolling, stopPolling]);

  const handleRetryClick = useCallback((): void => {
    clearActivationStorage();
    startPolling();
    setState('waiting');
  }, [startPolling]);

  const handleSkipClick = useCallback((): void => {
    finish('skipped');
  }, [finish]);

  const isRecovery = state === 'recovery';
  const isWaiting = state === 'waiting';

  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center px-6 py-10">
      <div
        className={classNames(
          'flex w-full max-w-[36rem] flex-col items-center gap-8 text-center',
        )}
      >
        <div className="flex flex-col items-center gap-3">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            color={TypographyColor.Primary}
            bold
          >
            {isRecovery ? 'Almost there' : 'Your new tab, made for developers'}
          </Typography>
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Body}
            color={TypographyColor.Secondary}
          >
            {isRecovery ? (
              <>
                Looks like daily.dev wasn&apos;t set as your new tab. If you
                tapped{' '}
                <span className="font-bold text-text-primary">
                  &ldquo;Change it back&rdquo;
                </span>{' '}
                by mistake, re-enable daily.dev in{' '}
                <span className="text-text-primary">chrome://extensions</span> —
                or continue and we&apos;ll set you up without it.
              </>
            ) : (
              <>
                In a moment Chrome will ask{' '}
                <span className="font-bold text-text-primary">
                  &ldquo;Change back to Google?&rdquo;
                </span>
                . Tap{' '}
                <span className="font-bold text-text-primary">Keep it</span> to
                make daily.dev your homepage for every new tab.
              </>
            )}
          </Typography>
        </div>

        {!isRecovery && <ChromeDialogMockup />}

        {!isRecovery && <TrustBullets />}

        {!isRecovery && (
          <div className="flex w-full flex-col items-center gap-3">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              disabled={isWaiting}
              onClick={handleActivateClick}
            >
              {isWaiting ? 'Waiting for you to confirm…' : 'Activate new tab'}
            </Button>
            <WhyChromeAsks />
          </div>
        )}

        {isRecovery && (
          <div className="flex w-full flex-col items-center gap-3">
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Large}
              onClick={handleRetryClick}
            >
              I activated it
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Medium}
              onClick={handleSkipClick}
            >
              Continue without new tab
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
