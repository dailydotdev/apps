import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { GivebackGiftButtonVariant } from './GivebackGiftButton';
import type { GivebackGiftDockHandle } from './GivebackGiftDock';
import { GivebackGiftDock } from './GivebackGiftDock';
import { GivebackDevPanel } from './GivebackDevPanel';
import { givebackInvitePrompts } from '../givebackInvitePrompts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureGiveback } from '../../../lib/featureManagement';
import { webappUrl } from '../../../lib/constants';
import { LogEvent } from '../../../lib/log';

interface GivebackGiftEntryProps {
  variant?: GivebackGiftButtonVariant;
  showLabel?: boolean;
}

// Rotate a different opening message on each load.
let promptCursor = 0;

// Demo cadence for the review build. NOTE: the money pulses and the invite
// prompt are driven on a timer here as a placeholder — in the real wiring these
// come from live backend community-activity signals, not a local timer.
const FIRST_PULSE_MS = 3500;
const PULSE_INTERVAL_MS = 22000;
const PROMPT_MS = 6000;
const PULSE_AMOUNTS = [1, 2, 3, 5, 8];

// The persistent giveback entry point. Gated on the same `featureGiveback` flag
// as the page (on in development), so it shows wherever giveback is enabled.
export function GivebackGiftEntry({
  variant = 'header',
  showLabel = false,
}: GivebackGiftEntryProps): ReactElement | null {
  const router = useRouter();
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const dock = useRef<GivebackGiftDockHandle>(null);

  const shouldEvaluate = isAuthReady && isLoggedIn;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureGiveback,
    shouldEvaluate,
  });
  const show = shouldEvaluate && isEnabled;

  // Only the header instance drives the ambient cadence, so a second mount (the
  // rail) never double-fires prompts.
  const driveCadence = show && variant === 'header';

  useEffect(() => {
    if (!driveCadence) {
      return undefined;
    }

    const timeouts: number[] = [];
    timeouts.push(
      window.setTimeout(() => {
        dock.current?.pulseActivity(`+$${PULSE_AMOUNTS[2]}`);
      }, FIRST_PULSE_MS),
    );
    timeouts.push(
      window.setTimeout(() => {
        const prompt =
          givebackInvitePrompts[promptCursor % givebackInvitePrompts.length];
        promptCursor += 1;
        dock.current?.showPrompt(prompt);
        logEvent({
          event_name: LogEvent.ViewGivebackPrompt,
          extra: JSON.stringify({ prompt: prompt.id }),
        });
      }, PROMPT_MS),
    );

    const pulse = window.setInterval(() => {
      const amount =
        PULSE_AMOUNTS[Math.floor(Math.random() * PULSE_AMOUNTS.length)];
      dock.current?.pulseActivity(`+$${amount}`);
    }, PULSE_INTERVAL_MS);

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      window.clearInterval(pulse);
    };
  }, [driveCadence, logEvent]);

  if (!show) {
    return null;
  }

  const openGiveback = () => {
    logEvent({ event_name: LogEvent.ClickGivebackGiftEntry });
    router.push(`${webappUrl}giveback`);
  };

  // Opt-in QA panel (append ?giveback_debug to the URL) for driving the entry
  // point manually on a preview deploy. Only the header instance renders it.
  const showDevPanel =
    variant === 'header' && router.query.giveback_debug !== undefined;

  return (
    <>
      <GivebackGiftDock
        ref={dock}
        variant={variant}
        showLabel={showLabel}
        onOpenGiveback={openGiveback}
      />
      {showDevPanel && <GivebackDevPanel dock={dock} />}
    </>
  );
}

export default GivebackGiftEntry;
