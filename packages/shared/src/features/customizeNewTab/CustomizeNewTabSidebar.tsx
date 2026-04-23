import type { ReactElement } from 'react';
import React, { useEffect, useId, useRef } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { MagicIcon, MiniCloseIcon } from '../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { AppearanceSection } from './sections/AppearanceSection';
import { ShortcutsSection } from './sections/ShortcutsSection';
import { WidgetsSection } from './sections/WidgetsSection';
import { useSetRightSidebarOffset } from './store/rightSidebar.store';
import type { useCustomizeNewTab } from './useCustomizeNewTab';

export const CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX = 360;

interface CustomizeNewTabSidebarProps {
  customizer: ReturnType<typeof useCustomizeNewTab>;
}

export const CustomizeNewTabSidebar = ({
  customizer,
}: CustomizeNewTabSidebarProps): ReactElement | null => {
  const { shouldRender, isOpen, open, close } = customizer;
  const { logEvent } = useLogContext();
  const { showFeedbackButton } = useSettingsContext();
  const setRightSidebarOffset = useSetRightSidebarOffset();
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
      }),
    });
  }, [isOpen, logEvent]);

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
        aria-label="Make this tab yours"
        aria-hidden={!isOpen}
        className={classNames(
          'fixed right-0 top-0 z-modal flex h-screen max-w-[100vw] flex-col border-l border-border-subtlest-tertiary bg-background-default shadow-2 transition-transform duration-200 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: CUSTOMIZE_NEW_TAB_PANEL_WIDTH_PX }}
      >
        <header className="flex items-start justify-between gap-2 border-b border-border-subtlest-tertiary px-5 pb-4 pt-5">
          <div className="flex flex-col gap-1">
            <Typography type={TypographyType.Title3} bold>
              Make this tab yours
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Tune the look, pick what shows up on every new tab, and make
              daily.dev feel like home. You can change any of this later in
              Settings.
            </Typography>
          </div>
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

        <div className="flex-1 overflow-y-auto">
          <AppearanceSection />
          <ShortcutsSection />
          <WidgetsSection />
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-border-subtlest-tertiary px-5 py-4">
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
