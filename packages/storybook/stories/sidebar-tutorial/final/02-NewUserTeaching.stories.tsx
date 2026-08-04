import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { FinalRailRegion, PanelRow, RailTab } from './finalRail';
import {
  CoachAnchor,
  CoachCard,
  DOCK_TOP,
  DockChip,
  DockDropTarget,
  FinalStage,
  PANEL_ROW_HEIGHT,
  PANEL_ROW_ONE_OFFSET,
  PANEL_TOP_OFFSET,
  PANEL_WIDTH,
  RAIL_WIDTH,
  RailPanel,
  SQUAD_ROWS,
  STAGE_HEIGHT,
  TAB_HEIGHT,
  YOU_ROWS,
  dockDotsTop,
  tabTop,
} from './finalRail';

const MAX_EXPOSURES = 3;
// The ••• coach sits low in the rail and grows a row for every pin, so it is
// clamped against the stage floor rather than centred on its anchor.
const DOTS_CARD_HEIGHT = 102;
const DOTS_CARD_LOWEST_TOP = STAGE_HEIGHT - DOTS_CARD_HEIGHT - 16;
const DOTS_POINTER_LOWEST = DOTS_CARD_HEIGHT - 16;

const TeachingDemo = (): JSX.Element => {
  const [hasSquads, setHasSquads] = useState(true);
  const [isPanelHovered, setIsPanelHovered] = useState(false);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [isDockTargeted, setIsDockTargeted] = useState(false);
  const [panelOpens, setPanelOpens] = useState(0);
  const [pinned, setPinned] = useState<PanelRow[]>([]);
  const [isPinLearned, setIsPinLearned] = useState(false);
  const [dotsExposures, setDotsExposures] = useState(0);
  const [isDotsCoachOpen, setIsDotsCoachOpen] = useState(false);
  const [isDotsCoachRetired, setIsDotsCoachRetired] = useState(false);

  const tab: RailTab = hasSquads ? 'Squads' : 'You';
  const rows = hasSquads ? SQUAD_ROWS : YOU_ROWS;
  const panelTop = tabTop(tab);
  const rowOneTop = panelTop - PANEL_TOP_OFFSET + PANEL_ROW_ONE_OFFSET;

  const isPanelOpen = isPanelHovered || !!draggedRowId;
  const isTeaching =
    isPanelOpen && !isPinLearned && panelOpens <= MAX_EXPOSURES;

  const resetTeaching = () => {
    setIsPanelHovered(false);
    setDraggedRowId(null);
    setIsDockTargeted(false);
    setPanelOpens(0);
    setPinned([]);
    setIsPinLearned(false);
    setDotsExposures(0);
    setIsDotsCoachOpen(false);
    setIsDotsCoachRetired(false);
  };

  const openPanel = () => {
    if (isPanelHovered) {
      return;
    }

    setIsPanelHovered(true);
    setPanelOpens((current) => current + 1);
  };

  const pinRow = (rowId: string) => {
    setDraggedRowId(null);
    setIsDockTargeted(false);
    setIsPinLearned(true);
    setPinned((current) => {
      const row = rows.find((item) => item.id === rowId);

      if (!row || current.some((item) => item.id === row.id)) {
        return current;
      }

      return [...current, row];
    });
  };

  const openDotsCoach = () => {
    if (isDotsCoachRetired || isDotsCoachOpen) {
      return;
    }

    const nextExposure = dotsExposures + 1;
    setDotsExposures(nextExposure);
    setIsDotsCoachOpen(true);

    if (nextExposure >= MAX_EXPOSURES) {
      setIsDotsCoachRetired(true);
    }
  };

  const glow = (): FinalRailRegion | null =>
    isDockTargeted || isTeaching ? 'dock' : null;

  const dotsCenter = dockDotsTop(pinned.length) + 12;
  const dotsCardTop = Math.min(
    dotsCenter - DOTS_CARD_HEIGHT / 2,
    DOTS_CARD_LOWEST_TOP,
  );
  const dotsPointerTop = Math.min(
    dotsCenter - dotsCardTop,
    DOTS_POINTER_LOWEST,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <Switch
          inputId="final-teaching-squads"
          name="final-teaching-squads"
          checked={hasSquads}
          onToggle={() => {
            setHasSquads((current) => !current);
            resetTeaching();
          }}
        >
          User has squads
        </Switch>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {hasSquads
            ? 'Teaching runs on the Squads panel'
            : 'No squads yet, so the same teaching runs on the first panel they open'}
        </Typography>
      </div>

      <FinalStage
        rail={{
          activeTab: tab,
          glow: glow(),
          dockExtra: pinned.map((row) => <DockChip key={row.id} row={row} />),
          onDotsHover: openDotsCoach,
          onDotsClick: openDotsCoach,
        }}
      >
        {isTeaching && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-1 rounded-br-10 border-b border-r border-dashed border-accent-cabbage-default"
            style={{
              left: 32,
              top: rowOneTop + PANEL_ROW_HEIGHT / 2,
              width: 40,
              height: DOCK_TOP - rowOneTop - PANEL_ROW_HEIGHT / 2,
            }}
          />
        )}

        {draggedRowId && (
          <DockDropTarget
            isTargeted={isDockTargeted}
            extraPins={pinned.length}
            onTarget={setIsDockTargeted}
            onDrop={pinRow}
          />
        )}

        <div
          className="absolute z-2"
          onMouseLeave={() => {
            setIsPanelHovered(false);
            setIsDockTargeted(false);
          }}
          style={{
            left: 0,
            top: panelTop,
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
            <RailPanel
              title={tab}
              rows={rows}
              pinnedIds={pinned.map((row) => row.id)}
              onPin={pinRow}
              onDragStart={setDraggedRowId}
              onDragEnd={() => setDraggedRowId(null)}
            />
          )}

          {isTeaching && (
            <CoachAnchor
              left={RAIL_WIDTH + PANEL_WIDTH + 12}
              top={PANEL_ROW_ONE_OFFSET - PANEL_TOP_OFFSET - 12}
            >
              <CoachCard
                message="Drag anything from this panel to the dock, or use its pin button."
                pointer={PANEL_ROW_HEIGHT / 2 + 12}
              />
            </CoachAnchor>
          )}
        </div>

        {isDotsCoachOpen && (
          <CoachAnchor left={76} top={dotsCardTop}>
            <CoachCard
              message="Add, reorder and remove your shortcuts from here."
              pointer={dotsPointerTop}
              actions={
                <>
                  <span />
                  <Button
                    className="active:scale-95"
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    onClick={() => setIsDotsCoachOpen(false)}
                  >
                    Got it
                  </Button>
                </>
              }
            />
          </CoachAnchor>
        )}
      </FinalStage>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={resetTeaching}
        >
          Reset
        </Button>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`Panel opens: ${panelOpens} of ${MAX_EXPOSURES} · ${
            isPinLearned ? 'pinned, teaching retired' : 'still teaching'
          }`}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`••• coach: ${dotsExposures} of ${MAX_EXPOSURES} · ${
            isDotsCoachRetired ? 'retired' : 'still showing'
          }`}
        </Typography>
      </div>

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="max-w-3xl"
      >
        Both lessons decay the same way. They retire on success (a pin by drag
        or by button, a visit to the ••• tray) or after {MAX_EXPOSURES}{' '}
        exposures, whichever comes first. A user who already knows the gesture
        never sees the same card twice.
      </Typography>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/Final/02 Intent teaching (new users)',
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
        className="max-w-3xl"
      >
        New users never see the tour, because nothing moved for them. They get
        the lesson at the moment they can act on it instead: hover the
        highlighted tab to open its panel and the first opens carry a coach card
        on the row&apos;s pin button, a dashed guide toward the dock and a dock
        glow. Drag a row onto the rail or hit its pin icon and the lesson
        retires for good. Hover the ••• at the foot of the dock for the
        click-only path. Flip the toggle to see the same teaching on the You
        panel for a user with no squads.
      </Typography>
      <TeachingDemo />
    </div>
  ),
};
