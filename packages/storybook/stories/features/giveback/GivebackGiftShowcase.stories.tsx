import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect, useRef, useState } from 'react';
import type { GivebackGiftDockHandle } from '@dailydotdev/shared/src/features/giveback/components/GivebackGiftDock';
import { GivebackGiftDock } from '@dailydotdev/shared/src/features/giveback/components/GivebackGiftDock';
import { givebackInvitePrompts } from '@dailydotdev/shared/src/features/giveback/givebackInvitePrompts';
import { useCountUp } from '@dailydotdev/shared/src/features/giveback/useGivebackMotion';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { withGiveback } from './giveback.mocks';

const ControlButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}): React.ReactElement => (
  <Button
    variant={ButtonVariant.Secondary}
    size={ButtonSize.Small}
    onClick={onClick}
  >
    {children}
  </Button>
);

// Mirrors the real old-layout header (MainLayoutHeader → HeaderButtons): full
// width, bottom border, h-16, logo left, and the action cluster right in the
// real order — opportunity, quests, [giveback gift], notifications, profile.
// The neighbours are Float-button-sized placeholders; the gift is the real
// component so it can be validated in its true header context.
const HeaderBar = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <header className="flex h-16 w-full items-center gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4">
    <span className="font-bold text-text-primary typo-title3">daily.dev</span>
    <div className="ml-auto flex items-center gap-3">
      <span className="size-10 rounded-full bg-surface-float" />
      <span className="size-10 rounded-full bg-surface-float" />
      {children}
      <span className="size-10 rounded-full bg-surface-float" />
      <span className="size-10 rounded-full bg-surface-float" />
    </div>
  </header>
);

const LivePlayground = ({
  variant,
}: {
  variant: 'header' | 'rail';
}): React.ReactElement => {
  const dock = useRef<GivebackGiftDockHandle>(null);
  const promptIndex = useRef(0);
  const [raisedToday, setRaisedToday] = useState(12340);
  const [ambient, setAmbient] = useState(false);
  const raised = useCountUp(raisedToday, true, 700);

  const cyclePrompt = () => {
    const next = givebackInvitePrompts[promptIndex.current];
    promptIndex.current =
      (promptIndex.current + 1) % givebackInvitePrompts.length;
    dock.current?.showPrompt(next);
  };

  // Ambient community activity — money keeps landing on its own (social proof).
  useEffect(() => {
    if (!ambient) {
      return undefined;
    }
    const tick = () => {
      const amount = [1, 2, 3, 5, 8, 12][Math.floor(Math.random() * 6)];
      setRaisedToday((current) => current + amount);
      dock.current?.pulseActivity(`+$${amount}`);
    };
    const interval = window.setInterval(tick, 1600);
    return () => window.clearInterval(interval);
  }, [ambient]);

  const dockNode = (
    <GivebackGiftDock ref={dock} variant={variant} showLabel={variant === 'rail'} />
  );

  return (
    <div className="flex w-[620px] max-w-full flex-col gap-6">
      {variant === 'header' ? (
        <HeaderBar>{dockNode}</HeaderBar>
      ) : (
        <div className="flex h-[380px] w-[240px] flex-col rounded-16 border border-border-subtlest-tertiary bg-background-default p-3">
          <div className="flex flex-col gap-2">
            {['Feed', 'Explore', 'Bookmarks'].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-10 px-2 py-1.5 text-text-tertiary typo-callout"
              >
                <span className="size-5 rounded bg-surface-float" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-auto border-t border-border-subtlest-tertiary pt-2">
            {dockNode}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4 antialiased">
        <span className="text-text-secondary typo-caption1 [text-wrap:pretty]">
          This entry point is an acquisition hook — its job is to pull people
          into the giveback page. Everything is generic + community-framed, not a
          personal tracker.
        </span>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent-avocado-default" />
          <span className="text-text-secondary typo-caption1">
            Community raised today:{' '}
            <span className="font-bold tabular-nums text-status-success">
              ${raised.toLocaleString('en-US')}
            </span>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <ControlButton onClick={cyclePrompt}>
            Show invite prompt →
          </ControlButton>
          <ControlButton onClick={() => setAmbient((v) => !v)}>
            {ambient ? 'Stop' : 'Start'} community activity
          </ControlButton>
          <ControlButton
            onClick={() => {
              dock.current?.reset();
              setRaisedToday(12340);
              setAmbient(false);
              promptIndex.current = 0;
            }}
          >
            Reset
          </ControlButton>
        </div>

        <span className="text-text-tertiary typo-caption2 [text-wrap:pretty]">
          “Show invite prompt” cycles through the message variants (social proof,
          how-it-works, cause spotlight, plain invite). Celebratory ones bloom +
          confetti.
        </span>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Features/Giveback/Entry points/Live playground',
  decorators: [withGiveback()],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      description: {
        component:
          'The gift entry point as an acquisition hook. Community money lands on the gift in real time — bare Polymarket-style dollar jumps (no chip) that flash on the button and leap up. A rotating generic invite prompt (with a visible auto-dismiss countdown) draws the eye into /giveback. No personal tracking. Motion is bounce:0 per the Jakub Krehel craft playbook.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Header: Story = {
  render: () => <LivePlayground variant="header" />,
};

export const Rail: Story = {
  render: () => <LivePlayground variant="rail" />,
};
