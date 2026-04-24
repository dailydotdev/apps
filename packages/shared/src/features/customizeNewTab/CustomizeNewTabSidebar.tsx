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
import { NewTabModeSection } from '../newTab/sidebar/NewTabModeSection';
import { ZenLayoutSection } from '../newTab/sidebar/ZenLayoutSection';
import { FocusSessionsSection } from '../newTab/sidebar/FocusSessionsSection';
import { FocusBlocklistSection } from '../newTab/sidebar/FocusBlocklistSection';
import { useSetRightSidebarOffset } from './store/rightSidebar.store';
import { useNewTabMode } from '../newTab/store/newTabMode.store';
import { resetZenModulesForReset } from '../newTab/store/zenModules.store';
import type { useCustomizeNewTab } from './useCustomizeNewTab';

export const CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX = 360;

interface CustomizeNewTabSidebarProps {
  customizer: ReturnType<typeof useCustomizeNewTab>;
}

export const CustomizeNewTabSidebar = ({
  customizer,
}: CustomizeNewTabSidebarProps): ReactElement | null => {
  const {
    shouldRender,
    isOpen,
    isFirstSession: realIsFirstSession,
    open,
    close,
  } = customizer;

  // TEMP: local-only toggle so we can flip between the first-session hero and
  // the default sidebar without wiping server actions or creating fake users.
  // Remove once we've validated the first-session experience end-to-end.
  const [firstSessionOverride, setFirstSessionOverride] = useState<
    boolean | null
  >(null);
  const isFirstSession = firstSessionOverride ?? realIsFirstSession;
  const { logEvent } = useLogContext();
  const { showFeedbackButton, setSettings } = useSettingsContext();
  const setRightSidebarOffset = useSetRightSidebarOffset();
  const { setMode } = useNewTabMode();
  const panelId = useId();
  const impressionLoggedRef = useRef(false);

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
    resetZenModulesForReset();
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

  if (!shouldRender) {
    return null;
  }

  // Stack the Customize pill above the Feedback pill (which sits at bottom-4)
  // so they never occlude each other. When feedback is disabled we drop the
  // gap so Customize lives at the normal bottom-4 position.
  const customizeBottomClass = showFeedbackButton ? 'bottom-20' : 'bottom-4';

  return (
    <>
      {/* TEMP: dev-only toggle for the first-session welcome. Pinned to the
          top center of the viewport so it can't be covered by the left nav
          rail or the right customize panel. Intentionally loud (bacon →
          cabbage gradient, white ring, bold label) so it's unmissable while
          we're QA'ing the experience. Remove this block once the welcome is
          approved. */}
      <button
        type="button"
        onClick={() => setFirstSessionOverride(!isFirstSession)}
        className="fixed left-1/2 top-3 z-max flex -translate-x-1/2 items-center gap-2 rounded-12 bg-gradient-to-br from-accent-bacon-default to-accent-cabbage-default px-4 py-2.5 font-bold text-white shadow-2 ring-2 ring-white/30 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-cabbage-default typo-footnote"
        title="Local toggle — flips the first-session welcome on/off"
      >
        <span
          className={classNames(
            'inline-block h-2.5 w-2.5 rounded-full',
            isFirstSession ? 'bg-white' : 'bg-white/40',
          )}
          aria-hidden
        />
        First session: {isFirstSession ? 'ON' : 'OFF'} · click to toggle
      </button>

      {/* Floating "Customize" pill: always visible when panel is closed. */}
      {!isOpen && (
        <Button
          type="button"
          onClick={handleOpen}
          aria-expanded={false}
          aria-controls={panelId}
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          icon={<MagicIcon secondary />}
          title="Customize new tab"
          className={classNames(
            'fixed right-4 z-max shadow-2',
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
          'fixed right-0 top-0 z-modal flex h-screen max-w-[100vw] flex-col border-l border-border-subtlest-tertiary bg-background-default shadow-2 transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX }}
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtlest-tertiary px-5 py-3">
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

        <div className="flex-1 overflow-y-auto py-2">
          {isFirstSession ? <FirstSessionWelcome /> : null}
          <NewTabModeSection />
          <ZenLayoutSection />
          <FocusSessionsSection />
          <AppearanceSection />
          <ShortcutsSection />
          <WidgetsSection />
          <FocusBlocklistSection />
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border-subtlest-tertiary px-5 py-3">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<RefreshIcon />}
            onClick={handleReset}
            title="Reset all customizations to their defaults"
          >
            Reset to defaults
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
