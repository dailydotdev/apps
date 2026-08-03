import type { DragEvent } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
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
import { DemoStage, REGION_ANCHORS } from './mockSidebar';

type SignifierMode = 'baseline' | 'signifiers' | 'firstRun';

interface PanelPage {
  id: string;
  label: string;
  letter: string;
}

interface SignifierDemo {
  mode: SignifierMode;
  title: string;
  caption: string;
  pages: PanelPage[];
}

const SIGNIFIER_DEMOS: SignifierDemo[] = [
  {
    mode: 'baseline',
    title: '1 · Baseline — what we ship today',
    caption: 'No handle, no cursor change, no lift. The drag is invisible.',
    pages: [
      { id: 'history', label: 'History', letter: 'H' },
      { id: 'analytics', label: 'Analytics', letter: 'A' },
    ],
  },
  {
    mode: 'signifiers',
    title: '2 · Signifiers on hover',
    caption: 'Handle fades in, cursor grabs, row lifts. Hint chip shows once.',
    pages: [
      { id: 'leaderboard', label: 'Leaderboard', letter: 'L' },
      { id: 'following', label: 'Following', letter: 'F' },
    ],
  },
  {
    mode: 'firstRun',
    title: '3 · First-run shimmer',
    caption: 'Handles stay visible and pulse until the first successful drag.',
    pages: [
      { id: 'discussions', label: 'Discussions', letter: 'D' },
      { id: 'devcard', label: 'Devcard', letter: 'C' },
    ],
  },
];

const DOCK_DROP_HEIGHT = 160;

const DragSignifiersDemo = (): JSX.Element => {
  const [pinned, setPinned] = useState<PanelPage[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hasDraggedOnce, setHasDraggedOnce] = useState(false);
  const [isHintDismissed, setIsHintDismissed] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);

  const allPages = SIGNIFIER_DEMOS.flatMap((demo) => demo.pages);

  const pinPage = (pageId: string) => {
    setPinned((current) => {
      const page = allPages.find((item) => item.id === pageId);

      if (!page || current.some((item) => item.id === page.id)) {
        return current;
      }

      return [...current, page];
    });
  };

  const startDrag = (event: DragEvent<HTMLDivElement>, page: PanelPage) => {
    event.dataTransfer.setData('text/plain', page.id);
    setDraggedId(page.id);
    setIsHintVisible(false);
  };

  const finishDrag = () => setDraggedId(null);

  const isHandleAlwaysVisible = (mode: SignifierMode) =>
    mode === 'firstRun' && !hasDraggedOnce;

  const reset = () => {
    setPinned([]);
    setDraggedId(null);
    setHasDraggedOnce(false);
    setIsHintDismissed(false);
    setIsHintVisible(false);
  };

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Teaching the affordance itself, not the feature: drag-and-drop is
        invisible without signifiers. In the real product this layer is always
        on inside rail panels, with the first-run shimmer decaying to hover-only
        after a user drags once. Drag any row onto the rail dock, or use Pin.
      </Typography>

      <DemoStage
        rail={{
          glow: draggedId ? 'dock' : null,
          dockExtra: pinned.map((page) => (
            <span
              key={page.id}
              title={page.label}
              className="flex size-6 items-center justify-center rounded-8 bg-accent-cabbage-flat text-accent-cabbage-default typo-caption1"
            >
              {page.letter}
            </span>
          )),
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="pointer-events-auto absolute flex w-60 flex-col gap-2"
            style={{ left: 88, top: 16 }}
          >
            {SIGNIFIER_DEMOS.map((demo) => (
              <div
                key={demo.mode}
                className="relative flex flex-col gap-1 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2-black"
              >
                <div className="flex items-center justify-between gap-2">
                  <Typography bold type={TypographyType.Footnote}>
                    {demo.title}
                  </Typography>
                  {demo.mode === 'firstRun' && (
                    <Button
                      size={ButtonSize.XSmall}
                      variant={ButtonVariant.Tertiary}
                      onClick={() => setHasDraggedOnce(true)}
                    >
                      Dragged
                    </Button>
                  )}
                </div>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {demo.caption}
                </Typography>

                {demo.pages.map((page) => {
                  const isPinned = pinned.some((item) => item.id === page.id);
                  const hasSignifiers = demo.mode !== 'baseline';

                  return (
                    <div
                      key={page.id}
                      draggable={!isPinned}
                      onDragStart={(event) => startDrag(event, page)}
                      onDragEnd={finishDrag}
                      onMouseEnter={() => {
                        if (demo.mode === 'signifiers' && !isHintDismissed) {
                          setIsHintVisible(true);
                        }
                      }}
                      className={classNames(
                        'group flex items-center gap-2 rounded-10 bg-background-default p-2 transition-transform',
                        isPinned && 'opacity-60',
                        !isPinned &&
                          hasSignifiers &&
                          'cursor-grab hover:-translate-y-0.5 hover:shadow-2-black',
                      )}
                    >
                      {hasSignifiers && (
                        <span
                          aria-hidden
                          className={classNames(
                            'text-text-quaternary transition-opacity typo-caption1',
                            isHandleAlwaysVisible(demo.mode)
                              ? 'animate-pulse opacity-100'
                              : 'opacity-0 group-hover:opacity-100',
                          )}
                        >
                          ⠿
                        </span>
                      )}
                      <span className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1">
                        {page.letter}
                      </span>
                      <Typography
                        className="flex-1"
                        type={TypographyType.Footnote}
                        color={TypographyColor.Secondary}
                      >
                        {page.label}
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
                          className="invisible group-hover:visible"
                          size={ButtonSize.XSmall}
                          variant={ButtonVariant.Tertiary}
                          onClick={() => pinPage(page.id)}
                        >
                          Pin
                        </Button>
                      )}
                    </div>
                  );
                })}

                {demo.mode === 'signifiers' &&
                  isHintVisible &&
                  !isHintDismissed && (
                    <div className="absolute left-full top-3 ml-2 flex items-center gap-1 whitespace-nowrap rounded-10 border border-border-subtlest-tertiary bg-surface-float py-1 pl-3 pr-1 shadow-2-black">
                      <Typography type={TypographyType.Caption1}>
                        Drag to your dock
                      </Typography>
                      <CloseButton
                        size={ButtonSize.XSmall}
                        onClick={() => {
                          setIsHintVisible(false);
                          setIsHintDismissed(true);
                        }}
                      />
                    </div>
                  )}
              </div>
            ))}
          </div>

          {draggedId && (
            <div
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                pinPage(event.dataTransfer.getData('text/plain'));
                setHasDraggedOnce(true);
                finishDrag();
              }}
              className="pointer-events-auto absolute left-0 w-16"
              style={{
                top: REGION_ANCHORS.dock - DOCK_DROP_HEIGHT / 2,
                height: DOCK_DROP_HEIGHT,
              }}
            />
          )}
        </div>
      </DemoStage>

      <div className="flex items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {hasDraggedOnce
            ? 'First drag done — shimmer decayed to hover-only.'
            : 'First session — handles shimmer in demo 3.'}
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
  title: 'Sidebar Tutorial/06 Drag signifiers',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <DragSignifiersDemo /> };
