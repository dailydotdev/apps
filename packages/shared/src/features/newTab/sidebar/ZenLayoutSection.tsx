import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import {
  BriefIcon,
  ChecklistAIcon,
  FeatherIcon,
  ImageIcon,
  ItalicIcon,
  ShortcutsIcon,
  SunIcon,
} from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks';
import { featureZenWallpapers } from '../../../lib/featureManagement';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import {
  SidebarSwitchRow,
  type SidebarRowIcon,
} from '../../customizeNewTab/components/SidebarCompactRow';
import { useNewTabMode } from '../store/newTabMode.store';
import {
  useZenModules,
  type ZenModuleToggles,
} from '../store/zenModules.store';
import { useZenWallpaper } from '../zen/ZenBackground';
import { ZEN_WALLPAPERS } from '../zen/zenWallpapers';

interface ModuleDef {
  key: keyof ZenModuleToggles;
  label: string;
  icon: SidebarRowIcon;
}

const MODULES: ModuleDef[] = [
  { key: 'mustReads', label: 'Daily briefing', icon: BriefIcon },
  { key: 'shortcuts', label: 'Shortcuts', icon: ShortcutsIcon },
  { key: 'intention', label: 'Intention', icon: FeatherIcon },
  { key: 'todos', label: 'To-do list', icon: ChecklistAIcon },
  { key: 'quote', label: 'Quote of the day', icon: ItalicIcon },
  { key: 'weather', label: 'Weather', icon: SunIcon },
];

const swatchClass = (active: boolean): string =>
  classNames(
    'h-6 w-6 rounded-8 transition-transform hover:scale-110',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default focus-visible:ring-offset-2 focus-visible:ring-offset-background-default',
    active
      ? 'ring-2 ring-accent-cabbage-default ring-offset-2 ring-offset-background-default'
      : 'ring-1 ring-border-subtlest-tertiary',
  );

export const ZenLayoutSection = (): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { mode } = useNewTabMode();
  const { toggles, setToggle } = useZenModules();
  const { wallpaper, setWallpaperId, resetToAuto, isAuto } = useZenWallpaper();
  const { value: wallpapersEnabled } = useConditionalFeature({
    feature: featureZenWallpapers,
    shouldEvaluate: mode === 'zen',
  });

  const handleModuleToggle = useCallback(
    (key: keyof ZenModuleToggles) => {
      const next = !toggles[key];
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: `zen_module_${key}`,
        extra: JSON.stringify({ enabled: next }),
      });
      setToggle(key, next);
    },
    [toggles, setToggle, logEvent],
  );

  const handleWallpaperPick = useCallback(
    (id: string) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'zen_wallpaper_pick',
        extra: JSON.stringify({ wallpaper_id: id }),
      });
      setWallpaperId(id);
    },
    [logEvent, setWallpaperId],
  );

  const handleAuto = useCallback(() => {
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'zen_wallpaper_auto',
    });
    resetToAuto();
  }, [logEvent, resetToAuto]);

  if (mode !== 'zen') {
    return null;
  }

  return (
    <SidebarSection title="Layout">
      {MODULES.map((module) => (
        <SidebarSwitchRow
          key={module.key}
          name={`zen-${module.key}`}
          label={module.label}
          icon={module.icon}
          checked={toggles[module.key]}
          onToggle={() => handleModuleToggle(module.key)}
        />
      ))}
      {wallpapersEnabled ? (
        <>
          <SidebarSwitchRow
            name="zen-wallpaper"
            label="Wallpaper"
            icon={ImageIcon}
            checked={toggles.wallpaper}
            onToggle={() => handleModuleToggle('wallpaper')}
          />
          {toggles.wallpaper ? (
            <div className="flex flex-col gap-1.5 px-2 pt-1">
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                Choose a background
              </Typography>
              <div
                role="radiogroup"
                aria-label="Wallpaper"
                className="flex flex-wrap items-center gap-2"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={isAuto}
                  onClick={handleAuto}
                  className={classNames(
                    'rounded-8 px-2 py-1 transition-colors typo-caption1',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
                    isAuto
                      ? 'bg-surface-float text-text-primary ring-1 ring-border-subtlest-tertiary'
                      : 'text-text-tertiary hover:bg-surface-float hover:text-text-primary',
                  )}
                >
                  Auto
                </button>
                {ZEN_WALLPAPERS.map((option) => {
                  const active = !isAuto && option.id === wallpaper.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => handleWallpaperPick(option.id)}
                      aria-label={`Wallpaper: ${option.label}`}
                      title={option.label}
                      className={swatchClass(active)}
                      style={{ background: option.gradient }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </SidebarSection>
  );
};
