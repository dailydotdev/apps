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
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { UndoIcon } from '@dailydotdev/shared/src/components/icons/Undo';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { ComplaintReading, Proposal } from '../policy/complaints';
import {
  describeEffect,
  getProposalEffect,
  interpretComplaint,
  isProposalApplied,
} from '../policy/complaints';
import { Duration } from '../policy/timed';
import { usePersonalization } from './PersonalizationContext';
import { GetPlusButton, isTimedLocked, PlusDurationPicker } from './plus';

const ProposalRow = ({
  proposal,
  suggestedDuration,
}: {
  proposal: Proposal;
  /** Offers a duration when the complaint sounded temporary. */
  suggestedDuration?: Duration;
}): ReactElement => {
  const { state, pool, next, now, applyChange } = usePersonalization();
  const { isPlus } = usePlusSubscription();
  const [duration, setDuration] = useState(
    isTimedLocked(suggestedDuration, isPlus)
      ? Duration.Ongoing
      : suggestedDuration ?? Duration.Ongoing,
  );
  const effective = isTimedLocked(duration, isPlus)
    ? Duration.Ongoing
    : duration;
  const built = useMemo(
    () =>
      proposal.timed && effective !== Duration.Ongoing
        ? { ...proposal, ...proposal.timed(effective) }
        : proposal,
    [proposal, effective],
  );
  const isLocked = !!proposal.isPlusOnly && !isPlus;
  const isApplied = isProposalApplied(built, state);
  const effect = useMemo(
    () =>
      isApplied
        ? undefined
        : getProposalEffect(built, { state, pool, next, now }),
    [isApplied, built, state, pool, next, now],
  );
  const lines = [
    { label: 'Stays', text: built.keeps },
    { label: 'Undo', text: built.undo },
    {
      label: 'Next page',
      text: effect
        ? describeEffect(effect, built)
        : 'Applied. Refresh to see it on your feed.',
    },
  ].filter(({ text }) => !!text);

  return (
    <li className="flex flex-col gap-2 rounded-12 bg-surface-float p-3">
      <div className="flex items-start gap-3">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className="min-w-0 shrink font-bold text-text-primary typo-callout">
              {built.title}
            </span>
            {isLocked && <PlusUser />}
          </span>
          <span className="text-text-secondary typo-footnote">
            {built.detail}
          </span>
        </span>
        {isLocked && <GetPlusButton className="shrink-0" />}
        {!isLocked && isApplied && (
          <span className="flex h-8 shrink-0 items-center gap-1 font-bold text-accent-avocado-default typo-footnote">
            <VIcon size={IconSize.Size16} />
            Applied
          </span>
        )}
        {!isLocked && !isApplied && (
          <Button
            type="button"
            className="shrink-0"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={() => applyChange(built.message, built.update)}
          >
            Apply
          </Button>
        )}
      </div>
      {proposal.timed && suggestedDuration && !isLocked && (
        <PlusDurationPicker
          label="For how long"
          value={duration}
          onChange={setDuration}
        />
      )}
      <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 typo-footnote">
        {lines.map(({ label, text }) => (
          <React.Fragment key={label}>
            <dt className="text-text-quaternary">{label}</dt>
            <dd className="text-text-tertiary">{text}</dd>
          </React.Fragment>
        ))}
      </dl>
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
          <ProposalRow
            key={`${reading.complaint}:${proposal.id}`}
            proposal={proposal}
            suggestedDuration={reading.duration}
          />
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
  onTune,
  isCompact,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  /** Opens Tune: the feed's controls beside the live feed. */
  onTune?: () => void;
  isCompact?: boolean;
}): ReactElement => {
  const store = usePersonalization();
  const { isPlus } = usePlusSubscription();
  const { lastMessage, notice, pendingCount, undo } = store;
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [reading, setReading] = useState<ComplaintReading | null>(null);
  // Each complaint gets fresh suggestions, even when it repeats the last one.
  const [readCount, setReadCount] = useState(0);
  const status = lastMessage ?? notice;

  const read = (complaint: string) => {
    const value = complaint.trim();
    if (!value) {
      return;
    }
    setReadCount((count) => count + 1);
    setReading(
      interpretComplaint(value, {
        state: store.state,
        pool: store.pool,
        served: store.served,
        next: store.next,
        isPlus,
        now: store.now,
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
          <ReadingPanel
            key={readCount}
            reading={reading}
            onClose={() => setReading(null)}
          />
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
            {onTune && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<SortIcon />}
                aria-label="Tune"
                title="Tune"
                onClick={onTune}
              >
                {isCompact ? undefined : 'Tune'}
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
