import type { DragEvent, RefObject } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classNames from 'classnames';
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
import { DemoStage } from './mockSidebar';

interface PanelPage {
  id: string;
  label: string;
  letter: string;
}

const YOU_PANEL_PAGES: PanelPage[] = [
  { id: 'bookmarks', label: 'Bookmarks', letter: 'B' },
  { id: 'history', label: 'History', letter: 'H' },
  { id: 'analytics', label: 'Analytics', letter: 'A' },
];

const DOCK_SLOTS = [0, 1, 2];

// Wider than the dock column so the caption breaks over two lines instead of
// three, which would overflow the stage.
const DOCK_CAPTION_WIDTH = 80;

interface OverlayBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

// The dock renders inside MockRail, which this concept must not edit, so the
// interactive slots are drawn as an overlay measured against the real dock box.
const useDockBox = (layerRef: RefObject<HTMLDivElement>): OverlayBox | null => {
  const [box, setBox] = useState<OverlayBox | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const dock = layer?.parentElement?.querySelector('[data-region="dock"]');

    if (!layer || !dock) {
      return;
    }

    const layerRect = layer.getBoundingClientRect();
    const dockRect = dock.getBoundingClientRect();

    setBox({
      left: dockRect.left - layerRect.left,
      top: dockRect.top - layerRect.top,
      width: dockRect.width,
      height: dockRect.height,
    });
  }, [layerRef]);

  return box;
};

const EmptyDockDemo = (): JSX.Element => {
  const [pinned, setPinned] = useState<PanelPage[]>([]);
  const [isDockTargeted, setIsDockTargeted] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const dockBox = useDockBox(layerRef);

  const pinPage = (pageId: string) => {
    setIsDockTargeted(false);
    setPinned((current) => {
      const page = YOU_PANEL_PAGES.find((item) => item.id === pageId);

      if (!page || current.length >= DOCK_SLOTS.length) {
        return current;
      }

      return current.some((item) => item.id === page.id)
        ? current
        : [...current, page];
    });
  };

  const startDrag = (event: DragEvent<HTMLDivElement>, page: PanelPage) => {
    event.dataTransfer.setData('text/plain', page.id);
  };

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Ambient teaching, zero interruption: an empty shortcuts dock explains
        itself. In the real product this state ships to every user whose dock
        has no pins yet — the dashed slots and their caption are the whole
        lesson, and they disappear the moment the first page is pinned.
      </Typography>

      <DemoStage rail={{ dockEmpty: true }}>
        <div ref={layerRef} className="pointer-events-none absolute inset-0">
          <div
            className="pointer-events-auto absolute flex w-56 flex-col gap-1 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-3 shadow-2-black"
            style={{ left: 88, top: 40 }}
          >
            <Typography bold type={TypographyType.Callout}>
              You
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
            >
              Drag a page to the dock, or use Pin
            </Typography>
            {YOU_PANEL_PAGES.map((page) => {
              const isPinned = pinned.some((item) => item.id === page.id);

              return (
                <div
                  key={page.id}
                  draggable={!isPinned}
                  onDragStart={(event) => startDrag(event, page)}
                  className={classNames(
                    'group flex items-center gap-2 rounded-10 p-2',
                    isPinned
                      ? 'opacity-60'
                      : 'cursor-grab hover:bg-surface-float',
                  )}
                >
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
          </div>

          {dockBox && (
            <>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDockTargeted(true);
                }}
                onDragLeave={() => setIsDockTargeted(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  pinPage(event.dataTransfer.getData('text/plain'));
                }}
                className="pointer-events-auto absolute flex flex-col items-center justify-center gap-1.5 rounded-10 bg-background-default p-1"
                style={{
                  left: dockBox.left,
                  top: dockBox.top - 6,
                  width: dockBox.width,
                  height: dockBox.height + 12,
                }}
              >
                {DOCK_SLOTS.map((slot) => {
                  const page = pinned[slot];

                  if (page) {
                    return (
                      <span
                        key={slot}
                        title={page.label}
                        className="flex size-6 items-center justify-center rounded-8 bg-surface-float text-text-tertiary typo-caption1"
                      >
                        {page.letter}
                      </span>
                    );
                  }

                  return (
                    <span
                      key={slot}
                      className={classNames(
                        'size-6 rounded-8 border border-dashed transition-colors',
                        isDockTargeted
                          ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                          : 'border-border-subtlest-tertiary',
                      )}
                    />
                  );
                })}
                <span className="flex size-6 items-center justify-center rounded-8 text-text-quaternary typo-caption1">
                  •••
                </span>
              </div>

              {pinned.length === 0 && (
                <Typography
                  center
                  type={TypographyType.Caption2}
                  color={TypographyColor.Quaternary}
                  className="absolute"
                  style={{
                    left:
                      dockBox.left + dockBox.width / 2 - DOCK_CAPTION_WIDTH / 2,
                    top: dockBox.top + dockBox.height + 4,
                    width: DOCK_CAPTION_WIDTH,
                  }}
                >
                  Drag pages here
                </Typography>
              )}
            </>
          )}
        </div>
      </DemoStage>

      <div className="flex items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {`Pinned ${pinned.length} of ${DOCK_SLOTS.length}`}
        </Typography>
        <Button
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={() => {
            setPinned([]);
            setIsDockTargeted(false);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Sidebar Tutorial/05 Empty dock that teaches',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <EmptyDockDemo /> };
