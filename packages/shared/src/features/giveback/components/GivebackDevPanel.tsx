import type { ReactElement, RefObject } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { RootPortal } from '../../../components/tooltips/Portal';
import type { GivebackGiftDockHandle } from './GivebackGiftDock';
import { givebackInvitePrompts } from '../givebackInvitePrompts';

const PULSE_AMOUNTS = [1, 2, 3, 5, 8, 12];

interface GivebackDevPanelProps {
  dock: RefObject<GivebackGiftDockHandle>;
}

// A floating QA panel for testing the gift entry point on a preview deploy (or
// locally). Opt-in via the `?giveback_debug` query param so it never shows for
// real users. Sits above everything, bottom-right; each button drives the gift
// dock so you can watch the money jump, the invite prompts, and the celebration
// on the header entry in real time.
export function GivebackDevPanel({
  dock,
}: GivebackDevPanelProps): ReactElement {
  const [open, setOpen] = useState(true);

  const pulse = () => {
    const amount =
      PULSE_AMOUNTS[Math.floor(Math.random() * PULSE_AMOUNTS.length)];
    dock.current?.pulseActivity(`+$${amount}`);
  };

  return (
    <RootPortal>
      <div
        className="fixed bottom-4 right-4 flex w-56 flex-col gap-2 rounded-12 border border-border-subtlest-secondary bg-background-popover p-3 shadow-3"
        style={{ zIndex: 2147483647 }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-text-primary typo-caption1">
            🧪 Giveback QA
          </span>
          <button
            type="button"
            aria-label={open ? 'Collapse panel' : 'Expand panel'}
            onClick={() => setOpen((value) => !value)}
            className="rounded grid size-5 place-items-center text-text-tertiary hover:bg-surface-float hover:text-text-primary"
          >
            {open ? '–' : '+'}
          </button>
        </div>

        {open && (
          <div className="flex flex-col gap-1.5">
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Primary}
              onClick={pulse}
            >
              💸 Money jump
            </Button>
            {givebackInvitePrompts.map((prompt) => (
              <Button
                key={prompt.id}
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Secondary}
                onClick={() => dock.current?.showPrompt(prompt)}
                className="!justify-start"
              >
                {prompt.celebrate ? '🎉 ' : '💬 '}
                {prompt.eyebrow ?? prompt.id}
              </Button>
            ))}
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Subtle}
              onClick={() => dock.current?.reset()}
            >
              Reset
            </Button>
          </div>
        )}
      </div>
    </RootPortal>
  );
}

export default GivebackDevPanel;
