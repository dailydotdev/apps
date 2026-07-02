import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { RootPortal } from '../../../components/tooltips/Portal';
import { useAuthContext } from '../../../contexts/AuthContext';
import { givebackInvitePrompts } from '../givebackInvitePrompts';
import { emitGivebackQa } from '../givebackQa';

// A floating QA panel for reviewing the gift entry point on any layout / preview
// deploy. Opt in with the `?giveback_debug` query param (never shows for real
// users). It drives the REAL mounted gift entry (header or sidebar) via the QA
// event bus, so the money jump, invite prompts and celebration play on the
// actual gift icon — not a separate preview.
export function GivebackDevPanel(): ReactElement | null {
  const { isLoggedIn } = useAuthContext();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEnabled(window.location.search.includes('giveback_debug'));
    }
  }, []);

  if (!enabled || !isLoggedIn) {
    return null;
  }

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
            <span className="text-text-tertiary typo-caption2">
              Plays on the live gift icon
            </span>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Primary}
              onClick={() => emitGivebackQa({ type: 'pulse' })}
            >
              💸 Money jump
            </Button>
            {givebackInvitePrompts.map((prompt, index) => (
              <Button
                key={prompt.id}
                type="button"
                size={ButtonSize.XSmall}
                variant={ButtonVariant.Secondary}
                onClick={() => emitGivebackQa({ type: 'prompt', index })}
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
              onClick={() => emitGivebackQa({ type: 'reset' })}
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
