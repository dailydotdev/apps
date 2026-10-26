import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case } from '../../parts';
import { StateRow } from '../review';
import type { StreakScene } from '../streakWidget';
import { StreakWidget } from '../streakWidget';
import { WidgetPage } from '../widgetPage';

const meta: Meta = {
  title: 'Hero Cover/Final/5. Widgets/Streak',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const groups: {
  title: string;
  note: string;
  rows: { scene: StreakScene; title: string; note?: string }[];
}[] = [
  {
    title: 'Before a streak',
    note: 'A reader with nothing yet, and the first day.',
    rows: [
      {
        scene: 'none',
        title: 'No streak yet',
        note: 'Production: “Read a post to start your reading streak.” The flame waits, greyed.',
      },
      { scene: 'dayOne', title: 'Day one' },
    ],
  },
  {
    title: 'Today, before reading',
    note: 'useStreakRingState: pending with more than 6 hours left, at risk under 6 (amber), critical under 2 (red, pulsing). The action appears once it is urgent.',
    rows: [
      { scene: 'pending', title: 'Not read yet today' },
      { scene: 'atRisk', title: 'At risk: ends tonight' },
      { scene: 'critical', title: 'Last chance' },
    ],
  },
  {
    title: 'Today, after reading',
    note: 'The quiet everyday state, and the moment the read lands.',
    rows: [
      {
        scene: 'safe',
        title: 'Read today',
        note: 'No status to show, so the date and timezone take the line.',
      },
      {
        scene: 'extended',
        title: 'Streak extended',
        note: 'The 700 ms celebration production plays when today flips to read.',
      },
    ],
  },
  {
    title: 'Rest days and freezes',
    note: 'Weekends are auto-frozen (which days follow the week start). Freezes cover other days off; they need Cores and cap at 5.',
    rows: [
      { scene: 'restDay', title: 'Weekend rest day' },
      {
        scene: 'usedFreeze',
        title: 'A freeze saved yesterday',
        note: 'Yesterday is a gap in the calendar, and the freeze meter is empty.',
      },
      { scene: 'noFreezes', title: 'No freezes left' },
    ],
  },
  {
    title: 'Broken, and restoring it',
    note: 'StreakRecoverModal’s cases, brought into the widget. The server decides the restore window; after it, the streak starts over.',
    rows: [
      { scene: 'brokenFree', title: 'First restore is free' },
      { scene: 'brokenCores', title: 'Restore with Cores' },
      { scene: 'brokenNoCores', title: 'Not enough Cores' },
      { scene: 'brokenExpired', title: 'Too late to restore' },
    ],
  },
  {
    title: 'Milestones',
    note: 'The server’s showStreakMilestone alert decides when; a record beats a milestone (current ≥ longest).',
    rows: [
      { scene: 'newRecord', title: 'New record' },
      { scene: 'milestone', title: 'Milestone' },
    ],
  },
  {
    title: 'Settings and system',
    note: 'The edges around the streak itself.',
    rows: [
      {
        scene: 'timezone',
        title: 'Timezone mismatch',
        note: 'Production warns when the streak’s timezone differs from the device; Ignore is remembered.',
      },
      {
        scene: 'optedOut',
        title: 'Streaks turned off',
        note: 'Show reading streaks off in settings: the panel is quests only, as production’s v2 panel does.',
      },
      { scene: 'loading', title: 'Loading' },
    ],
  },
];

export const Streak: StoryObj = {
  name: 'Streak',
  render: () => (
    <WidgetPage
      title="Streak"
      kinds={[
        {
          kind: 'streak',
          label: 'Every size',
          note: 'The v2 streak panel at widget scale: the count, the 30-day calendar production uses, today’s goal and freezes, and quests on Large. The flame and its level name come from the milestone-rewards ladder (3 Spark … 365 Legendary); production has no streak levels yet, so they are a proposal.',
        },
      ]}
    >
      {groups.map((group) => (
        <Case key={group.title} title={group.title} note={group.note}>
          <div className="flex flex-col gap-8">
            {group.rows.map((row) => (
              <StateRow
                key={row.scene}
                title={row.title}
                note={row.note}
                render={(size) => (
                  <StreakWidget size={size} scene={row.scene} />
                )}
              />
            ))}
          </div>
        </Case>
      ))}
    </WidgetPage>
  ),
};
