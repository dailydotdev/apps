import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useConditionalFeature } from '../../../hooks';
import {
  featureNewTabMode,
  featureZenWallpapers,
} from '../../../lib/featureManagement';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import { SidebarSwitch } from '../../customizeNewTab/components/SidebarSwitch';
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
  description: string;
}

const MODULES: ModuleDef[] = [
  {
    key: 'intention',
    label: 'Intention for today',
    description: 'One line to anchor your focus. Resets every morning.',
  },
  {
    key: 'todos',
    label: 'To-do list',
    description: 'Up to five tasks. Stays on your device.',
  },
  {
    key: 'mustReads',
    label: 'Must-reads',
    description: 'Three curated posts a day. No infinite feed.',
  },
  {
    key: 'quote',
    label: 'Quote of the day',
    description: 'A short, dev-relevant quote refreshed once a day.',
  },
  {
    key: 'shortcuts',
    label: 'Shortcuts row',
    description: 'Your saved sites, right where you expect them.',
  },
  {
    key: 'weather',
    label: 'Weather',
    description:
      'Ambient temperature and conditions. Uses your IP or browser location.',
  },
];

export const ZenLayoutSection = (): ReactElement | null => {
  const { logEvent } = useLogContext();
  const { mode } = useNewTabMode();
  const { toggles, setToggle } = useZenModules();
  const { wallpaper, setWallpaperId, resetToAuto, isAuto } = useZenWallpaper();
  const { value: newTabModeVariant } = useConditionalFeature({
    feature: featureNewTabMode,
    shouldEvaluate: true,
  });
  const { value: wallpapersEnabled } = useConditionalFeature({
    feature: featureZenWallpapers,
    shouldEvaluate: toggles.wallpaper || mode === 'zen',
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

  // Hide section entirely when Zen isn't the active experience and the
  // experiment is in `control`. We still render when mode is `focus` because
  // the picker affects the pre-session Zen shell.
  if (newTabModeVariant === 'control' && mode !== 'zen' && mode !== 'focus') {
    return null;
  }

  return (
    <SidebarSection
      title="Zen layout"
      description="Choose which modules show up on your Zen homepage."
    >
      {MODULES.map((module) => (
        <SidebarSwitch
          key={module.key}
          name={`zen-${module.key}`}
          label={module.label}
          description={module.description}
          checked={toggles[module.key]}
          onToggle={() => handleModuleToggle(module.key)}
        />
      ))}
      {wallpapersEnabled ? (
        <>
          <SidebarSwitch
            name="zen-wallpaper"
            label="Ambient wallpaper"
            description="A calm gradient behind the homepage. Adjusts to time of day."
            checked={toggles.wallpaper}
            onToggle={() => handleModuleToggle('wallpaper')}
          />
          {toggles.wallpaper ? (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAuto}
                  aria-pressed={isAuto}
                  className={classNames(
                    'rounded-8 border px-2 py-1 transition-colors typo-caption1',
                    isAuto
                      ? 'border-accent-cabbage-default bg-surface-float text-text-primary'
                      : 'border-border-subtlest-tertiary text-text-tertiary hover:bg-surface-float',
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
                      onClick={() => handleWallpaperPick(option.id)}
                      aria-pressed={active}
                      aria-label={`Wallpaper: ${option.label}`}
                      title={option.label}
                      className={classNames(
                        'h-8 w-8 rounded-8 border transition-transform hover:scale-105',
                        active
                          ? 'border-accent-cabbage-default shadow-2'
                          : 'border-border-subtlest-tertiary',
                      )}
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
