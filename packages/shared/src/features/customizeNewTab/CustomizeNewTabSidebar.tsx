import type { ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { MiniCloseIcon, RefreshIcon } from '../../components/icons';
import {
  Typography,
  TypographyType,
} from '../../components/typography/Typography';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import {
  defaultSettings,
  useSettingsContext,
} from '../../contexts/SettingsContext';
import { AppearanceSection } from './sections/AppearanceSection';
import { ShortcutsSection } from './sections/ShortcutsSection';
import { WidgetsSection } from './sections/WidgetsSection';
import { FirstSessionWelcome } from './components/FirstSessionWelcome';
import { KeepItOverlay } from './components/KeepItOverlay';
import { NewTabModeSection } from '../newTab/sidebar/NewTabModeSection';
import { FocusSection } from '../newTab/sidebar/FocusSection';
import { useSetRightSidebarOffset } from './store/rightSidebar.store';
import { useNewTabMode } from '../newTab/store/newTabMode.store';
import type { useCustomizeNewTab } from './useCustomizeNewTab';

export const CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX = 360;
// First-session attention amplifier (the welcome card halo + rim + orb +
// shimmer animations PLUS the page-level glow column + bouncing arrow chip
// over the feed) auto-dampens after this window. Long enough for a new
// user's eye to land on the panel; short enough that the loud effects
// don't sit there competing with the rest of the UI. After it fires, the
// welcome card collapses to a flat dark gradient surface (no halo, no
// border, no orbs, no animations) and the amplifier unmounts entirely.
const FIRST_SESSION_EFFECT_DURATION_MS = 7_000;

interface CustomizeNewTabSidebarProps {
  customizer: ReturnType<typeof useCustomizeNewTab>;
}

export const CustomizeNewTabSidebar = ({
  customizer,
}: CustomizeNewTabSidebarProps): ReactElement | null => {
  const { shouldRender, isOpen, isFirstSession, hasSettledInitialOpen, close } =
    customizer;
  const { logEvent } = useLogContext();
  const { setSettings } = useSettingsContext();
  const setRightSidebarOffset = useSetRightSidebarOffset();
  const { mode, setMode } = useNewTabMode();
  const impressionLoggedRef = useRef(false);
  const [showFirstSessionEffects, setShowFirstSessionEffects] = useState(false);

  const handleClose = (via: 'x' | 'esc') => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dismiss',
      extra: JSON.stringify({ via }),
    });
    close();
  };

  const handleReset = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'reset_defaults',
    });
    // Reset both server-synced remote settings and the local new-tab mode so
    // "defaults" actually means a pristine new tab.
    setSettings(defaultSettings);
    setMode('discover');
  };

  // Expose the panel width as a global offset so the fixed header, feedback
  // button and feed layout all shift/reshape in sync with the panel.
  // `useLayoutEffect` so the offset commits before paint — pairs with the
  // auto-open layout effect in `useCustomizeNewTab` to make sure the feed
  // and floating chrome reach their resting widths in the same frame the
  // panel does, instead of a beat behind.
  useLayoutEffect(() => {
    setRightSidebarOffset(
      shouldRender && isOpen ? CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX : 0,
    );
    return () => setRightSidebarOffset(0);
  }, [shouldRender, isOpen, setRightSidebarOffset]);

  useEffect(() => {
    if (!isOpen || impressionLoggedRef.current) {
      return;
    }
    impressionLoggedRef.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CustomizeNewTab,
      extra: JSON.stringify({
        feature_name: 'newtab_customizer',
        is_first_session: isFirstSession,
      }),
    });
  }, [isOpen, isFirstSession, logEvent]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      handleClose('esc');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // handleClose is recreated each render; only re-bind on isOpen changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Drive the first-session attention amplifier. Turns on the welcome card's
  // animated layers (rim / halo / orb / shimmer / animated border) and the
  // page-level `KeepItOverlay` (glow column + bouncing arrow chip) for a
  // brand-new user's first impression, then dampens both on a 7s timer (or
  // immediately on first sidebar interaction) so the loud effects don't
  // outlast the moment that earned them. After dampening, the welcome card
  // collapses to a flat dark surface with no animations, and the amplifier
  // unmounts entirely.
  useEffect(() => {
    if (!isFirstSession || !isOpen) {
      setShowFirstSessionEffects(false);
      return undefined;
    }

    setShowFirstSessionEffects(true);
    const timer = window.setTimeout(
      () => setShowFirstSessionEffects(false),
      FIRST_SESSION_EFFECT_DURATION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [isFirstSession, isOpen]);

  const hideFirstSessionEffects = () => {
    setShowFirstSessionEffects(false);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* First-session sidebar amplifier — a glowing column + bouncing
          arrow chip painted over the feed side of the sidebar's left edge.
          Lives as long as `showFirstSessionEffects` is on (7s timer + the
          panel pointer-down handler dismiss it early). After that the
          column glow and arrow chip unmount entirely; the welcome card
          stays but flattens (see `FirstSessionWelcome.effectsEnabled`). */}
      <KeepItOverlay
        isFirstSession={isFirstSession && isOpen && showFirstSessionEffects}
        sidebarWidthPx={CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX}
      />

      {/* Expanded panel. The native `<aside>` carries an implicit
          `complementary` role, which is the right semantics for this
          side-by-side settings rail. We deliberately don't use
          `role="dialog"`: the panel is non-modal (feed stays interactive,
          no focus trap), and `aria-modal={false}` on a dialog is a
          confusing signal to AT.

          There is no longer a floating "Customize" pill on the new tab —
          first-session users get the auto-open onboarding, and returning
          users open the customizer from the profile dropdown's
          "Customize new tab" entry (which bumps `useRequestCustomizerOpen`
          and lands here). The standalone pill cluttered the corner next
          to Feedback / scroll-to-top without earning its space. */}
      <aside
        aria-label="Customize new tab"
        aria-hidden={!isOpen}
        className={classNames(
          'fixed right-0 top-0 z-modal flex h-screen max-w-[100vw] flex-col overflow-hidden border-l border-border-subtlest-tertiary bg-background-default shadow-2',
          // Skip the slide transition on the very first paint so a
          // first-session auto-open snaps to its open position without
          // animating in (which previously felt jarring + caused a layout
          // shift). Subsequent open / close animate normally.
          hasSettledInitialOpen &&
            'transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX }}
        onPointerDown={hideFirstSessionEffects}
      >
        {/* Header height matches `MainLayoutHeader` exactly (`h-14` mobile /
            `laptop:h-16` laptop) so the bottom border of the sidebar header
            sits on the same horizontal line as the feed header — the user
            never sees a one-off step between the two.

            Reset lives here (not in a footer) because every setting in this
            panel writes through immediately — there's no draft state to
            commit, so a "Done" button would only fake confirmation. The
            close X is canonical for dismiss; Reset is paired with it so the
            two destructive/lifecycle actions sit together. */}
        <header className="relative flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-5 laptop:h-16">
          <Typography type={TypographyType.Body} bold>
            {isFirstSession ? 'Welcome' : 'Customize'}
          </Typography>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<RefreshIcon />}
              aria-label="Reset to defaults"
              title="Reset to defaults"
              onClick={handleReset}
            />
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<MiniCloseIcon />}
              aria-label="Close customize sidebar"
              title="Close"
              onClick={() => handleClose('x')}
            />
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto py-2">
          {isFirstSession ? (
            <FirstSessionWelcome
              effectsEnabled={isOpen && showFirstSessionEffects}
            />
          ) : null}
          <NewTabModeSection />
          {mode === 'focus' ? (
            <FocusSection />
          ) : (
            <>
              <AppearanceSection />
              <ShortcutsSection />
              <WidgetsSection />
            </>
          )}
        </div>
      </aside>
    </>
  );
};
