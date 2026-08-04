import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DemoStage, REGION_ANCHORS } from './mockSidebar';

type ChecklistItemId = 'compact' | 'pin' | 'peek';

interface ChecklistItem {
  id: ChecklistItemId;
  label: string;
  action: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'compact', label: 'Try compact mode', action: 'Toggle' },
  { id: 'pin', label: 'Pin a page to your dock', action: 'Pin' },
  { id: 'peek', label: 'Peek at a panel', action: 'Peek' },
];

const PANEL_ROWS = ['Bookmarks', 'History', 'Analytics'];

const PEEK_DURATION_MS = 1800;

const DockChip = ({
  letter,
  label,
}: {
  letter: string;
  label: string;
}): JSX.Element => {
  const [isPoppedIn, setIsPoppedIn] = useState(false);

  useEffect(() => {
    setIsPoppedIn(true);
  }, []);

  return (
    <span
      title={label}
      className={`flex size-6 items-center justify-center rounded-8 bg-accent-cabbage-flat text-accent-cabbage-default transition-transform duration-300 typo-caption1 ${
        isPoppedIn ? 'scale-100' : 'scale-0'
      }`}
    >
      {letter}
    </span>
  );
};

const PeekPanel = ({ style }: { style?: CSSProperties }): JSX.Element => (
  <div
    className="z-10 absolute flex w-56 flex-col gap-2 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2-black"
    style={style}
  >
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Quaternary}
    >
      You
    </Typography>
    {PANEL_ROWS.map((row) => (
      <div key={row} className="flex items-center gap-2">
        <span className="size-5 rounded-6 bg-surface-float" />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Secondary}
        >
          {row}
        </Typography>
      </div>
    ))}
  </div>
);

const ChecklistDemo = (): JSX.Element => {
  const [completed, setCompleted] = useState<ChecklistItemId[]>([]);
  const [isCompact, setIsCompact] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isPeeking) {
      return undefined;
    }

    const timer = setTimeout(() => setIsPeeking(false), PEEK_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isPeeking]);

  const runItem = (id: ChecklistItemId) => {
    if (id === 'compact') {
      setIsCompact((current) => !current);
    }

    if (id === 'pin') {
      setIsPinned(true);
    }

    if (id === 'peek') {
      setIsPeeking(true);
    }

    setCompleted((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const reset = () => {
    setCompleted([]);
    setIsCompact(false);
    setIsPinned(false);
    setIsPeeking(false);
    setIsCollapsed(false);
  };

  const doneCount = completed.length;
  const isAllDone = doneCount === CHECKLIST_ITEMS.length;

  return (
    <div className="flex flex-col gap-3">
      <DemoStage
        rail={{
          compact: isCompact,
          glow: isPeeking ? 'tabs' : null,
          dockExtra: isPinned ? <DockChip letter="H" label="History" /> : null,
        }}
      >
        {isPeeking && (
          <PeekPanel style={{ top: REGION_ANCHORS.tabs - 40, left: 76 }} />
        )}

        {isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="z-20 absolute bottom-4 right-4 flex items-center gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle px-3 py-2 shadow-2-black"
          >
            <span className="size-2 rounded-full bg-accent-cabbage-default" />
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Secondary}
            >
              {doneCount} of {CHECKLIST_ITEMS.length}
            </Typography>
          </button>
        )}

        {!isCollapsed && isAllDone && (
          <div className="z-20 absolute bottom-4 right-4 flex w-72 items-center justify-between gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-3-black">
            <div className="flex flex-col">
              <Typography bold type={TypographyType.Callout}>
                Your sidebar, your way
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                All three done
              </Typography>
            </div>
            <Button
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              onClick={reset}
            >
              Reset
            </Button>
          </div>
        )}

        {!isCollapsed && !isAllDone && (
          <div className="z-20 absolute bottom-4 right-4 flex w-72 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 shadow-3-black">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <Typography bold type={TypographyType.Callout}>
                  Make it yours
                </Typography>
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Quaternary}
                >
                  {doneCount} of {CHECKLIST_ITEMS.length} done
                </Typography>
              </div>
              <CloseButton
                size={ButtonSize.XSmall}
                onClick={() => setIsCollapsed(true)}
              />
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-float">
              <div
                className="h-full rounded-full bg-accent-cabbage-default transition-all duration-300"
                style={{
                  width: `${(doneCount / CHECKLIST_ITEMS.length) * 100}%`,
                }}
              />
            </div>

            <ul className="flex flex-col gap-2">
              {CHECKLIST_ITEMS.map((item) => {
                const isDone = completed.includes(item.id);

                return (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`flex size-5 items-center justify-center rounded-full border ${
                          isDone
                            ? 'border-accent-cabbage-default bg-accent-cabbage-flat text-accent-cabbage-default'
                            : 'border-border-subtlest-tertiary'
                        }`}
                      >
                        {isDone && <VIcon secondary size={IconSize.XXSmall} />}
                      </span>
                      <Typography
                        tag={TypographyTag.Span}
                        type={TypographyType.Footnote}
                        color={
                          isDone
                            ? TypographyColor.Quaternary
                            : TypographyColor.Primary
                        }
                        className={isDone ? 'line-through' : undefined}
                      >
                        {item.label}
                      </Typography>
                    </span>
                    {!isDone && (
                      <Button
                        size={ButtonSize.XSmall}
                        variant={ButtonVariant.Primary}
                        onClick={() => runItem(item.id)}
                      >
                        {item.action}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
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
          Closing the card leaves a &quot;{doneCount} of{' '}
          {CHECKLIST_ITEMS.length}&quot; pill so the checklist stays
          retrievable.
        </Typography>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/03 Make-it-yours checklist',
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
        A gamified activation card that appears once, bottom-right, after a user
        lands on the new rail. Every item performs the real action in the rail
        instead of describing it: flipping density, pinning a page to the dock,
        opening a panel. Progress is the hook — the bar and the strikethroughs
        do the persuading, and the card can be closed at any time without losing
        the lesson.
      </Typography>
      <ChecklistDemo />
    </div>
  ),
};
