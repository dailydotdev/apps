import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
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
  SupportMenu,
  TAB_HEIGHT,
  YOU_ROWS,
  dockDotsTop,
  tabTop,
} from './finalRail';
import { GameCenterPanel, SIDEBAR_TOUR_STEPS, SidebarTour } from './tourSteps';

type Persona = 'existing' | 'new';

const MAX_EXPOSURES = 3;
// The ••• coach sits low in the rail and grows a row for every pin, so it is
// clamped against the stage floor rather than centred on its anchor.
const DOTS_CARD_HEIGHT = 102;
const DOTS_CARD_LOWEST_TOP = STAGE_HEIGHT - DOTS_CARD_HEIGHT - 16;
const DOTS_POINTER_LOWEST = DOTS_CARD_HEIGHT - 16;
const TEACHABLE_TABS: RailTab[] = ['You', 'Squads'];

const ROWS_BY_TAB: Record<string, PanelRow[]> = {
  You: YOU_ROWS,
  Squads: SQUAD_ROWS,
};

const FullExperienceDemo = (): JSX.Element => {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [isTourSeen, setIsTourSeen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [openTab, setOpenTab] = useState<RailTab | null>(null);
  const [taughtTab, setTaughtTab] = useState<RailTab | null>(null);
  const [panelOpens, setPanelOpens] = useState(0);
  const [draggedRowId, setDraggedRowId] = useState<string | null>(null);
  const [isDockTargeted, setIsDockTargeted] = useState(false);
  const [pinned, setPinned] = useState<PanelRow[]>([]);
  const [isPinLearned, setIsPinLearned] = useState(false);

  const [dotsExposures, setDotsExposures] = useState(0);
  const [isDotsCoachOpen, setIsDotsCoachOpen] = useState(false);
  const [isDotsCoachRetired, setIsDotsCoachRetired] = useState(false);

  const currentStep = step === null ? undefined : SIDEBAR_TOUR_STEPS[step];
  const isTourRunning = !!currentStep;
  const isAmbient = persona === 'new' && !isTourRunning;
  const isPanelOpen = !!openTab || !!draggedRowId;
  const isTeaching =
    isAmbient &&
    isPanelOpen &&
    openTab === taughtTab &&
    !isPinLearned &&
    panelOpens <= MAX_EXPOSURES;

  const reset = () => {
    setPersona(null);
    setStep(null);
    setIsTourSeen(false);
    setCompact(false);
    setIsMenuOpen(false);
    setOpenTab(null);
    setTaughtTab(null);
    setPanelOpens(0);
    setDraggedRowId(null);
    setIsDockTargeted(false);
    setPinned([]);
    setIsPinLearned(false);
    setDotsExposures(0);
    setIsDotsCoachOpen(false);
    setIsDotsCoachRetired(false);
  };

  const selectPersona = (next: Persona) => {
    reset();
    setPersona(next);

    if (next === 'existing') {
      setStep(0);
    }
  };

  const endTour = () => {
    setStep(null);
    setIsTourSeen(true);
  };

  const openPanel = (tab: RailTab) => {
    if (openTab === tab) {
      return;
    }

    setOpenTab(tab);

    const teaching = taughtTab ?? tab;
    setTaughtTab(teaching);

    if (teaching === tab) {
      setPanelOpens((current) => current + 1);
    }
  };

  const pinRow = (rowId: string) => {
    setDraggedRowId(null);
    setIsDockTargeted(false);
    setIsPinLearned(true);
    setPinned((current) => {
      const row = Object.values(ROWS_BY_TAB)
        .flat()
        .find((item) => item.id === rowId);

      if (!row || current.some((item) => item.id === row.id)) {
        return current;
      }

      return [...current, row];
    });
  };

  const openDotsCoach = () => {
    if (!isAmbient || isDotsCoachRetired || isDotsCoachOpen) {
      return;
    }

    const nextExposure = dotsExposures + 1;
    setDotsExposures(nextExposure);
    setIsDotsCoachOpen(true);

    if (nextExposure >= MAX_EXPOSURES) {
      setIsDotsCoachRetired(true);
    }
  };

  const glow = (): FinalRailRegion | null => {
    if (currentStep) {
      return currentStep.glow;
    }

    return isDockTargeted || isTeaching ? 'dock' : null;
  };

  const activeTab = (): RailTab => {
    if (currentStep?.extra === 'gameCenterPanel') {
      return 'Streak';
    }

    return openTab ?? 'Explore';
  };

  const teachingRowTop =
    taughtTab && tabTop(taughtTab) - PANEL_TOP_OFFSET + PANEL_ROW_ONE_OFFSET;

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
      <div className="flex flex-wrap items-center gap-2">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          Persona
        </Typography>
        <Button
          size={ButtonSize.Small}
          variant={
            persona === 'existing' ? ButtonVariant.Primary : ButtonVariant.Float
          }
          onClick={() => selectPersona('existing')}
        >
          Existing user
        </Button>
        <Button
          size={ButtonSize.Small}
          variant={
            persona === 'new' ? ButtonVariant.Primary : ButtonVariant.Float
          }
          onClick={() => selectPersona('new')}
        >
          New user
        </Button>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={reset}
        >
          Reset
        </Button>
      </div>

      <FinalStage
        spotlight={isTourRunning}
        rail={{
          compact,
          glow: glow(),
          activeTab: activeTab(),
          dockExtra: pinned.map((row) => <DockChip key={row.id} row={row} />),
          onDotsHover: openDotsCoach,
          onDotsClick: openDotsCoach,
          onHelpClick: () => setIsMenuOpen((current) => !current),
          streakPanel: currentStep?.extra === 'gameCenterPanel' && (
            <GameCenterPanel />
          ),
        }}
      >
        {!persona && (
          <CoachAnchor left={270} top={240}>
            <CoachCard message="Pick a persona above to start." />
          </CoachAnchor>
        )}

        {isTeaching && teachingRowTop && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-1 rounded-br-10 border-b border-r border-dashed border-accent-cabbage-default"
            style={{
              left: 32,
              top: teachingRowTop + PANEL_ROW_HEIGHT / 2,
              width: 40,
              height: DOCK_TOP - teachingRowTop - PANEL_ROW_HEIGHT / 2,
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

        {!isTourRunning &&
          TEACHABLE_TABS.map((tab) => (
            <div
              key={tab}
              className="absolute z-2"
              onMouseLeave={() => {
                setOpenTab(null);
                setIsDockTargeted(false);
              }}
              style={{
                left: 0,
                top: tabTop(tab),
                width: RAIL_WIDTH + PANEL_WIDTH,
                height: TAB_HEIGHT,
              }}
            >
              <button
                type="button"
                aria-label={`Open the ${tab} panel`}
                className="absolute inset-y-0 left-0 w-16"
                onMouseEnter={() => openPanel(tab)}
                onFocus={() => openPanel(tab)}
              />

              {openTab === tab && (
                <RailPanel
                  title={tab}
                  rows={ROWS_BY_TAB[tab]}
                  pinnedIds={pinned.map((row) => row.id)}
                  onPin={pinRow}
                  onDragStart={setDraggedRowId}
                  onDragEnd={() => setDraggedRowId(null)}
                />
              )}

              {isTeaching && openTab === tab && (
                <CoachAnchor
                  left={RAIL_WIDTH + PANEL_WIDTH + 12}
                  top={PANEL_ROW_ONE_OFFSET - PANEL_TOP_OFFSET - 12}
                >
                  <CoachCard
                    message="Drag any page to the dock, or click its pin button."
                    pointer={PANEL_ROW_HEIGHT / 2 + 12}
                  />
                </CoachAnchor>
              )}
            </div>
          ))}

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

        {isMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close the support menu"
              className="absolute inset-0 z-2 cursor-default"
              onClick={() => setIsMenuOpen(false)}
            />
            <SupportMenu
              items={[
                {
                  id: 'tour',
                  label: 'Learn the sidebar',
                  onClick: () => {
                    setIsMenuOpen(false);
                    setOpenTab(null);
                    setStep(0);
                  },
                },
                { id: 'docs', label: 'Docs' },
                { id: 'bug', label: 'Report a bug' },
              ]}
            />
          </>
        )}

        {step !== null && (
          <SidebarTour
            step={step}
            onStepChange={setStep}
            onFinish={endTour}
            onSkip={endTour}
            compact={compact}
            onCompactChange={setCompact}
            switchId="final-full-compact"
          />
        )}
      </FinalStage>

      <div className="flex flex-wrap items-center gap-3">
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`tourSeen: ${isTourSeen}`}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`panelTeachingRetired: ${
            isPinLearned || panelOpens > MAX_EXPOSURES
          } (opens ${panelOpens} of ${MAX_EXPOSURES})`}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`dotsCoachSeen: ${dotsExposures} of ${MAX_EXPOSURES}${
            isDotsCoachRetired ? ' (retired)' : ''
          }`}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
        >
          {`ambient teaching: ${isAmbient ? 'on' : 'off'}`}
        </Typography>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/Final/00 Full experience',
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
        The whole system in one stage. Existing users are the only ones whose
        muscle memory broke, so they get the three-step tour once, with
        &quot;Skip tour&quot; on every step. New users get nothing up front:
        they are taught inside the panel they open first (drag a row to the dock
        or hit its pin button) and by a one-liner on the ••• tray, both of which
        retire on success or after three exposures. Either persona can reopen
        the tour from the support &quot;?&quot; at the foot of the rail, which
        is an option rather than an advertisement. Pick a persona to start; the
        flags under the stage are the ones we would persist per user.
      </Typography>
      <FullExperienceDemo />
    </div>
  ),
};
