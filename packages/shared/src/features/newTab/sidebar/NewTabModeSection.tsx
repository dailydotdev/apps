import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import type { NewTabMode } from '../store/newTabMode.store';
import { useNewTabMode } from '../store/newTabMode.store';

interface ModeOption {
  value: NewTabMode;
  label: string;
  description: string;
  preview: ReactElement;
}

// A tiny representational preview for each mode. No real data — these only
// need to communicate "calm homepage" vs "busy feed" at a glance.
const ZenPreview = (): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-8 bg-surface-float px-3 py-2">
    <div className="h-1.5 w-8 rounded-full bg-text-tertiary" />
    <div className="h-1 w-12 rounded-full bg-text-quaternary" />
    <div className="mt-1 flex gap-1">
      <div className="h-3 w-4 rounded-4 bg-surface-secondary" />
      <div className="h-3 w-4 rounded-4 bg-surface-secondary" />
      <div className="h-3 w-4 rounded-4 bg-surface-secondary" />
    </div>
  </div>
);

const FocusPreview = (): ReactElement => (
  <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-8 bg-surface-float px-3 py-2">
    <div className="h-3 w-14 rounded-4 bg-accent-cabbage-default" />
    <div className="h-1 w-10 rounded-full bg-text-quaternary" />
    <div className="mt-1 h-1.5 w-6 rounded-full bg-text-tertiary" />
  </div>
);

const DiscoverPreview = (): ReactElement => (
  <div className="flex flex-1 flex-col gap-1 rounded-8 bg-surface-float px-3 py-2">
    <div className="flex gap-1">
      <div className="h-4 flex-1 rounded-4 bg-surface-secondary" />
      <div className="h-4 flex-1 rounded-4 bg-surface-secondary" />
    </div>
    <div className="flex gap-1">
      <div className="h-4 flex-1 rounded-4 bg-surface-secondary" />
      <div className="h-4 flex-1 rounded-4 bg-surface-secondary" />
    </div>
    <div className="flex gap-1">
      <div className="h-4 flex-1 rounded-4 bg-surface-secondary" />
      <div className="h-4 flex-1 rounded-4 bg-surface-secondary" />
    </div>
  </div>
);

const options: ModeOption[] = [
  {
    value: 'zen',
    label: 'Zen',
    description:
      'A calm homepage with a clock, an intention, your tasks, and just three must-reads. No infinite feed until you ask for it.',
    preview: <ZenPreview />,
  },
  {
    value: 'focus',
    label: 'Focus',
    description:
      'Commit to a single block of deep work. A timer replaces the feed until you finish or end the session.',
    preview: <FocusPreview />,
  },
  {
    value: 'discover',
    label: 'Discover',
    description:
      'The classic daily.dev feed. Endless posts, shortcuts, widgets. Best when you want to browse.',
    preview: <DiscoverPreview />,
  },
];

export const NewTabModeSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { mode, setMode } = useNewTabMode();

  const onSelect = useCallback(
    (next: NewTabMode) => {
      if (next === mode) {
        return;
      }
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'new_tab_mode',
        extra: JSON.stringify({ mode: next }),
      });
      setMode(next);
    },
    [logEvent, mode, setMode],
  );

  return (
    <SidebarSection
      title="New tab mode"
      description="Pick what every new tab feels like. You can switch any time."
    >
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const selected = option.value === mode;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              aria-pressed={selected}
              className={classNames(
                'flex gap-3 rounded-12 border p-3 text-left transition-colors',
                selected
                  ? 'border-accent-cabbage-default bg-surface-float'
                  : 'border-border-subtlest-tertiary hover:bg-surface-float',
              )}
            >
              <div className="flex h-16 w-20 shrink-0">{option.preview}</div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Typography type={TypographyType.Callout} bold>
                  {option.label}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {option.description}
                </Typography>
              </div>
            </button>
          );
        })}
      </div>
    </SidebarSection>
  );
};
