import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { RailRegion } from './mockSidebar';
import { Beacon, CoachCard, DemoStage, REGION_ANCHORS } from './mockSidebar';

interface Hotspot {
  region: RailRegion;
  title: string;
  body: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    region: 'tabs',
    title: 'Navigation lives here now',
    body: 'Explore, You, Squads and Streak became tabs. Hover one and its panel slides open next to the rail.',
  },
  {
    region: 'newPost',
    title: 'Posting moved to the rail',
    body: 'The new post button sits under your avatar, so it stays put wherever you are in the app.',
  },
  {
    region: 'dock',
    title: 'Your shortcuts dock',
    body: 'Pinned pages sit below the rail. Drag one out of a panel, or add it from the ••• tray.',
  },
];

// The rail is 64px wide, so beacons hang off its right edge: sitting on top of
// the tab targets would swallow the hover that opens the panels.
const BEACON_LEFT = 56;
const CARD_LEFT = 88;
const CARD_WIDTH = 256;

// The stage clips its overflow, so a card anchored straight at the dock's own
// y would run off the bottom edge.
const LOWEST_CARD_TOP = 380;

const cardTop = (region: RailRegion): number =>
  Math.min(REGION_ANCHORS[region], LOWEST_CARD_TOP);

const HotspotBeacons = (): JSX.Element => {
  const [visited, setVisited] = useState<RailRegion[]>([]);
  const [active, setActive] = useState<RailRegion | null>(null);

  const activeHotspot = HOTSPOTS.find((hotspot) => hotspot.region === active);
  const allExplored = visited.length === HOTSPOTS.length;

  const dismiss = () => {
    if (active && !visited.includes(active)) {
      setVisited((current) => [...current, active]);
    }

    setActive(null);
  };

  const reset = () => {
    setVisited([]);
    setActive(null);
  };

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Self-paced pull: instead of a tour, the rail wears pulsing beacons the
        first few sessions after the switch. The user picks what to learn and in
        which order, each explanation costs one click, and a beacon never comes
        back once its card is dismissed.
      </Typography>

      <DemoStage rail={{ glow: active }}>
        {HOTSPOTS.filter(
          (hotspot) =>
            !visited.includes(hotspot.region) && hotspot.region !== active,
        ).map((hotspot) => (
          <Beacon
            key={hotspot.region}
            onClick={() => setActive(hotspot.region)}
            style={{ left: BEACON_LEFT, top: REGION_ANCHORS[hotspot.region] }}
          />
        ))}

        {activeHotspot && (
          <>
            <CoachCard
              title={activeHotspot.title}
              body={activeHotspot.body}
              style={{
                left: CARD_LEFT,
                top: cardTop(activeHotspot.region),
              }}
              actions={
                <Button
                  size={ButtonSize.XSmall}
                  variant={ButtonVariant.Primary}
                  onClick={dismiss}
                >
                  Got it
                </Button>
              }
            />
            <CloseButton
              size={ButtonSize.XSmall}
              className="z-30 absolute"
              onClick={dismiss}
              style={{
                left: CARD_LEFT + CARD_WIDTH - 32,
                top: cardTop(activeHotspot.region) + 8,
              }}
            />
          </>
        )}
      </DemoStage>

      <div className="flex items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={
            allExplored ? TypographyColor.Primary : TypographyColor.Quaternary
          }
        >
          {allExplored
            ? 'You know your way around 🎉'
            : `Explored ${visited.length} of ${HOTSPOTS.length}`}
        </Typography>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={reset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/02 Hotspot beacons',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <HotspotBeacons /> };
