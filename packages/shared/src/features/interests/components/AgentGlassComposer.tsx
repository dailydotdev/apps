import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { FlexRow } from '../../../components/utilities';
import { MagicIcon, SendAirplaneIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

/**
 * The composer as a pane of glass, for surfaces it does not own.
 *
 * On the workspace the field is furniture: a bar welded to the bottom of a
 * screen that is entirely the agent's. On the feed it is a visitor, so it
 * takes the onboarding panel's treatment instead — a framed sheet of glass
 * with the feed moving underneath it, throwing a little of its own colour on
 * what it covers.
 *
 * Two slots, and the split matters. `status` sits under the field and is
 * ambient: what the agents are doing, asking for nothing. `pending` sits over
 * it and is work with your name on it, so it is above the thing you type into
 * rather than below it.
 */
export const AgentGlassComposer = ({
  value,
  onChange,
  onSubmit,
  status,
  pending,
  placeholder = 'Spawn an agent to hunt something…',
  isBusy,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  status?: ReactNode;
  pending?: ReactNode;
  placeholder?: string;
  isBusy?: boolean;
  className?: string;
}): ReactElement => (
  <div className={classNames('relative w-full', className)}>
    {/* The colour it throws on whatever is passing underneath. */}
    <span
      aria-hidden
      className="agent-glass-bloom pointer-events-none absolute inset-x-10 bottom-0 top-4 rounded-24"
    />
    <div className="agent-glass-frame relative flex flex-col gap-1.5 rounded-20 p-1.5">
      {pending}
      <FlexRow className="agent-glass-field items-center gap-2 rounded-16 px-3 py-2">
        <MagicIcon
          size={IconSize.Size16}
          className="shrink-0 text-brand-default"
          aria-hidden
        />
        <input
          id="agent-feed-prompt"
          name="agent-feed-prompt"
          aria-label="What should the agent hunt for?"
          placeholder={placeholder}
          value={value}
          className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              onSubmit();
            }
          }}
        />
        <Button
          icon={
            // The airplane's mass sits left of its bounding box, so centring
            // the box leaves it reading low and left.
            <SendAirplaneIcon
              size={IconSize.XSmall}
              className="translate-x-px"
            />
          }
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          aria-label="Spawn the agent"
          loading={isBusy}
          disabled={!value.trim()}
          onClick={onSubmit}
        />
      </FlexRow>
      {status}
    </div>
  </div>
);
