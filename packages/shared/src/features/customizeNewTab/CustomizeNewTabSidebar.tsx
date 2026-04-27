import type { ReactElement } from 'react';
import React, { useEffect, useId, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { MagicIcon, MiniCloseIcon, RefreshIcon } from '../../components/icons';
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
import { FocusBlocklistSection } from '../newTab/sidebar/FocusBlocklistSection';
import { useSetRightSidebarOffset } from './store/rightSidebar.store';
import { useNewTabMode } from '../newTab/store/newTabMode.store';
import type { useCustomizeNewTab } from './useCustomizeNewTab';

export const CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX = 360;
const FIRST_SESSION_EFFECT_DURATION_MS = 10_000;

interface CustomizeNewTabSidebarProps {
  customizer: ReturnType<typeof useCustomizeNewTab>;
}

export const CustomizeNewTabSidebar = ({
  customizer,
}: CustomizeNewTabSidebarProps): ReactElement | null => {
  const { shouldRender, isOpen, isFirstSession, open, close } = customizer;
  const { logEvent } = useLogContext();
  const { showFeedbackButton, setSettings } = useSettingsContext();
  const setRightSidebarOffset = useSetRightSidebarOffset();
  const { mode, setMode } = useNewTabMode();
  const panelId = useId();
  const impressionLoggedRef = useRef(false);
  const [showFirstSessionEffects, setShowFirstSessionEffects] = useState(false);

  const handleClose = (via: 'x' | 'esc' | 'done') => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dismiss',
      extra: JSON.stringify({ via }),
    });
    close(via);
  };

  const handleOpen = () => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'rail_open',
    });
    open();
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
  useEffect(() => {
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

  // Stack the Customize pill above the Feedback pill (which sits at bottom-4)
  // so they never occlude each other. When feedback is disabled we drop the
  // gap so Customize lives at the normal bottom-4 position.
  const customizeBottomClass = showFeedbackButton ? 'bottom-20' : 'bottom-4';

  return (
    <>
      {/* First-session sidebar amplifier. Renders only on the brand-new
          user's first new tab. No popovers, no scrims — the visual energy
          lives on the sidebar itself: a glossy halo from the left edge, a
          vertical light beam, and a bouncing arrow chip pointing into the
          panel. It fades after a short moment or the first sidebar click,
          leaving the welcome message in the normal sidebar. */}
      <KeepItOverlay
        isFirstSession={isFirstSession && isOpen && showFirstSessionEffects}
        sidebarWidthPx={CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX}
      />

      {/* Floating "Customize" pill: always visible when panel is closed.
          Sized Large with a bold shadow so it reads as the dominant action
          on the new tab and never feels "hidden" behind other floating UI. */}
      {!isOpen && (
        <Button
          type="button"
          onClick={handleOpen}
          aria-expanded={false}
          aria-controls={panelId}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
          icon={<MagicIcon secondary />}
          title="Customize new tab"
          className={classNames(
            'fixed right-4 z-max shadow-3 hover:shadow-2',
            customizeBottomClass,
          )}
        >
          Customize
        </Button>
      )}

      {/* Expanded panel */}
      <aside
        id={panelId}
        role="dialog"
        aria-modal={false}
        aria-label="Customize new tab"
        aria-hidden={!isOpen}
        className={classNames(
          'fixed right-0 top-0 z-modal flex h-screen max-w-[100vw] flex-col overflow-hidden border-l transition-transform duration-200 ease-in-out',
          isFirstSession && showFirstSessionEffects
            ? 'border-border-subtlest-secondary bg-background-default shadow-2'
            : 'border-border-subtlest-tertiary bg-background-default shadow-2',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX }}
        onPointerDown={hideFirstSessionEffects}
      >
        {isFirstSession && showFirstSessionEffects ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border-subtlest-secondary"
          />
        ) : null}
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
          {isFirstSession ? (
            <FirstSessionWelcome effectsEnabled={showFirstSessionEffects} />
          ) : null}
          <NewTabModeSection />
          {mode === 'focus' ? (
            <>
              <FocusSection />
              <FocusBlocklistSection />
            </>
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
