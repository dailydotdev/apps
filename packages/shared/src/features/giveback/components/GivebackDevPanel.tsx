import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { RootPortal } from '../../../components/tooltips/Portal';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { GivebackGiftDockHandle } from './GivebackGiftDock';
import { GivebackGiftDock } from './GivebackGiftDock';
import { givebackInvitePrompts } from '../givebackInvitePrompts';

const PULSE_AMOUNTS = [1, 2, 3, 5, 8, 12];

// A self-contained QA panel for reviewing the gift entry point on any layout /
// preview deploy. Opt in with the `?giveback_debug` query param (so it never
// shows for real users); it mounts globally, independent of the header, and
// carries its OWN live gift preview so the money jump, invite prompts and
// celebration are visible even on the new layout where the header entry is
// hidden. Sits above everything, bottom-right.
export function GivebackDevPanel(): ReactElement | null {
  const { isLoggedIn } = useAuthContext();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);
  const dock = useRef<GivebackGiftDockHandle>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEnabled(window.location.search.includes('giveback_debug'));
    }
  }, []);

  if (!enabled || !isLoggedIn) {
    return null;
  }

  const pulse = () => {
    const amount =
      PULSE_AMOUNTS[Math.floor(Math.random() * PULSE_AMOUNTS.length)];
    dock.current?.pulseActivity(`+$${amount}`);
  };

  return (
    <RootPortal>
      <div
        className="fixed bottom-4 right-4 flex w-60 flex-col gap-2 rounded-12 border border-border-subtlest-secondary bg-background-popover p-3 shadow-3"
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
          <>
            {/* Live preview of the entry point — the prompt opens above/left so
               it stays on screen from the bottom-right corner. */}
            <div className="flex items-center justify-between gap-2 rounded-8 bg-surface-float px-2 py-1.5">
              <span className="text-text-tertiary typo-caption2">
                Live preview
              </span>
              <GivebackGiftDock
                ref={dock}
                variant="header"
                promptPlacement="above"
                promptAlign="end"
              />
            </div>

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
          </>
        )}
      </div>
    </RootPortal>
  );
}

export default GivebackDevPanel;
