import type { DragEvent } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PinIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { RailRegion } from './mockSidebar';
import { CoachCard, DemoStage, RAIL_TABS, REGION_ANCHORS } from './mockSidebar';

interface PanelRow {
  id: string;
  label: string;
  letter: string;
}

const MAX_EXPOSURES = 3;

// MockRail is shared and must not be edited, so every overlay box here is
// derived from REGION_ANCHORS plus the rail's own spacing: the tab stack starts
// 86px above the tabs anchor with a 50px pitch, and the dock column starts 72px
// above the dock anchor.
const RAIL_WIDTH = 64;
const TABS_TOP = REGION_ANCHORS.tabs - 86;
const TAB_PITCH = 50;
const TAB_HEIGHT = 46;
const DOCK_TOP = REGION_ANCHORS.dock - 72;
const DOCK_HEIGHT = 122;

const PANEL_WIDTH = 224;
const PANEL_TOP_OFFSET = 8;
const ROW_ONE_OFFSET = 36;
const ROW_HEIGHT = 40;

const SQUAD_ROWS: PanelRow[] = [
  { id: 'watercooler', label: 'watercooler', letter: 'W' },
  { id: 'devrel', label: 'devrel', letter: 'D' },
  { id: 'frontend', label: 'frontend', letter: 'F' },
];

const YOU_ROWS: PanelRow[] = [
  { id: 'bookmarks', label: 'Bookmarks', letter: 'B' },
  { id: 'history', label: 'History', letter: 'H' },
  { id: 'analytics', label: 'Analytics', letter: 'A' },
];

const DockChip = ({ row }: { row: PanelRow }): JSX.Element => {
  const [isPoppedIn, setIsPoppedIn] = useState(false);

  useEffect(() => {
    setIsPoppedIn(true);
  }, []);

  return (
    <span
      title={row.label}
      className={`flex size-6 items-center justify-center rounded-8 bg-accent-cabbage-flat text-accent-cabbage-default transition-transform duration-300 typo-caption1 ${
        isPoppedIn ? 'scale-100' : 'scale-0'
      }`}
    >
      {row.letter}
    </span>
  );
};

interface PanelTeachingDemoProps {
  tab: (typeof RAIL_TABS)[number];
  rows: PanelRow[];
  coachTitle: string;
}

const PanelTeachingDemo = ({
  tab,
  rows,
  coachTitle,
}: PanelTeachingDemoProps): JSX.Element => {
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [isDockTargeted, setIsDockTargeted] = useState(false);
  const [exposures, setExposures] = useState(0);
  const [pinned, setPinned] = useState<PanelRow[]>([]);
  const [isLearned, setIsLearned] = useState(false);

  const tabTop = TABS_TOP + RAIL_TABS.indexOf(tab) * TAB_PITCH;
  const panelTop = tabTop - PANEL_TOP_OFFSET;
  const rowOneTop = panelTop + ROW_ONE_OFFSET;

  const isPanelOpen = isPointerInside || !!draggedRowId;
  const isTeaching = isPanelOpen && !isLearned && exposures <= MAX_EXPOSURES;

  const openPanel = () => {
    if (isPointerInside) {
      return;
    }

    setIsPointerInside(true);
    setExposures((current) => current + 1);
  };

  const closePanel = () => {
    setIsPointerInside(false);
    setIsDockTargeted(false);
  };

  const pinRow = (rowId: string) => {
    setDraggedRowId(null);
    setIsDockTargeted(false);
    setIsLearned(true);
    setPinned((current) => {
      const row = rows.find((item) => item.id === rowId);

      if (!row || current.some((item) => item.id === row.id)) {
        return current;
      }

      return [...current, row];
    });
  };

  const startDrag = (event: DragEvent<HTMLDivElement>, row: PanelRow) => {
    event.dataTransfer.setData('text/plain', row.id);
    setDraggedRowId(row.id);
  };

  const reset = () => {
    setIsPointerInside(false);
    setDraggedRowId(null);
    setIsDockTargeted(false);
    setExposures(0);
    setPinned([]);
    setIsLearned(false);
  };

  const glow = (): RailRegion | null => {
    if (isDockTargeted || isTeaching) {
      return 'dock';
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-3">
      <DemoStage
        rail={{
          activeTab: tab,
          glow: glow(),
          dockExtra: pinned.map((row) => <DockChip key={row.id} row={row} />),
        }}
      >
        {isTeaching && (
          <div
            aria-hidden
            className="z-10 pointer-events-none absolute rounded-br-10 border-b border-r border-dashed border-accent-cabbage-default"
            style={{
              left: 32,
              top: rowOneTop + ROW_HEIGHT / 2,
              width: 40,
              height: DOCK_TOP - rowOneTop - ROW_HEIGHT / 2,
            }}
          />
        )}

        {draggedRowId && (
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDockTargeted(true);
            }}
            onDragLeave={() => setIsDockTargeted(false)}
            onDrop={(event) => {
              event.preventDefault();
              pinRow(event.dataTransfer.getData('text/plain'));
            }}
            className={`z-10 absolute rounded-10 border border-dashed transition-colors ${
              isDockTargeted
                ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                : 'border-transparent'
            }`}
            style={{
              left: 0,
              top: DOCK_TOP,
              width: RAIL_WIDTH,
              height: DOCK_HEIGHT,
            }}
          />
        )}

        <div
          className="z-20 absolute"
          onMouseLeave={closePanel}
          style={{
            left: 0,
            top: tabTop,
            width: RAIL_WIDTH + PANEL_WIDTH,
            height: TAB_HEIGHT,
          }}
        >
          <button
            type="button"
            aria-label={`Open the ${tab} panel`}
            className="absolute inset-y-0 left-0 w-16"
            onMouseEnter={openPanel}
            onFocus={openPanel}
          />

          {isPanelOpen && (
            <div
              className="absolute flex flex-col gap-1 rounded-r-14 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2-black"
              style={{
                left: RAIL_WIDTH,
                top: -PANEL_TOP_OFFSET,
                width: PANEL_WIDTH,
              }}
            >
              <Typography bold type={TypographyType.Callout}>
                {tab}
              </Typography>
              {rows.map((row) => {
                const isPinned = pinned.some((item) => item.id === row.id);

                return (
                  <div
                    key={row.id}
                    draggable={!isPinned}
                    onDragStart={(event) => startDrag(event, row)}
                    onDragEnd={() => setDraggedRowId(null)}
                    className={`group flex items-center gap-2 rounded-10 p-2 ${
                      isPinned
                        ? 'opacity-60'
                        : 'cursor-grab hover:bg-surface-float'
                    }`}
                  >
                    <span className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1">
                      {row.letter}
                    </span>
                    <Typography
                      className="flex-1"
                      type={TypographyType.Footnote}
                      color={TypographyColor.Secondary}
                    >
                      {row.label}
                    </Typography>
                    {isPinned ? (
                      <Typography
                        type={TypographyType.Caption1}
                        color={TypographyColor.Quaternary}
                      >
                        Pinned
                      </Typography>
                    ) : (
                      <Button
                        aria-label={`Pin ${row.label} to your dock`}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        size={ButtonSize.XSmall}
                        variant={ButtonVariant.Tertiary}
                        icon={<PinIcon />}
                        onClick={() => pinRow(row.id)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isTeaching && (
            <CoachCard
              title={coachTitle}
              body="One click from anywhere. You can also drag it straight onto the rail."
              style={{
                left: RAIL_WIDTH + PANEL_WIDTH + 12,
                top: ROW_ONE_OFFSET - PANEL_TOP_OFFSET - 12,
              }}
            />
          )}
        </div>
      </DemoStage>

      <div className="flex items-center gap-3">
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
          {`Panel opens: ${exposures} of ${MAX_EXPOSURES} · ${
            isLearned ? 'learned — teaching retired' : 'still teaching'
          }`}
        </Typography>
      </div>

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="max-w-2xl"
      >
        Teaching shown once — decays on success or after {MAX_EXPOSURES}{' '}
        exposures. Pinning by drag or by the pin button both count as success,
        so a user who already knows the gesture never sees the coach card twice.
      </Typography>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/11 Panel teaching moments',
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
        The intent-based flow the product cares most about: hover intent opens a
        panel, and the open panel — not an overlay on the feed — is where we
        teach pinning. Hover the Squads tab to open it; the first opens carry a
        coach card on the first row&apos;s pin button, a dashed guide toward the
        dock and a dock glow. Drag a row onto the rail or hit the pin icon and
        the lesson retires for good.
      </Typography>
      <PanelTeachingDemo
        tab="Squads"
        rows={SQUAD_ROWS}
        coachTitle="Pin a squad to your dock"
      />
    </div>
  ),
};

export const YouPanel: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="max-w-2xl"
      >
        The same teaching moment on the You tab, to show the pattern is a
        property of panels rather than of squads: any hover-opened panel whose
        rows are pinnable can host it, and each panel decays independently once
        its own lesson lands.
      </Typography>
      <PanelTeachingDemo
        tab="You"
        rows={YOU_ROWS}
        coachTitle="Pin a page to your dock"
      />
    </div>
  ),
};
