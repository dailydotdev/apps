import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import type { GivebackGiftButtonVariant } from './GivebackGiftButton';
import type { GivebackGiftDockHandle } from './GivebackGiftDock';
import { GivebackGiftDock } from './GivebackGiftDock';
import { givebackInvitePrompts } from '../givebackInvitePrompts';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureGiveback } from '../../../lib/featureManagement';
import { webappUrl } from '../../../lib/constants';
import { LogEvent } from '../../../lib/log';

interface GivebackGiftEntryProps {
  variant?: GivebackGiftButtonVariant;
  showLabel?: boolean;
  promptPlacement?: 'below' | 'above';
  promptAlign?: 'start' | 'end';
  // Custom anchor (e.g. the sidebar's own styled gift link).
  children?: ReactNode;
}

// Rotate a different opening message on each load.
let promptCursor = 0;
// Only one mounted entry runs the ambient cadence, so header + rail can't both
// fire (whichever mounts first claims it).
let cadenceClaimed = false;

// PLACEHOLDER CADENCE — the money pulses and the invite prompt are currently
// driven on a local timer as a stand-in. Before this graduates past the
// experiment, replace this timer with live backend community-activity signals
// (real amounts landing in the pot) and drop the hardcoded figures in
// `givebackInvitePrompts`. This whole surface is gated behind `featureGiveback`,
// so it stays off in production until the experiment is turned on per cohort.
const FIRST_PULSE_MS = 3500;
const PULSE_INTERVAL_MS = 22000;
const PROMPT_MS = 6000;
const PULSE_AMOUNTS = [1, 2, 3, 5, 8];

const randomPulse = (): string =>
  `+$${PULSE_AMOUNTS[Math.floor(Math.random() * PULSE_AMOUNTS.length)]}`;

// The persistent giveback entry point. Gated on the same `featureGiveback` flag
// as the page, so it shows wherever giveback is enabled. It drives its dock from
// the ambient cadence, so the money jumps and invite prompts play on the real
// gift (header or sidebar).
export function GivebackGiftEntry({
  variant = 'header',
  showLabel = false,
  promptPlacement,
  promptAlign,
  children,
}: GivebackGiftEntryProps): ReactElement | null {
  const router = useRouter();
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const dock = useRef<GivebackGiftDockHandle>(null);

  // Desktop-only for now — the mobile placement is parked for a later PR, so
  // the entry never shows on smaller viewports (header/rail are desktop anyway).
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldEvaluate = isAuthReady && isLoggedIn && isLaptop;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureGiveback,
    shouldEvaluate,
  });
  const show = shouldEvaluate && isEnabled;

  // Ambient cadence (claimed by a single instance). See PLACEHOLDER note above.
  useEffect(() => {
    if (!show || cadenceClaimed) {
      return undefined;
    }
    cadenceClaimed = true;

    const timeouts: number[] = [];
    timeouts.push(
      window.setTimeout(() => {
        dock.current?.pulseActivity(randomPulse());
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
      dock.current?.pulseActivity(randomPulse());
    }, PULSE_INTERVAL_MS);

    return () => {
      timeouts.forEach((id) => window.clearTimeout(id));
      window.clearInterval(pulse);
      cadenceClaimed = false;
    };
  }, [show, logEvent]);

  if (!show) {
    return null;
  }

  const openGiveback = () => {
    logEvent({ event_name: LogEvent.ClickGivebackGiftEntry });
    router.push(`${webappUrl}giveback`);
  };

  return (
    <GivebackGiftDock
      ref={dock}
      variant={variant}
      showLabel={showLabel}
      onOpenGiveback={openGiveback}
      promptPlacement={promptPlacement}
      promptAlign={promptAlign}
    >
      {children}
    </GivebackGiftDock>
  );
}

export default GivebackGiftEntry;
