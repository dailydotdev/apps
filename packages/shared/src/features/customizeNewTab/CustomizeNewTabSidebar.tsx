import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import {
  Typography,
  TypographyType,
} from '../../components/typography/Typography';
import { MagicIcon } from '../../components/icons/Magic';
import { MiniCloseIcon } from '../../components/icons/MiniClose';
import {
  CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX,
  useCustomizeNewTab,
} from './CustomizeNewTabContext';
import { FirstSessionWelcome } from './components/FirstSessionWelcome';
import { KeepItOverlay } from './components/KeepItOverlay';
import { NewTabModeSection } from './sections/NewTabModeSection';
import { AppearanceSection } from './sections/AppearanceSection';
import { ShortcutsSection } from './sections/ShortcutsSection';
import { WidgetsSection } from './sections/WidgetsSection';
import { FocusSection } from './sections/FocusSection';
import { normaliseNewTabMode } from './lib/newTabMode';

export { CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX } from './CustomizeNewTabContext';

const PANEL_ID = 'customize-new-tab-panel';

const useImpressionLog = (isOpen: boolean, isFirstSession: boolean): void => {
  const { logEvent } = useLogContext();
  const loggedRef = useRef(false);
  useEffect(() => {
    if (!isOpen || loggedRef.current) {
      return;
    }
    loggedRef.current = true;
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.CustomizeNewTab,
      extra: JSON.stringify({
        feature_name: 'newtab_customizer',
        is_first_session: isFirstSession,
      }),
    });
  }, [isOpen, isFirstSession, logEvent]);
};

export const CustomizeNewTabSidebar = (): ReactElement | null => {
  const { isEnabled, isOpen, open, close, reset, isFirstSession } =
    useCustomizeNewTab();
  const { flags } = useSettingsContext();
  const { logEvent } = useLogContext();
  const panelRef = useRef<HTMLElement>(null);
  const mode = normaliseNewTabMode(flags?.newTabMode);

  useImpressionLog(isOpen, isFirstSession);

  useEffect(() => {
    panelRef.current?.toggleAttribute('inert', !isOpen);
  }, [isOpen]);

  // Animations stay running for the entire panel-open of a first-session
  // user — they only stop when the panel closes. The welcome only happens
  // once per user; the Context's `close` records `SeenKeepItOverlay` on
  // every close path so the second open lands clean.
  const showFirstSessionEffects = isFirstSession && isOpen;

  if (!isEnabled) {
    return null;
  }

  const handleOpenFromPill = () => {
    open();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'rail_open',
    });
  };

  const handleClose = (via: 'x' | 'esc' | 'done') => {
    close();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'dismiss',
      extra: JSON.stringify({ via }),
    });
  };

  const handleReset = () => {
    reset();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'reset_defaults',
    });
  };

  return (
    <>
      {/* First-session sidebar amplifier — a glowing column + bouncing
          arrow chip painted over the feed at the panel's left edge.
          Lives only while the welcome card is also amplifying so the
          two read as one coordinated visual beat. */}
      <KeepItOverlay
        isFirstSession={isFirstSession && isOpen && showFirstSessionEffects}
        sidebarWidthPx={CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX}
      />
      {!isOpen && (
        <button
          type="button"
          aria-expanded={false}
          aria-controls={PANEL_ID}
          onClick={handleOpenFromPill}
          className="focus-outline fixed bottom-4 right-4 z-popup flex items-center gap-2 rounded-32 border border-border-subtlest-tertiary bg-background-default px-4 py-2 text-text-primary shadow-2 typo-footnote hover:bg-surface-hover"
        >
          <MagicIcon />
          <span>Customize</span>
        </button>
      )}
      <aside
        id={PANEL_ID}
        ref={panelRef}
        role="dialog"
        aria-modal={false}
        aria-label="Customize new tab"
        aria-hidden={!isOpen}
        style={{ width: CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX }}
        className={classNames(
          'fixed inset-y-0 right-0 z-modal flex flex-col border-l border-border-subtlest-tertiary bg-background-default shadow-2 transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header height matches `MainLayoutHeader` (`h-14` mobile,
            `laptop:h-16`) so the bottom border lines up with the feed
            header's. */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-5 laptop:h-16">
          <Typography type={TypographyType.Body} bold>
            {isFirstSession ? 'Welcome' : 'Customize'}
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MiniCloseIcon />}
            aria-label="Close customize new tab"
            onClick={() => handleClose('x')}
          />
        </header>
        <div className="flex-1 overflow-y-auto">
          {isFirstSession && (
            <FirstSessionWelcome
              effectsEnabled={isOpen && showFirstSessionEffects}
            />
          )}
          <NewTabModeSection />
          {mode === 'discover' ? (
            <>
              <AppearanceSection />
              <ShortcutsSection />
              <WidgetsSection />
            </>
          ) : (
            <FocusSection />
          )}
        </div>
        <footer className="flex items-center justify-between gap-2 border-t border-border-subtlest-tertiary px-4 py-3">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={handleReset}
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
