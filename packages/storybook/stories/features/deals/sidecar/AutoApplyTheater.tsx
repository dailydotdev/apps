import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  MiniCloseIcon,
  ShareIcon,
  ShieldCheckIcon,
  VIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { SidecarCart } from './sidecarMocks';
import {
  formatMoney,
  sidecarAutoApplyCodes,
  sidecarCart,
  sidecarSavings,
  usePrefersReducedMotion,
} from './sidecarMocks';

export type AutoApplyOutcome = 'success' | 'bestPrice';

type CodeStatus = 'pending' | 'testing' | 'failed' | 'worked';

const STEP_INTERVAL = 900;
const TEST_DURATION = 700;
const RESULT_DELAY = 900;
const COUNTDOWN_STEPS = 12;
const COUNTDOWN_STEP_DURATION = 50;

const statusLabel: Record<CodeStatus, string> = {
  pending: 'queued',
  testing: 'testing',
  failed: 'not valid',
  worked: 'worked',
};

const CodeRow = ({
  code,
  status,
  savings,
  animated,
}: {
  code: string;
  status: CodeStatus;
  savings: number;
  animated: boolean;
}): ReactElement => (
  <li
    className={classNames(
      'flex items-center gap-3 rounded-10 px-3 py-2',
      status === 'worked' && 'bg-action-upvote-float',
      status === 'worked' && animated && 'animate-reward-pop',
      status === 'testing' && 'bg-surface-float',
    )}
  >
    <span
      className={classNames(
        'flex size-5 items-center justify-center rounded-full',
        status === 'worked' ? 'bg-status-success' : 'bg-surface-float',
      )}
    >
      {status === 'worked' && (
        <VIcon size={IconSize.Size16} className="text-background-default" />
      )}
      {status === 'testing' && animated && (
        <span className="size-2 animate-pulse rounded-full bg-text-tertiary" />
      )}
    </span>
    <Typography
      tag={TypographyTag.Span}
      type={TypographyType.Footnote}
      color={
        status === 'pending'
          ? TypographyColor.Quaternary
          : TypographyColor.Primary
      }
      className="flex-1 font-bold tracking-wider"
    >
      {code}
    </Typography>
    {status === 'worked' ? (
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Footnote}
        color={TypographyColor.StatusSuccess}
        bold
        className="tabular-nums"
      >
        -{formatMoney(savings)}
      </Typography>
    ) : (
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={
          status === 'failed'
            ? TypographyColor.Tertiary
            : TypographyColor.Quaternary
        }
      >
        {statusLabel[status]}
      </Typography>
    )}
  </li>
);

const ResultBlock = ({
  outcome,
  savings,
  total,
  winningCode,
  animated,
  onShare,
  onSeeDeals,
  onClose,
}: {
  outcome: AutoApplyOutcome;
  savings: number;
  total: number;
  winningCode: string;
  animated: boolean;
  onShare?: () => void;
  onSeeDeals?: () => void;
  onClose: () => void;
}): ReactElement => {
  const isSuccess = outcome === 'success';

  return (
    <div
      className={classNames(
        'flex flex-col items-center gap-2 px-2 pb-1 pt-3 text-center',
        animated && 'animate-reward-pop',
      )}
    >
      <span
        className={classNames(
          'flex size-12 items-center justify-center rounded-full',
          isSuccess ? 'bg-action-upvote-float' : 'bg-surface-float',
        )}
      >
        {isSuccess ? (
          <VIcon size={IconSize.Large} className="text-status-success" />
        ) : (
          <ShieldCheckIcon
            size={IconSize.Large}
            className="text-text-primary"
          />
        )}
      </span>
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
        bold
        className="tabular-nums"
      >
        {isSuccess
          ? `You saved ${formatMoney(savings)}`
          : 'You already have the best price'}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {isSuccess
          ? `${winningCode} is applied. Your new total is ${formatMoney(
              total,
            )}.`
          : 'Nothing beats it today. We tried every community code on this cart.'}
      </Typography>
      <Typography
        tag={TypographyTag.Span}
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
        className="mt-1"
      >
        {isSuccess
          ? 'Verified by devs on daily.dev minutes ago.'
          : 'No affiliate link was added. We only take credit when we actually save you money.'}
      </Typography>
      <div className="mt-3 flex w-full flex-col gap-2">
        {isSuccess ? (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            icon={<ShareIcon />}
            onClick={onShare}
            className="w-full"
          >
            Share this deal
          </Button>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
            onClick={onSeeDeals}
            className="w-full"
          >
            Browse dev deals
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Medium}
          onClick={onClose}
          className="w-full"
        >
          {isSuccess ? 'Back to checkout' : 'Continue to checkout'}
        </Button>
      </div>
    </div>
  );
};

interface AutoApplyTheaterProps {
  outcome: AutoApplyOutcome;
  codes?: string[];
  cart?: SidecarCart;
  savings?: number;
  onClose: () => void;
  onShare?: () => void;
  onSeeDeals?: () => void;
}

export const AutoApplyTheater = ({
  outcome,
  codes = sidecarAutoApplyCodes,
  cart = sidecarCart,
  savings = sidecarSavings,
  onClose,
  onShare,
  onSeeDeals,
}: AutoApplyTheaterProps): ReactElement => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const winningIndex = outcome === 'success' ? codes.length - 1 : -1;
  const finalTotal =
    outcome === 'success' ? cart.subtotal - savings : cart.subtotal;

  const finalStatuses = useMemo<CodeStatus[]>(
    () =>
      codes.map((unused, index) =>
        index === winningIndex ? 'worked' : 'failed',
      ),
    [codes, winningIndex],
  );

  const [statuses, setStatuses] = useState<CodeStatus[]>(() =>
    codes.map(() => 'pending'),
  );
  const [total, setTotal] = useState(cart.subtotal);
  const [isFinished, setIsFinished] = useState(false);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setStatuses(finalStatuses);
      setTotal(finalTotal);
      setIsFinished(true);

      return undefined;
    }

    const timers: number[] = [];
    const setStatusAt = (index: number, status: CodeStatus) =>
      setStatuses((current) =>
        current.map((value, position) => (position === index ? status : value)),
      );

    codes.forEach((unused, index) => {
      timers.push(
        window.setTimeout(
          () => setStatusAt(index, 'testing'),
          index * STEP_INTERVAL,
        ),
      );
      timers.push(
        window.setTimeout(
          () => setStatusAt(index, finalStatuses[index]),
          index * STEP_INTERVAL + TEST_DURATION,
        ),
      );
    });

    const lastResolveAt = (codes.length - 1) * STEP_INTERVAL + TEST_DURATION;

    if (outcome === 'success') {
      timers.push(
        window.setTimeout(() => {
          let step = 0;
          countdownRef.current = window.setInterval(() => {
            step += 1;
            const isLastStep = step >= COUNTDOWN_STEPS;
            setTotal(
              isLastStep
                ? finalTotal
                : cart.subtotal - (savings * step) / COUNTDOWN_STEPS,
            );

            if (isLastStep && countdownRef.current) {
              window.clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
          }, COUNTDOWN_STEP_DURATION);
        }, lastResolveAt),
      );
    }

    timers.push(
      window.setTimeout(
        () => setIsFinished(true),
        lastResolveAt + RESULT_DELAY,
      ),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));

      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [
    cart.subtotal,
    codes,
    finalStatuses,
    finalTotal,
    outcome,
    prefersReducedMotion,
    savings,
  ]);

  const resolvedCount = statuses.filter(
    (status) => status === 'failed' || status === 'worked',
  ).length;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-overlay-primary-pepper px-4">
      <div className="flex w-[26rem] max-w-full flex-col gap-4 rounded-16 border border-border-subtlest-quaternary bg-background-default p-5 shadow-3">
        <header className="flex items-center gap-3">
          <LogoIcon className={{ container: 'w-7 rounded-8' }} />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Footnote}
            color={TypographyColor.Primary}
            bold
            className="flex-1"
          >
            {isFinished
              ? `Tried ${codes.length} community codes`
              : `Trying ${codes.length} codes...`}
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            icon={<MiniCloseIcon size={IconSize.Size16} />}
            onClick={onClose}
            aria-label="Close auto apply"
          />
        </header>

        <span className="h-0.5 w-full overflow-hidden rounded-full bg-surface-float">
          <span
            className={classNames(
              'block h-full rounded-full bg-text-primary',
              !prefersReducedMotion &&
                'transition-[width] duration-300 ease-out',
            )}
            style={{ width: `${(resolvedCount / codes.length) * 100}%` }}
          />
        </span>

        {isFinished ? (
          <ResultBlock
            outcome={outcome}
            savings={savings}
            total={finalTotal}
            winningCode={winningIndex >= 0 ? codes[winningIndex] : ''}
            animated={!prefersReducedMotion}
            onShare={onShare}
            onSeeDeals={onSeeDeals}
            onClose={onClose}
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {codes.map((code, index) => (
              <CodeRow
                key={code}
                code={code}
                status={statuses[index]}
                savings={savings}
                animated={!prefersReducedMotion}
              />
            ))}
          </ul>
        )}

        <footer className="flex items-center justify-between border-t border-border-subtlest-tertiary pt-3">
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Cart total
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Callout}
            color={
              outcome === 'success' && isFinished
                ? TypographyColor.StatusSuccess
                : TypographyColor.Primary
            }
            bold
            className="tabular-nums"
          >
            {formatMoney(total)}
          </Typography>
        </footer>
      </div>
    </div>
  );
};
