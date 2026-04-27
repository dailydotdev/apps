import type { ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
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
import { NewTabModeSection } from '../newTab/sidebar/NewTabModeSection';
import { FocusSection } from '../newTab/sidebar/FocusSection';
import { useSetRightSidebarOffset } from './store/rightSidebar.store';
import { useNewTabMode } from '../newTab/store/newTabMode.store';
import type { useCustomizeNewTab } from './useCustomizeNewTab';

export const CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX = 360;

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

  const handleClose = (via: 'x' | 'esc' | 'done') => {
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

  if (!shouldRender) {
    return null;
  }

  return (
    <>
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
      >
        {/* Header height matches `MainLayoutHeader` exactly (`h-14` mobile /
            `laptop:h-16` laptop) so the bottom border of the sidebar header
            sits on the same horizontal line as the feed header — the user
            never sees a one-off step between the two. */}
        <header className="relative flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-5 laptop:h-16">
          <Typography type={TypographyType.Body} bold>
            {isFirstSession ? 'Welcome' : 'Customize'}
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MiniCloseIcon />}
            aria-label="Close customize sidebar"
            title="Close"
            onClick={() => handleClose('x')}
          />
        </header>

        <div className="relative flex-1 overflow-y-auto py-2">
          {isFirstSession ? <FirstSessionWelcome /> : null}
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

        <footer className="relative flex shrink-0 items-center justify-between gap-3 border-t border-border-subtlest-tertiary px-5 py-3">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<RefreshIcon />}
            onClick={handleReset}
            title="Reset"
          >
            Reset
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={() => handleClose('done')}
          >
            Done
          </Button>
        </footer>
      </aside>
    </>
  );
};
