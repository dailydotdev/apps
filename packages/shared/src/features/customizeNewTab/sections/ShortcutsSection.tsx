import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useShortcuts } from '../../shortcuts/contexts/ShortcutsProvider';
import { EditIcon, PlusIcon, ShortcutsIcon } from '../../../components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { isAppleDevice } from '../../../lib/func';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { SidebarSwitchRow } from '../components/SidebarCompactRow';
import {
  SidebarSegmented,
  type SegmentedOption,
} from '../components/SidebarSegmented';

type ShortcutsSource = 'manual' | 'topsites';

const SOURCE_OPTIONS: SegmentedOption<ShortcutsSource>[] = [
  { value: 'manual', label: 'My shortcuts' },
  { value: 'topsites', label: 'Most visited' },
];

export const ShortcutsSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { showTopSites, toggleShowTopSites, customLinks } =
    useSettingsContext();
  const {
    hasCheckedPermission,
    setShowPermissionsModal,
    topSites,
    isManual,
    setSourceManual,
  } = useShortcuts();
  const hasCustomLinks = (customLinks?.length ?? 0) > 0;

  // Whatever the user actually sees on the new tab — manual links take
  // precedence, otherwise we count the top-sites pulled in via the Chrome
  // permission. Surfacing the count makes the toggle's effect tangible.
  const shortcutCount = isManual
    ? customLinks?.length || 0
    : topSites?.length || 0;

  const source: ShortcutsSource = isManual ? 'manual' : 'topsites';

  // Render the bookmarks-bar shortcut in the user's native modifier glyph
  // so the hint matches what the host browser expects. We can't toggle the
  // bookmarks bar from an extension (no cross-browser API for it), so the
  // best we can do is teach the keyboard shortcut.
  const bookmarksKeys = useMemo<string[]>(
    () => (isAppleDevice() ? ['\u2318', 'Shift', 'B'] : ['Ctrl', 'Shift', 'B']),
    [],
  );

  const onToggle = useCallback(() => {
    const nextValue = !showTopSites;

    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'show_top_sites',
      extra: JSON.stringify({ enabled: nextValue }),
    });

    if (nextValue && !hasCheckedPermission && !hasCustomLinks) {
      setShowPermissionsModal(true);
      return;
    }

    toggleShowTopSites();
  }, [
    hasCheckedPermission,
    hasCustomLinks,
    logEvent,
    setShowPermissionsModal,
    showTopSites,
    toggleShowTopSites,
  ]);

  const onEditShortcuts = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'edit_shortcuts',
    });
    openModal({ type: LazyModal.CustomLinks });
  }, [logEvent, openModal]);

  const onSourceChange = useCallback(
    (next: ShortcutsSource) => {
      if (next === source) {
        return;
      }
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'shortcuts_source',
        extra: JSON.stringify({ source: next }),
      });

      if (next === 'topsites') {
        // Record the preference up front so `useShortcutLinks` flips the
        // feed to top sites immediately — it now honours `sourcePreference`
        // and won't keep showing custom links just because they're saved.
        setSourceManual(false);
        // Switching to Most Visited needs the browser permission. Re-prompt
        // when we've never asked OR when a previous attempt failed (Chrome
        // returns `topSites === undefined` after a denial), otherwise the
        // toggle would flip silently and the feed would stay empty without
        // ever giving the user a way to grant access.
        const needsPermission = !hasCheckedPermission || topSites === undefined;
        if (needsPermission) {
          setShowPermissionsModal(true);
        }
        return;
      }
      // Switching to My shortcuts surfaces the user's saved custom links.
      // Custom links are preserved across toggles — `sourcePreference`
      // controls visibility, not persistence — so flipping back to Most
      // Visited later still has the same list available behind the scenes.
      setSourceManual(true);
    },
    [
      hasCheckedPermission,
      logEvent,
      setShowPermissionsModal,
      setSourceManual,
      source,
      topSites,
    ],
  );

  // We use the standard SidebarSection title — the Edit action lives
  // contextually next to "My shortcuts" status (where it actually applies)
  // instead of in the section header, where it would either always be
  // visible (confusing when the toggle is off) or appear/disappear with
  // the section title (jumpy).
  const manualStatusLabel =
    shortcutCount === 0
      ? 'No shortcuts added yet'
      : `${shortcutCount} ${shortcutCount === 1 ? 'shortcut' : 'shortcuts'}`;

  return (
    <section
      className={classNames(
        'flex w-full min-w-0 flex-col gap-2.5 px-5 py-4',
        'border-b border-border-subtlest-tertiary last:border-b-0',
      )}
    >
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
        bold
        className="uppercase tracking-wider"
      >
        Shortcuts
      </Typography>

      <div className="flex flex-col gap-1">
        <SidebarSwitchRow
          name="newtab-customizer-shortcuts"
          label="Show shortcuts"
          description="Quick-access sites above your feed."
          icon={ShortcutsIcon}
          iconTone="neutral"
          checked={showTopSites}
          onToggle={onToggle}
        />

        {/* Smooth fall-down for the source picker + status row so the
            section doesn't snap when the toggle flips. */}
        <div
          className={classNames(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            showTopSites ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div
            className={classNames(
              'min-h-0 overflow-hidden',
              showTopSites ? 'visible' : 'invisible',
            )}
          >
            <div className="flex flex-col gap-2 px-2 pt-2">
              <SidebarSegmented
                value={source}
                options={SOURCE_OPTIONS}
                onChange={onSourceChange}
                ariaLabel="Shortcuts source"
              />
              {source === 'manual' ? (
                // Action sits on the LEFT and the status follows on the
                // right so the user reads "do this → here's the current
                // state" instead of having to find a small button at the
                // end of a status string. `Float` keeps the row visually
                // quiet inside the sidebar — Secondary's bordered chip
                // read as too dominant for a small utility action — while
                // the leading icon (plus when empty, pencil when editing)
                // makes the affordance obvious without a heavier border.
                <div className="flex min-w-0 items-center gap-2 px-1">
                  <Button
                    type="button"
                    variant={ButtonVariant.Float}
                    size={ButtonSize.Small}
                    icon={shortcutCount > 0 ? <EditIcon /> : <PlusIcon />}
                    onClick={onEditShortcuts}
                    aria-label={
                      shortcutCount > 0 ? 'Edit shortcuts' : 'Add shortcuts'
                    }
                    className="shrink-0"
                  >
                    {shortcutCount > 0 ? 'Edit' : 'Add'}
                  </Button>
                  <Typography
                    type={TypographyType.Caption1}
                    color={TypographyColor.Tertiary}
                    className="min-w-0 truncate"
                  >
                    {manualStatusLabel}
                  </Typography>
                </div>
              ) : (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  className="px-1"
                >
                  Pulled automatically from your browsing history.
                </Typography>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* No browser exposes an extension API to toggle the bookmarks bar,
          so the useful action here is a clear flat tip with the actual
          keyboard shortcut on its own line so it can never push past the
          panel edge. */}
      <aside className="flex min-w-0 px-1 pt-1">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
          >
            Bookmarks bar
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            className="break-words"
          >
            Don&apos;t see your bookmarks bar? Toggle it in your browser with:
          </Typography>
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {bookmarksKeys.map((key, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <React.Fragment key={`${key}-${index}`}>
                <kbd
                  className={classNames(
                    'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-6 px-1.5',
                    'border border-border-subtlest-tertiary font-mono font-bold text-text-primary typo-caption2',
                  )}
                >
                  {key}
                </kbd>
                {index < bookmarksKeys.length - 1 ? (
                  <span className="text-text-quaternary typo-caption2">+</span>
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
};
