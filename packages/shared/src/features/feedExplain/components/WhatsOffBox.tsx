import type {
  CSSProperties,
  FormEvent,
  ReactElement,
  ReactNode,
  RefObject,
} from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonColor,
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
import { LogEvent, TargetType } from '../../../lib/log';
import { pluralize } from '../../../lib/strings';
import type { WhatsOff, WhatsOffChange, WhatsOffLine } from '../types';
import {
  WhatsOffLineKind,
  WhatsOffOp,
  WhatsOffResponse,
  WhatsOffScope,
} from '../types';
import { useWhatsOff } from '../useWhatsOff';
import type { AppliedWhatsOffChange } from '../useWhatsOffChange';
import { useWhatsOffChange } from '../useWhatsOffChange';
import {
  getWhatsOffChangeCopy,
  getWhatsOffChangeExtra,
  getWhatsOffChangeKey,
  getWhatsOffDirectionLabel,
  getWhatsOffGapNote,
  getWhatsOffLineChanges,
  isWhatsOffLineShown,
  isWhatsOffNoteLine,
  WHATS_OFF_MAX_LENGTH,
} from '../whatsOff';
import { GetPlusButton, PlusUpsellFeature } from './PlusUpsell';

const kindLabels: Partial<Record<WhatsOffLineKind, string>> = {
  [WhatsOffLineKind.Unsure]: 'Did you mean',
  [WhatsOffLineKind.Choose]: 'Which did you mean?',
  [WhatsOffLineKind.Closest]: 'Closest we have',
};

const hintCopy =
  'Say what you want more or less of, like “less AI” or “more DevOps”.';
const outOfScopeCopy =
  'This box changes your feed. For anything else, send us feedback.';
const limitCopy = "You've reached today's limit. Try again tomorrow.";
const failureCopy = "Couldn't get an answer just now.";

const isOutOfScope = ({ response, scope }: WhatsOff): boolean =>
  response === WhatsOffResponse.None && scope === WhatsOffScope.OutOfScope;

// What the status line reads out once an answer lands.
const getAnswerStatus = (answer: WhatsOff): string => {
  const lines = answer.lines.filter(isWhatsOffLineShown);
  if (!lines.length) {
    return isOutOfScope(answer) ? outOfScopeCopy : hintCopy;
  }
  const count = lines.filter((line) => !isWhatsOffNoteLine(line)).length;
  return count
    ? `${count} suggested ${pluralize('change', count)}`
    : 'No changes to suggest';
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
  isConfirming: boolean;
  canUndo: boolean;
  /** Takes focus when the button the reader used goes away. */
  buttonRef: RefObject<HTMLButtonElement>;
  /** Takes focus after a change with no undo. */
  appliedRef: RefObject<HTMLSpanElement>;
  onApply: () => void;
  onConfirm: (isConfirming: boolean) => void;
  onUndo: () => void;
}

const ChangeRow = ({
  change,
  isApplied,
  isPending,
  isConfirming,
  canUndo,
  buttonRef,
  appliedRef,
  onApply,
  onConfirm,
  onUndo,
}: ChangeRowProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { title, detail } = getWhatsOffChangeCopy(change);
  const isLocked = change.plusOnly && !isPlus;
  // Nothing brings back what a reset forgets, so it asks first.
  const isReset = change.op === WhatsOffOp.Reset;

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
          <span
            ref={appliedRef}
            tabIndex={-1}
            className="flex h-8 items-center gap-1 font-bold text-accent-avocado-default typo-footnote"
          >
            <VIcon size={IconSize.Size16} />
            Applied
          </span>
          {canUndo && (
            <Button
              ref={buttonRef}
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={<UndoIcon />}
              aria-label={`Undo: ${title}`}
              loading={isPending}
              disabled={isPending}
              onClick={onUndo}
            >
              Undo
            </Button>
          )}
        </span>
      )}
      {!isLocked && !isApplied && isConfirming && (
        <span className="flex shrink-0 gap-2">
          <Button
            ref={buttonRef}
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            aria-label={`Cancel: ${title}`}
            disabled={isPending}
            onClick={() => onConfirm(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            color={ButtonColor.Ketchup}
            size={ButtonSize.Small}
            aria-label={`Yes, reset: ${title}`}
            loading={isPending}
            disabled={isPending}
            onClick={onApply}
          >
            Yes, reset
          </Button>
        </span>
      )}
      {!isLocked && !isApplied && !isConfirming && (
        <Button
          ref={buttonRef}
          type="button"
          className="shrink-0"
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
          aria-label={`Apply: ${title}`}
          loading={isPending}
          disabled={isPending}
          onClick={isReset ? () => onConfirm(true) : onApply}
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
  const changes = getWhatsOffLineChanges(line);
  const [picked, setPicked] = useState(
    changes.find((change) => change === line.change),
  );
  const [applied, setApplied] = useState<
    AppliedWhatsOffChange & { change: WhatsOffChange }
  >();
  const [isApplying, setIsApplying] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const appliedRef = useRef<HTMLSpanElement>(null);
  const shouldFocus = useRef(false);
  const isPending = isApplying || isUndoing;
  // A change set back elsewhere, like in Tune, can be applied again. An undo
  // on its way keeps the row applied, though the controls drop it at once.
  const isApplied =
    !!applied &&
    applied.change === picked &&
    (isUndoing || isInEffect(applied.change));
  const label = kindLabels[line.kind];
  const choices = isApplied
    ? []
    : changes.filter((option) => option !== picked);

  // The button the reader used goes away or waits disabled, so focus moves
  // to the one that replaces it once the row settles.
  useEffect(() => {
    if (!shouldFocus.current || isPending) {
      return;
    }
    shouldFocus.current = false;
    (buttonRef.current ?? appliedRef.current)?.focus();
  }, [isPending, isApplied, isConfirming, picked]);

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
    shouldFocus.current = true;
    setPicked(change);
    setIsConfirming(false);
    log(LogEvent.PickWhatsOffChoice, change);
  };

  const onConfirm = (isAsking: boolean) => {
    shouldFocus.current = true;
    setIsConfirming(isAsking);
  };

  const onApply = async () => {
    if (!picked || isPending) {
      return;
    }
    shouldFocus.current = true;
    setApplied(undefined);
    setIsApplying(true);
    const result = await apply(picked);
    setIsApplying(false);
    setIsConfirming(false);
    if (result) {
      setApplied({ ...result, change: picked });
      log(LogEvent.ApplyWhatsOffChange, picked);
    }
  };

  const onUndo = async () => {
    if (!applied?.undo || isPending) {
      return;
    }
    shouldFocus.current = true;
    setIsUndoing(true);
    const isUndone = await applied.undo();
    setIsUndoing(false);
    if (isUndone) {
      setApplied(undefined);
      log(LogEvent.UndoWhatsOffChange, applied.change);
    }
  };

  if (isWhatsOffNoteLine(line)) {
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
        <span className="min-w-0 shrink break-words text-text-tertiary">
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
          isConfirming={isConfirming}
          canUndo={!!applied?.undo}
          buttonRef={buttonRef}
          appliedRef={appliedRef}
          onApply={onApply}
          onConfirm={onConfirm}
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
              className="min-w-0 shrink"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              disabled={isPending}
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
  const { id, asks, lines } = answer;

  if (!lines.some(isWhatsOffLineShown)) {
    if (isOutOfScope(answer)) {
      return (
        <div className="flex flex-col items-start gap-2">
          <p className="text-text-secondary typo-callout">{outOfScopeCopy}</p>
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
    return <p className="text-text-secondary typo-callout">{hintCopy}</p>;
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
              className="min-w-0 shrink break-words rounded-8 border border-border-subtlest-tertiary px-2 py-0.5 text-text-secondary typo-footnote"
            >
              {getWhatsOffDirectionLabel(direction)}: {words}
            </li>
          ))}
        </ul>
      )}
      <ul aria-label="Suggested changes" className="flex flex-col gap-2">
        {lines.map(
          (line, index) =>
            isWhatsOffLineShown(line) && (
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
            ),
        )}
      </ul>
    </>
  );
};

const isRateLimited = (error: unknown): boolean =>
  !!getApiError(error as ApiErrorResult, ApiError.RateLimited);

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
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = isPending || !!answer || !!error;
  const isAtLimit = value.length >= WHATS_OFF_MAX_LENGTH;

  // A complaint that fails goes back in the input, so the reader can fix or
  // resend it, and leaves it once an answer comes.
  const send = (complaint: string) =>
    ask(complaint, {
      onError: () => setValue((current) => current || complaint),
      onSuccess: () =>
        setValue((current) => (current === complaint ? '' : current)),
    });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const complaint = value.trim();
    if (!complaint || isPending) {
      return;
    }
    send(complaint);
    setValue('');
  };

  const onClose = () => {
    clear();
    inputRef.current?.focus();
  };

  const onRetry = (complaint: string) => {
    send(complaint);
    // Try again goes with the error; Close stays, so focus stays in the answer.
    closeRef.current?.focus();
  };

  const getStatus = (): string => {
    if (isPending) {
      return 'Working on it';
    }
    if (error) {
      return isRateLimited(error) ? limitCopy : failureCopy;
    }
    return answer ? getAnswerStatus(answer) : '';
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
      <span role="status" aria-live="polite" className="sr-only">
        {getStatus()}
      </span>
      {isOpen && (
        <section
          aria-label="What's off"
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
              ref={closeRef}
              size={ButtonSize.Small}
              aria-label="Close suggestions"
              onClick={onClose}
            />
          </header>
          {/* Each submit starts its answer fresh in the same section. */}
          <React.Fragment key={submittedAt}>
            {isPending && <WhatsOffProgress />}
            {!!error && isRateLimited(error) && (
              <p className="text-text-secondary typo-callout">{limitCopy}</p>
            )}
            {!!error && !isRateLimited(error) && (
              <div className="flex flex-col items-start gap-2">
                <p className="text-text-secondary typo-callout">
                  {failureCopy}
                </p>
                {text && (
                  <Button
                    type="button"
                    variant={ButtonVariant.Secondary}
                    size={ButtonSize.Small}
                    onClick={() => onRetry(text)}
                  >
                    Try again
                  </Button>
                )}
              </div>
            )}
            {answer && <Answer answer={answer} />}
          </React.Fragment>
        </section>
      )}
      <p
        role="status"
        className={classNames(
          'px-4 text-text-tertiary typo-footnote',
          isAtLimit && 'pt-2',
        )}
      >
        {isAtLimit &&
          `You've reached the ${WHATS_OFF_MAX_LENGTH}-character limit.`}
      </p>
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
