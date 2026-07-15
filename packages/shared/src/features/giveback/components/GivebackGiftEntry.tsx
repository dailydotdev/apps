import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import { useRouter } from 'next/router';
import type { GivebackGiftButtonVariant } from './GivebackGiftButton';
import type { GivebackGiftDockHandle } from './GivebackGiftDock';
import { GivebackGiftDock } from './GivebackGiftDock';
import { GivebackLiveActivityListener } from './GivebackLiveActivityListener';
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
  // Flat, compact styling + viewport-pinned prompt for the mobile header
  // placements. Set by the caller that mounts the entry on a mobile surface, so
  // the styling follows the placement rather than being guessed from viewport.
  compact?: boolean;
  promptPlacement?: 'below' | 'above';
  promptAlign?: 'start' | 'end';
  // When the parent already evaluated `featureGiveback` (e.g. the rail, which
  // branches on it), pass the value so we don't evaluate the flag a second time.
  isFeatureEnabled?: boolean;
  // Custom anchor (e.g. the sidebar's own styled gift link).
  children?: ReactNode;
}

// The live activity only plays for established accounts (older than a week).
// Brand-new users get the calm gift without the attention-grabbing motion.
const LIVE_ACTIVITY_MIN_ACCOUNT_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// The persistent giveback entry point. Gated on the same `featureGiveback` flag
// as the page, so it shows wherever giveback is enabled. It drives its dock from
// remote community activity: real approved actions pop a live "+$" jump and
// crossing a global milestone fires the celebratory popover. Its mount points -
// the desktop header, the sidebar-v2 rail, and the mobile feed header (phone via
// MobileFeedActions, tablet via FeedNav) - are laid out to be mutually
// exclusive, so only one entry is ever mounted and no cross-instance
// coordination is needed. Adding a new mount point must preserve that.
export function GivebackGiftEntry({
  variant = 'header',
  showLabel = false,
  compact = false,
  promptPlacement,
  promptAlign,
  isFeatureEnabled,
  children,
}: GivebackGiftEntryProps): ReactElement | null {
  const router = useRouter();
  const { user, isLoggedIn, isAuthReady } = useAuthContext();
  const { logEvent } = useLogContext();
  const dock = useRef<GivebackGiftDockHandle>(null);

  // The rail lives in the desktop sidebar, so it stays laptop-gated; the header
  // variant also serves mobile, where it's the only giveback entry point.
  const isLaptop = useViewSize(ViewSize.Laptop);
  const baseGate =
    isAuthReady && isLoggedIn && (variant === 'header' || isLaptop);
  const hasExternalFlag = isFeatureEnabled !== undefined;
  const { value: selfEnabled } = useConditionalFeature({
    feature: featureGiveback,
    shouldEvaluate: baseGate && !hasExternalFlag,
  });
  const isEnabled = hasExternalFlag ? isFeatureEnabled : selfEnabled;
  const show = baseGate && isEnabled;

  const isEstablishedUser = user?.createdAt
    ? Date.now() - new Date(user.createdAt).getTime() >
      LIVE_ACTIVITY_MIN_ACCOUNT_AGE_MS
    : false;
  const canRunLiveActivity = show && isEstablishedUser;

  if (!show) {
    return null;
  }

  const openGiveback = () => {
    logEvent({ event_name: LogEvent.ClickGivebackGiftEntry });
    // The rail passes its own anchor (with an href) as children, so it navigates
    // itself. Only the built-in header button needs an explicit push here.
    if (!children) {
      router.push(`${webappUrl}giveback`);
    }
  };

  return (
    <>
      <GivebackGiftDock
        ref={dock}
        variant={variant}
        showLabel={showLabel}
        compact={compact}
        onOpenGiveback={openGiveback}
        promptPlacement={promptPlacement}
        promptAlign={promptAlign}
      >
        {children}
      </GivebackGiftDock>
      {canRunLiveActivity && <GivebackLiveActivityListener dock={dock} />}
    </>
  );
}

export default GivebackGiftEntry;
