import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { RailRegion } from './mockSidebar';
import { CoachCard, DemoStage, REGION_ANCHORS } from './mockSidebar';

type PillId = 'squads' | 'streak' | 'dock';

interface NewPill {
  id: PillId;
  region: RailRegion;
  position: CSSProperties;
  title: string;
  body: string;
}

const MAX_SESSIONS = 3;

// Pill offsets are eyeballed against the mock rail's own spacing: the tabs
// anchor sits at the middle of the four-tab stack, the dock anchor at the
// middle of the pin column.
const NEW_PILLS: NewPill[] = [
  {
    id: 'squads',
    region: 'tabs',
    position: { top: REGION_ANCHORS.tabs + 15, left: 38 },
    title: 'Squads moved here',
    body: 'Squads used to live in the old sidebar list. Same squads, new home.',
  },
  {
    id: 'streak',
    region: 'tabs',
    position: { top: REGION_ANCHORS.tabs + 60, left: 38 },
    title: 'Streak has its own tab',
    body: 'Your reading streak and quests moved out of the header into the rail.',
  },
  {
    id: 'dock',
    region: 'dock',
    position: { top: REGION_ANCHORS.dock - 62, left: 38 },
    title: 'This is your shortcuts dock',
    body: 'Pinned pages like Tags and Bookmarks now sit under the rail.',
  },
];

const NewPillsDemo = (): JSX.Element => {
  const [session, setSession] = useState(1);
  const [hoveredSessions, setHoveredSessions] = useState<
    Partial<Record<PillId, number>>
  >({});
  const [activePill, setActivePill] = useState<PillId | null>(null);

  const isPillVisible = (pill: NewPill): boolean => {
    if (session > MAX_SESSIONS) {
      return false;
    }

    const hoveredIn = hoveredSessions[pill.id];

    return hoveredIn === undefined || hoveredIn >= session;
  };

  const revealPill = (pill: NewPill) => {
    setActivePill(pill.id);
    setHoveredSessions((current) =>
      current[pill.id] === undefined
        ? { ...current, [pill.id]: session }
        : current,
    );
  };

  const reset = () => {
    setSession(1);
    setHoveredSessions({});
    setActivePill(null);
  };

  const visiblePills = NEW_PILLS.filter(isPillVisible);
  const openPill = visiblePills.find((pill) => pill.id === activePill);

  return (
    <div className="flex flex-col gap-3">
      <DemoStage rail={{ glow: openPill?.region ?? null }}>
        {visiblePills.map((pill) => (
          <button
            key={pill.id}
            type="button"
            aria-label={`What's new: ${pill.title}`}
            className="z-10 absolute"
            style={pill.position}
            onMouseEnter={() => revealPill(pill)}
            onMouseLeave={() => setActivePill(null)}
            onFocus={() => revealPill(pill)}
            onBlur={() => setActivePill(null)}
          >
            <Typography
              bold
              tag={TypographyTag.Span}
              type={TypographyType.Caption2}
              className="rounded-6 bg-accent-cabbage-flat px-1.5 py-0.5 text-accent-cabbage-default"
            >
              NEW
            </Typography>
          </button>
        ))}

        {openPill && (
          <CoachCard
            title={openPill.title}
            body={openPill.body}
            style={{ top: Number(openPill.position.top) - 24, left: 76 }}
          />
        )}
      </DemoStage>

      <div className="flex items-center gap-3">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Secondary}
          disabled={session > MAX_SESSIONS}
          onClick={() => setSession((current) => current + 1)}
        >
          Next session
        </Button>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={reset}
        >
          Reset
        </Button>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Session {session} — {visiblePills.length} of {NEW_PILLS.length} pills
          left
        </Typography>
      </div>

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="max-w-2xl"
      >
        Decay rules: a pill survives the session it was hovered in and is gone
        the next one, and every pill expires after {MAX_SESSIONS} sessions even
        if it was never touched — so a user who ignores them never carries the
        badges forever.
      </Typography>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/09 New pills',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-2xl"
      >
        The lightest possible pull: the items that actually moved wear a tiny
        NEW badge, and hovering one explains where it came from. No overlay, no
        dimming, nothing to dismiss. Pills appear for existing users right after
        the layout switch and decay on their own, so the rail returns to normal
        within a few sessions.
      </Typography>
      <NewPillsDemo />
    </div>
  ),
};
