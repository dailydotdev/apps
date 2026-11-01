import type { CSSProperties, FormEvent, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import CloseButton from '../../../components/CloseButton';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { FeedbackIcon } from '../../../components/icons/Feedback';
import { MagicIcon } from '../../../components/icons/Magic';
import { SendAirplaneIcon } from '../../../components/icons/SendAirplane';
import { UndoIcon } from '../../../components/icons/Undo';
import { VIcon } from '../../../components/icons/V';
import { IconSize } from '../../../components/Icon';
import { Loader } from '../../../components/Loader';
import { LazyModal } from '../../../components/modals/common/types';
import { PlusUser } from '../../../components/PlusUser';
import { useLogContext } from '../../../contexts/LogContext';
import type { ApiErrorResult } from '../../../graphql/common';
import { ApiError, getApiError } from '../../../graphql/common';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { labels } from '../../../lib/labels';
import { LogEvent, TargetType } from '../../../lib/log';
import type { WhatsOff, WhatsOffChange, WhatsOffLine } from '../types';
import { WhatsOffLineKind, WhatsOffResponse, WhatsOffScope } from '../types';
import { useWhatsOff } from '../useWhatsOff';
import type { AppliedWhatsOffChange } from '../useWhatsOffChange';
import { useWhatsOffChange } from '../useWhatsOffChange';
import {
  getWhatsOffChangeCopy,
  getWhatsOffChangeExtra,
  getWhatsOffChangeKey,
  getWhatsOffDirectionLabel,
  getWhatsOffGapNote,
  WHATS_OFF_MAX_LENGTH,
} from '../whatsOff';
import { GetPlusButton, PlusUpsellFeature } from './PlusUpsell';

const kindLabels: Partial<Record<WhatsOffLineKind, string>> = {
  [WhatsOffLineKind.Unsure]: 'Did you mean',
  [WhatsOffLineKind.Choose]: 'Which did you mean?',
  [WhatsOffLineKind.Closest]: 'Closest we have',
};

// The answer's steps in the order the API runs them, with when each starts
// to show. The API answers once, so the steps follow the usual timing of a
// read, a lookup and a pick; the last one stays until the answer is in.
const progressSteps = [
  { label: 'Reading your feed', startsAt: 0 },
  { label: 'Finding the topics and sources you mean', startsAt: 900 },
  { label: 'Picking the changes', startsAt: 1300 },
];

// Each row of the answer rises in a beat after the one above it.
const rowStagger = (index: number): CSSProperties => ({
  animationDelay: `${index * 60}ms`,
});

const WhatsOffProgress = (): ReactElement => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = progressSteps
      .slice(1)
      .map(({ startsAt }, index) =>
        setTimeout(() => setStep(index + 1), startsAt),
      );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-1.5" aria-label="Working on it">
        {progressSteps.map(({ label }, index) => {
          const isDone = index < step;
          const isActive = index === step;
          return (
            <li
              key={label}
              aria-current={isActive ? 'step' : undefined}
              className={classNames(
                'flex items-center gap-2 transition-colors duration-200 typo-callout',
                isActive && 'text-text-primary',
                isDone && 'text-text-tertiary',
                !isActive && !isDone && 'text-text-quaternary',
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                {isDone && (
                  <VIcon
                    size={IconSize.Size16}
                    className="text-accent-avocado-default motion-safe:animate-composer-in"
                  />
                )}
                {isActive && <Loader />}
                {!isDone && !isActive && (
                  <span className="size-1.5 rounded-4 bg-text-quaternary" />
                )}
              </span>
              {label}
            </li>
          );
        })}
      </ol>
      {/* Where the changes will land, so the answer takes their place. */}
      <div aria-hidden className="flex flex-col gap-2">
        {['w-2/5', 'w-1/3'].map((width) => (
          <div
            key={width}
            className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary p-3"
          >
            <ElementPlaceholder
              className={classNames(
                'h-3 rounded-8 motion-safe:animate-pulse',
                width,
              )}
            />
            <ElementPlaceholder className="h-3 w-3/4 rounded-8 motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ChangeRowProps {
  change: WhatsOffChange;
  isApplied: boolean;
  isPending: boolean;
  canUndo: boolean;
  onApply: () => void;
  onUndo: () => void;
}

const ChangeRow = ({
  change,
  isApplied,
  isPending,
  canUndo,
  onApply,
  onUndo,
}: ChangeRowProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { title, detail } = getWhatsOffChangeCopy(change);
  const isLocked = change.plusOnly && !isPlus;

  return (
    <div className="flex items-start gap-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="min-w-0 shrink break-words font-bold text-text-primary typo-callout">
            {title}
          </span>
          {isLocked && <PlusUser />}
        </span>
        {detail && (
          <span className="text-text-secondary typo-footnote">{detail}</span>
        )}
      </span>
      {isLocked && (
        <GetPlusButton
          feature={PlusUpsellFeature.WhatsOff}
          className="shrink-0"
        />
      )}
      {!isLocked && isApplied && (
        <span className="flex shrink-0 items-center gap-1">
          <span className="flex h-8 items-center gap-1 font-bold text-accent-avocado-default typo-footnote">
            <VIcon size={IconSize.Size16} />
            Applied
          </span>
          {canUndo && (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<UndoIcon />}
              loading={isPending}
              onClick={onUndo}
            >
              Undo
            </Button>
          )}
        </span>
      )}
      {!isLocked && !isApplied && (
        <Button
          type="button"
          className="shrink-0"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          loading={isPending}
          onClick={onApply}
        >
          Apply
        </Button>
      )}
    </div>
  );
};

type ChangeActions = ReturnType<typeof useWhatsOffChange>;

interface LineRowProps extends ChangeActions {
  answerId: string;
  line: WhatsOffLine;
  index: number;
}

const LineRow = ({
  answerId,
  line,
  index,
  apply,
  isInEffect,
}: LineRowProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const [picked, setPicked] = useState(line.change ?? undefined);
  const [applied, setApplied] = useState<
    AppliedWhatsOffChange & { change: WhatsOffChange }
  >();
  const [isPending, setIsPending] = useState(false);
  const isApplied =
    !!applied && applied.change === picked && isInEffect(applied.change);
  const label = kindLabels[line.kind];
  const choices = isApplied
    ? []
    : [line.change, ...line.alternatives].filter(
        (option): option is WhatsOffChange => !!option && option !== picked,
      );

  const log = (event: LogEvent, change: WhatsOffChange) =>
    logEvent({
      event_name: event,
      target_type: TargetType.WhatsOff,
      target_id: answerId,
      extra: JSON.stringify(
        getWhatsOffChangeExtra(line, index, change, isPlus),
      ),
    });

  const onPick = (change: WhatsOffChange) => {
    setPicked(change);
    log(LogEvent.PickWhatsOffChoice, change);
  };

  const onApply = async () => {
    if (!picked) {
      return;
    }
    setIsPending(true);
    const result = await apply(picked);
    setIsPending(false);
    if (result) {
      setApplied({ ...result, change: picked });
      log(LogEvent.ApplyWhatsOffChange, picked);
    }
  };

  const onUndo = async () => {
    if (!applied?.undo) {
      return;
    }
    setIsPending(true);
    const isUndone = await applied.undo();
    setIsPending(false);
    if (isUndone) {
      setApplied(undefined);
      log(LogEvent.UndoWhatsOffChange, applied.change);
    }
  };

  if (
    line.kind === WhatsOffLineKind.Missing ||
    line.kind === WhatsOffLineKind.Already
  ) {
    const isMissing = line.kind === WhatsOffLineKind.Missing;
    return (
      <li
        className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary p-3 motion-safe:animate-composer-in"
        style={rowStagger(index + 1)}
      >
        <span className="break-words text-text-tertiary typo-footnote">
          “{line.words}”
        </span>
        <span className="font-bold text-text-primary typo-callout">
          {isMissing ? 'Not possible yet' : 'Already set'}
        </span>
        {isMissing && (
          <span className="text-text-secondary typo-footnote">
            {getWhatsOffGapNote(line)}
          </span>
        )}
      </li>
    );
  }

  return (
    <li
      className="flex flex-col gap-2 rounded-12 bg-surface-float p-3 motion-safe:animate-composer-in"
      style={rowStagger(index + 1)}
    >
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 typo-footnote">
        <span className="min-w-0 break-words text-text-tertiary">
          “{line.words}”
        </span>
        {label && (!picked || line.kind !== WhatsOffLineKind.Choose) && (
          <span className="font-bold text-text-secondary">{label}</span>
        )}
      </span>
      {picked && (
        <ChangeRow
          change={picked}
          isApplied={isApplied}
          isPending={isPending}
          canUndo={!!applied?.undo}
          onApply={onApply}
          onUndo={onUndo}
        />
      )}
      {line.kind === WhatsOffLineKind.Closest && (
        <span className="text-text-tertiary typo-footnote">
          {getWhatsOffGapNote(line)}
        </span>
      )}
      {choices.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {picked && (
            <span className="text-text-tertiary typo-footnote">Or</span>
          )}
          {choices.map((choice) => (
            <Button
              key={getWhatsOffChangeKey(choice)}
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              onClick={() => onPick(choice)}
            >
              {getWhatsOffChangeCopy(choice).title}
            </Button>
          ))}
        </div>
      )}
    </li>
  );
};

const Answer = ({ answer }: { answer: WhatsOff }): ReactElement => {
  const { openModal } = useLazyModal();
  const { apply, isInEffect } = useWhatsOffChange();
  const { id, response, scope, asks, lines } = answer;

  if (!lines.length) {
    if (
      response === WhatsOffResponse.None &&
      scope === WhatsOffScope.OutOfScope
    ) {
      return (
        <div className="flex flex-col items-start gap-2">
          <p className="text-text-secondary typo-callout">
            This box changes your feed. For anything else, send us feedback.
          </p>
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            icon={<FeedbackIcon />}
            onClick={() => openModal({ type: LazyModal.Feedback })}
          >
            Send feedback
          </Button>
        </div>
      );
    }
    return (
      <p className="text-text-secondary typo-callout">
        Say what you want more or less of, like “less AI” or “more DevOps”.
      </p>
    );
  }

  return (
    <>
      {asks.length > 0 && (
        <ul
          aria-label="What you asked for"
          className="flex flex-wrap gap-2 motion-safe:animate-composer-in"
        >
          {asks.map(({ words, direction }) => (
            <li
              key={`${direction}:${words}`}
              className="rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-secondary typo-footnote"
            >
              {getWhatsOffDirectionLabel(direction)}: {words}
            </li>
          ))}
        </ul>
      )}
      <ul aria-label="Suggested changes" className="flex flex-col gap-2">
        {lines.map((line, index) => (
          <LineRow
            key={[
              line.kind,
              line.words,
              line.change && getWhatsOffChangeKey(line.change),
            ].join(':')}
            answerId={id}
            line={line}
            index={index}
            apply={apply}
            isInEffect={isInEffect}
          />
        ))}
      </ul>
    </>
  );
};

const getErrorMessage = (error: unknown): string =>
  getApiError(error as ApiErrorResult, ApiError.RateLimited)
    ? "You've reached today's limit. Try again tomorrow."
    : labels.error.generic;

interface WhatsOffBoxProps {
  version: number;
  /** The bar's own buttons, beside the input. */
  children: ReactNode;
  /** Narrow screens: a shorter placeholder. */
  isCompact?: boolean;
  className?: string;
}

/**
 * What's off in Debug's bar: the reader says what's wrong with For You in
 * their own words and gets changes to apply one by one, above the input.
 */
export const WhatsOffBox = ({
  version,
  children,
  isCompact,
  className,
}: WhatsOffBoxProps): ReactElement => {
  const { answer, text, isPending, error, submittedAt, ask, clear } =
    useWhatsOff(version);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpen = isPending || !!answer || !!error;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const complaint = value.trim();
    if (!complaint || isPending) {
      return;
    }
    ask(complaint);
    setValue('');
  };

  const onClose = () => {
    clear();
    inputRef.current?.focus();
  };

  return (
    // Escape from the input or any button in the answer closes it.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={classNames(
        'flex w-full max-w-[40rem] flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-popover shadow-2',
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          onClose();
        }
      }}
    >
      {isOpen && (
        <section
          key={submittedAt}
          aria-label="What's off"
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
                “{text}”
              </span>
            </span>
            <CloseButton
              size={ButtonSize.Small}
              aria-label="Close suggestions"
              onClick={onClose}
            />
          </header>
          {isPending && <WhatsOffProgress />}
          {!!error && (
            <p className="text-text-secondary typo-callout">
              {getErrorMessage(error)}
            </p>
          )}
          {answer && <Answer answer={answer} />}
        </section>
      )}
      <form className="flex items-center gap-2 p-2" onSubmit={onSubmit}>
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-12 border border-transparent bg-surface-float pl-3 focus-within:border-border-subtlest-primary">
          <MagicIcon
            size={IconSize.Size16}
            className="shrink-0 text-text-tertiary"
          />
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={WHATS_OFF_MAX_LENGTH}
            aria-label="Tell us what's off about your feed"
            placeholder={
              isCompact ? "What's off?" : 'What\'s off? Try "too much AI"'
            }
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent text-text-primary outline-none typo-callout placeholder:text-text-quaternary"
          />
          <Button
            type="submit"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<SendAirplaneIcon />}
            aria-label="Send"
            loading={isPending}
            disabled={!value.trim() || isPending}
          />
        </div>
        <span className="flex items-center gap-1 tablet:gap-2">{children}</span>
      </form>
    </div>
  );
};
