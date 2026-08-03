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
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { DemoStage } from './mockSidebar';

type PlaygroundStatus = 'open' | 'success' | 'closed';

const PLAYGROUND_SLOTS = [0, 1, 2];

const SOURCE_CHIP = { id: 'tags', label: 'Tags', letter: 'T' };

const PlaygroundDemo = (): JSX.Element => {
  const [status, setStatus] = useState<PlaygroundStatus>('open');
  const [isChipSelected, setIsChipSelected] = useState(false);
  const [targetedSlot, setTargetedSlot] = useState<number | null>(null);
  const [filledSlot, setFilledSlot] = useState<number | null>(null);

  const fillSlot = (slot: number) => {
    setFilledSlot(slot);
    setTargetedSlot(null);
    setIsChipSelected(false);
    setStatus('success');
  };

  const startDrag = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('text/plain', SOURCE_CHIP.id);
  };

  const reset = () => {
    setStatus('open');
    setIsChipSelected(false);
    setTargetedSlot(null);
    setFilledSlot(null);
  };

  const isModalOpen = status !== 'closed';

  return (
    <div className="flex flex-col gap-4 bg-background-default p-6">
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Learn by doing: walkthroughs stick when the user performs the action
        instead of watching it. In the real product this sandbox opens once,
        right after the sidebar switch (or from the help menu), and asks for a
        single drag before it gets out of the way.
      </Typography>

      <DemoStage contentDim={isModalOpen}>
        {isModalOpen && (
          <div
            role="presentation"
            onClick={() => setStatus('closed')}
            className="z-20 absolute inset-0 flex items-center justify-center bg-overlay-primary-pepper"
          >
            <div
              role="presentation"
              onClick={(event) => event.stopPropagation()}
              className="relative flex w-80 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-5 shadow-3-black"
            >
              <CloseButton
                size={ButtonSize.XSmall}
                className="absolute right-3 top-3"
                onClick={() => setStatus('closed')}
              />

              {status === 'open' ? (
                <>
                  <Typography bold type={TypographyType.Title3}>
                    Try it: drag Tags into your dock
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    Grab the chip and drop it on an empty slot. Rather click?
                    Select the chip, then pick a slot.
                  </Typography>

                  <div className="mt-1 flex items-center justify-between gap-4 rounded-14 border border-border-subtlest-tertiary bg-background-default p-4">
                    <button
                      type="button"
                      draggable
                      onDragStart={startDrag}
                      onClick={() => setIsChipSelected((current) => !current)}
                      className={classNames(
                        'flex cursor-grab items-center gap-2 rounded-10 border bg-surface-float px-3 py-2',
                        isChipSelected
                          ? 'border-accent-cabbage-default'
                          : 'border-border-subtlest-tertiary',
                      )}
                    >
                      <span className="flex size-6 items-center justify-center rounded-8 bg-accent-cabbage-flat text-accent-cabbage-default typo-caption1">
                        {SOURCE_CHIP.letter}
                      </span>
                      <Typography
                        tag={TypographyTag.Span}
                        type={TypographyType.Footnote}
                      >
                        {SOURCE_CHIP.label}
                      </Typography>
                    </button>

                    <Typography
                      type={TypographyType.Callout}
                      color={TypographyColor.Quaternary}
                    >
                      →
                    </Typography>

                    <div className="flex flex-col items-center gap-1.5 rounded-14 border border-border-subtlest-tertiary p-2">
                      {PLAYGROUND_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          aria-label={`Dock slot ${slot + 1}`}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setTargetedSlot(slot);
                          }}
                          onDragLeave={() => setTargetedSlot(null)}
                          onDrop={(event) => {
                            event.preventDefault();
                            fillSlot(slot);
                          }}
                          onClick={() => {
                            if (isChipSelected) {
                              fillSlot(slot);
                            }
                          }}
                          className={classNames(
                            'size-7 rounded-8 border border-dashed transition-colors',
                            targetedSlot === slot || isChipSelected
                              ? 'border-accent-cabbage-default bg-accent-cabbage-flat'
                              : 'border-border-subtlest-tertiary',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Tertiary}
                      onClick={() => setStatus('closed')}
                    >
                      Skip for now
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Typography bold type={TypographyType.Title3}>
                    That&apos;s it — your real dock works exactly like this
                  </Typography>
                  <Typography
                    type={TypographyType.Footnote}
                    color={TypographyColor.Tertiary}
                  >
                    {`Tags landed in slot ${
                      (filledSlot ?? 0) + 1
                    }. Drag any page out of a rail panel to pin it, or use the ••• tray if you prefer clicking.`}
                  </Typography>
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      size={ButtonSize.Small}
                      variant={ButtonVariant.Primary}
                      onClick={() => setStatus('closed')}
                    >
                      Done
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DemoStage>

      <div className="flex items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {status === 'closed'
            ? 'Playground closed — the rail is yours again.'
            : 'Playground open — clicking the scrim closes it.'}
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
  title: 'Sidebar Tutorial/08 Interactive playground',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <PlaygroundDemo /> };
