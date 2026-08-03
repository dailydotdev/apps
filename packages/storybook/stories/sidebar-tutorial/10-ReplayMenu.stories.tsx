import React, { useEffect, useRef, useState } from 'react';
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
import { CoachCard, DemoStage, REGION_ANCHORS } from './mockSidebar';

interface HelpEntry {
  id: string;
  label: string;
  region: RailRegion;
  concept: string;
}

const HELP_ENTRIES: HelpEntry[] = [
  {
    id: 'tour',
    label: 'Tour the new sidebar',
    region: 'tabs',
    concept: 'concept 01, the three-step spotlight tour',
  },
  {
    id: 'drag',
    label: 'Drag & drop',
    region: 'dock',
    concept: 'concept 06, the drag signifier layer',
  },
  {
    id: 'dock',
    label: 'Your shortcuts dock',
    region: 'dock',
    concept: 'concept 05, the teaching empty dock',
  },
  {
    id: 'changed',
    label: 'What changed and where',
    region: 'logo',
    concept: "concept 07, the what's-new card",
  },
];

const MENU_LEFT = 72;
const CARD_LEFT = 72;
const CARD_WIDTH = 256;

// The stage clips its overflow, so a card anchored straight at the dock's own
// y would run off the bottom edge.
const LOWEST_CARD_TOP = 380;

const cardTop = (region: RailRegion): number =>
  Math.min(REGION_ANCHORS[region], LOWEST_CARD_TOP);

const ReplayMenu = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<RailRegion | null>(null);
  const [launched, setLaunched] = useState<HelpEntry | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setHovered(null);
      }
    };

    document.addEventListener('click', closeOnOutsideClick);

    return () => document.removeEventListener('click', closeOnOutsideClick);
  }, [isOpen]);

  const launch = (entry: HelpEntry) => {
    setLaunched(entry);
    setIsOpen(false);
    setHovered(null);
  };

  const reset = () => {
    setIsOpen(false);
    setHovered(null);
    setLaunched(null);
  };

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        The umbrella entry point: a “?” pinned to the foot of the rail, always
        there, never in the way. Every other concept can be dismissed because
        this menu makes each lesson retrievable — hovering an item previews the
        region it explains before the user commits to a click.
      </Typography>

      <DemoStage rail={{ glow: hovered ?? launched?.region ?? null }}>
        <div ref={menuRef}>
          <button
            type="button"
            aria-label="Help and tips"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
            className="z-20 absolute flex size-8 items-center justify-center rounded-10 bg-surface-float text-text-tertiary typo-callout"
            style={{ left: 16, bottom: 16 }}
          >
            ?
          </button>

          {isOpen && (
            <div
              className="z-30 absolute flex w-64 flex-col gap-1 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-2 shadow-3-black"
              style={{ left: MENU_LEFT, bottom: 16 }}
            >
              <Typography
                className="px-2 py-1"
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
              >
                Learn the sidebar
              </Typography>
              {HELP_ENTRIES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => launch(entry)}
                  onMouseEnter={() => setHovered(entry.region)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(entry.region)}
                  onBlur={() => setHovered(null)}
                  className="rounded-10 px-2 py-1.5 text-left text-text-secondary typo-footnote hover:bg-surface-float"
                >
                  {entry.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {launched && (
          <>
            <CoachCard
              title={launched.label}
              body={`In the real product this launches ${launched.concept}.`}
              style={{ left: CARD_LEFT, top: cardTop(launched.region) }}
            />
            <CloseButton
              size={ButtonSize.XSmall}
              className="z-30 absolute"
              onClick={() => setLaunched(null)}
              style={{
                left: CARD_LEFT + CARD_WIDTH - 32,
                top: cardTop(launched.region) + 8,
              }}
            />
          </>
        )}
      </DemoStage>

      <div className="flex items-center gap-2">
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
  title: 'Sidebar Tutorial/10 Replayable help menu',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <ReplayMenu /> };
