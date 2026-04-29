import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useShortcuts } from '../../shortcuts/contexts/ShortcutsProvider';
import { EditIcon } from '../../../components/icons/Edit';
import { PlusIcon } from '../../../components/icons/Plus';
import { ShortcutsIcon } from '../../../components/icons/Shortcuts';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { isAppleDevice } from '../../../lib/func';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { SidebarSwitchRow } from '../components/SidebarCompactRow';
import type { SidebarSegmentedOption } from '../components/SidebarSegmented';
import { SidebarSegmented } from '../components/SidebarSegmented';

type ShortcutsSource = 'manual' | 'topsites';

const SOURCE_OPTIONS: SidebarSegmentedOption<ShortcutsSource>[] = [
  { value: 'manual', label: 'My shortcuts', ariaLabel: 'Manual shortcuts' },
  { value: 'topsites', label: 'Most visited', ariaLabel: 'Top sites' },
];

export const ShortcutsSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { showTopSites, toggleShowTopSites, customLinks } =
    useSettingsContext();
  const {
    isManual,
    setIsManual,
    hasCheckedPermission,
    setShowPermissionsModal,
    topSites,
  } = useShortcuts();
  const hasCustomLinks = (customLinks?.length ?? 0) > 0;

  const shortcutCount = isManual
    ? customLinks?.length || 0
    : topSites?.length || 0;
  const source: ShortcutsSource = isManual ? 'manual' : 'topsites';

  const bookmarksKeys = useMemo<string[]>(
    () => (isAppleDevice() ? ['⌘', 'Shift', 'B'] : ['Ctrl', 'Shift', 'B']),
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
        setIsManual(false);
        const needsPermission = !hasCheckedPermission || topSites === undefined;
        if (needsPermission) {
          setShowPermissionsModal(true);
        }
        return;
      }
      setIsManual(true);
    },
    [
      hasCheckedPermission,
      logEvent,
      setIsManual,
      setShowPermissionsModal,
      source,
      topSites,
    ],
  );

  const manualStatusLabel =
    shortcutCount === 0
      ? 'No shortcuts added yet'
      : `${shortcutCount} ${shortcutCount === 1 ? 'shortcut' : 'shortcuts'}`;

  return (
    <section className="flex w-full min-w-0 flex-col gap-2.5 border-b border-border-subtlest-tertiary px-5 py-4 last:border-b-0">
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
        bold
        className="uppercase tracking-wider"
      >
        Shortcuts
      </Typography>

      <div className="flex flex-col gap-2">
        <SidebarSwitchRow
          name="newtab-customizer-shortcuts"
          icon={ShortcutsIcon}
          iconTone="neutral"
          label="Show shortcuts"
          description="Quick-access sites above your feed."
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
            <div className="flex flex-col gap-2 px-1 pt-2">
              <SidebarSegmented
                value={source}
                options={SOURCE_OPTIONS}
                onChange={onSourceChange}
              />
              {source === 'manual' ? (
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
          keyboard shortcut. */}
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
                <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-6 border border-border-subtlest-tertiary px-1.5 font-mono font-bold text-text-primary typo-caption2">
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
