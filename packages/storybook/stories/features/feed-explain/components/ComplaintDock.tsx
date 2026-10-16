import type { FormEvent, ReactElement } from 'react';
import React, { useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons/Info';
import { MagicIcon } from '@dailydotdev/shared/src/components/icons/Magic';
import { SendAirplaneIcon } from '@dailydotdev/shared/src/components/icons/SendAirplane';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { ComplaintReading, Proposal } from '../policy/complaints';
import {
  complaintExamples,
  describeEffect,
  getProposalEffect,
  interpretComplaint,
  isProposalApplied,
} from '../policy/complaints';
import { usePersonalization } from './PersonalizationContext';

const ProposalRow = ({ proposal }: { proposal: Proposal }): ReactElement => {
  const { state, pool, next, applyChange } = usePersonalization();
  const isApplied = isProposalApplied(proposal, state);
  const effect = useMemo(
    () =>
      isApplied
        ? undefined
        : getProposalEffect(proposal, { state, pool, next }),
    [isApplied, proposal, state, pool, next],
  );

  return (
    <li className="flex items-start gap-3 rounded-12 bg-surface-float p-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold text-text-primary typo-callout">
          {proposal.title}
        </span>
        <span className="text-text-secondary typo-footnote">
          {proposal.detail}
        </span>
        <span className="text-text-tertiary typo-footnote">
          {effect
            ? describeEffect(effect, proposal)
            : 'Applied. Refresh to see it on your feed.'}
        </span>
      </span>
      {isApplied ? (
        <span className="flex h-8 shrink-0 items-center gap-1 font-bold text-accent-avocado-default typo-footnote">
          <VIcon size={IconSize.Size16} />
          Applied
        </span>
      ) : (
        <Button
          type="button"
          className="shrink-0"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          onClick={() => applyChange(proposal.message, proposal.update)}
        >
          Apply
        </Button>
      )}
    </li>
  );
};

const ReadingPanel = ({
  reading,
  onClose,
}: {
  reading: ComplaintReading;
  onClose: () => void;
}): ReactElement => (
  <section
    aria-label="What I can change"
    aria-live="polite"
    className="flex max-h-[min(30rem,60vh)] flex-col gap-3 overflow-y-auto border-b border-border-subtlest-tertiary p-4"
  >
    <header className="flex items-start justify-between gap-2">
      <span className="flex min-w-0 shrink items-center gap-2 pt-1">
        <MagicIcon
          size={IconSize.Size16}
          className="shrink-0 text-accent-cabbage-default"
        />
        <span className="min-w-0 shrink break-words font-bold text-text-primary typo-callout">
          “{reading.complaint}”
        </span>
      </span>
      <CloseButton
        size={ButtonSize.Small}
        aria-label="Close suggestions"
        onClick={onClose}
      />
    </header>
    {reading.findings.map((finding) => (
      <p key={finding} className="text-text-secondary typo-callout">
        {finding}
      </p>
    ))}
    {reading.proposals.length > 0 && (
      <ul className="flex flex-col gap-2" aria-label="Suggested changes">
        {reading.proposals.map((proposal) => (
          <ProposalRow key={proposal.id} proposal={proposal} />
        ))}
      </ul>
    )}
    {reading.limits.map((limit) => (
      <p
        key={limit}
        className="flex gap-2 rounded-12 border border-border-subtlest-tertiary p-3 text-text-tertiary typo-footnote"
      >
        <InfoIcon size={IconSize.Size16} className="mt-0.5 shrink-0" />
        <span className="min-w-0 shrink">{limit}</span>
      </p>
    ))}
  </section>
);

/**
 * The Explain bar: say what's off in your own words and get changes to the
 * feed you can apply, next to the last change, Undo and the screen's next step.
 */
export const ComplaintDock = ({
  primaryLabel,
  onPrimary,
  onOpenControls,
  isCompact,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  onOpenControls?: () => void;
  isCompact?: boolean;
}): ReactElement => {
  const store = usePersonalization();
  const { lastMessage, notice, pendingCount, undo } = store;
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [reading, setReading] = useState<ComplaintReading | null>(null);
  const status = lastMessage ?? notice;

  const read = (complaint: string) => {
    const value = complaint.trim();
    if (!value) {
      return;
    }
    setReading(
      interpretComplaint(value, {
        state: store.state,
        pool: store.pool,
        served: store.served,
        next: store.next,
      }),
    );
    setText('');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    read(text);
  };

  return (
    <div className="pointer-events-none sticky bottom-4 z-3 mt-8 flex justify-center tablet:bottom-6">
      <div
        className="pointer-events-auto flex w-full max-w-[40rem] flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-popover shadow-2"
        onKeyDown={(event) => {
          if (event.key === 'Escape' && reading) {
            setReading(null);
            inputRef.current?.focus();
          }
        }}
      >
        {reading && (
          <ReadingPanel reading={reading} onClose={() => setReading(null)} />
        )}
        {!reading && isFocused && !text && (
          <div className="flex flex-wrap gap-2 px-4 pt-3">
            {complaintExamples.map((example) => (
              <button
                key={example}
                type="button"
                className="h-8 rounded-10 bg-surface-float px-3 text-text-secondary typo-footnote hover:bg-surface-hover hover:text-text-primary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => read(example)}
              >
                {example}
              </button>
            ))}
          </div>
        )}
        {status && (
          <div
            role="status"
            className="flex min-h-10 items-center gap-2 px-4 pt-2"
          >
            <span
              className="min-w-0 flex-1 truncate text-text-secondary typo-footnote"
              title={status}
            >
              {status}
            </span>
            {pendingCount > 0 && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.XSmall}
                icon={<UndoIcon />}
                onClick={undo}
              >
                Undo
              </Button>
            )}
          </div>
        )}
        <form className="flex items-center gap-2 p-2" onSubmit={onSubmit}>
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-12 border border-transparent bg-surface-float pl-3 focus-within:border-border-subtlest-primary">
            <MagicIcon
              size={IconSize.Size16}
              className="shrink-0 text-text-tertiary"
            />
            <input
              ref={inputRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Tell us what's off about your feed"
              placeholder={
                isCompact ? "What's off?" : 'What\'s off? Try "too much AI"'
              }
              className={classNames(
                'min-w-0 flex-1 bg-transparent text-text-primary outline-none placeholder:text-text-quaternary',
                isCompact ? 'typo-footnote' : 'typo-callout',
              )}
            />
            <Button
              type="submit"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<SendAirplaneIcon />}
              aria-label="Send"
              disabled={!text.trim()}
            />
          </div>
          <span
            className={classNames(
              'flex items-center',
              isCompact ? 'gap-1' : 'gap-2',
            )}
          >
            {onOpenControls && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<SettingsIcon />}
                aria-label="Control center"
                title="Control center"
                onClick={onOpenControls}
              >
                {isCompact ? undefined : 'Control center'}
              </Button>
            )}
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              onClick={onPrimary}
            >
              {primaryLabel}
            </Button>
          </span>
        </form>
      </div>
    </div>
  );
};
