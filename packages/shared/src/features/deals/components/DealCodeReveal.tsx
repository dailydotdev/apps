import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { CopyIcon, MiniCloseIcon, VIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

export enum DealCodeRevealStep {
  Idle = 'idle',
  Revealed = 'revealed',
  Feedback = 'feedback',
  Thanks = 'thanks',
}

interface DealCodeRevealProps {
  code: string;
  revealLabel?: string;
  onReveal?: () => void;
  onCopy?: () => void;
  onFeedback?: (worked: boolean) => void;
  className?: string;
}

const StepFade = ({ children }: { children: ReactNode }): ReactElement => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={classNames(
        'transition-all duration-200 ease-out',
        entered ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
      )}
    >
      {children}
    </div>
  );
};

export const DealCodeReveal = ({
  code,
  revealLabel = 'Copy code',
  onReveal,
  onCopy,
  onFeedback,
  className,
}: DealCodeRevealProps): ReactElement => {
  const [step, setStep] = useState(DealCodeRevealStep.Idle);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [worked, setWorked] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const later = (fn: () => void, delay: number): void => {
    timers.current.push(setTimeout(fn, delay));
  };

  const onRevealClick = () => {
    setStep(DealCodeRevealStep.Revealed);
    onReveal?.();
  };

  const onCopyClick = async () => {
    try {
      await globalThis?.navigator?.clipboard?.writeText(code);
    } catch {
      setCopyFailed(true);

      return;
    }

    setCopyFailed(false);
    setCopied(true);
    onCopy?.();
    later(() => setStep(DealCodeRevealStep.Feedback), 1200);
  };

  const onFeedbackClick = (didWork: boolean) => {
    setWorked(didWork);
    setStep(DealCodeRevealStep.Thanks);
    onFeedback?.(didWork);
  };

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      {step === DealCodeRevealStep.Idle && (
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={onRevealClick}
        >
          {revealLabel}
        </Button>
      )}

      {step !== DealCodeRevealStep.Idle && (
        <StepFade key="code">
          <div className="flex items-center gap-2 rounded-12 border border-dashed border-border-subtlest-secondary bg-surface-float px-3 py-2">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              bold
              className="flex-1 truncate tracking-wider"
            >
              {code}
            </Typography>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              icon={copied ? <VIcon secondary /> : <CopyIcon />}
              onClick={onCopyClick}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </StepFade>
      )}

      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Caption1}
        color={
          copyFailed ? TypographyColor.StatusError : TypographyColor.Tertiary
        }
        aria-live="polite"
      >
        {copyFailed && 'Copy failed. Select the code above and copy it.'}
        {copied && !copyFailed && `Code ${code} copied to your clipboard.`}
      </Typography>

      {step === DealCodeRevealStep.Feedback && (
        <StepFade key="feedback">
          <div className="flex items-center gap-2">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
            >
              Did it work?
            </Typography>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              icon={<VIcon secondary size={IconSize.XSmall} />}
              onClick={() => onFeedbackClick(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.XSmall}
              icon={<MiniCloseIcon size={IconSize.XSmall} />}
              onClick={() => onFeedbackClick(false)}
            >
              No
            </Button>
          </div>
        </StepFade>
      )}

      {step === DealCodeRevealStep.Thanks && (
        <StepFade key="thanks">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Caption1}
            color={
              worked ? TypographyColor.StatusSuccess : TypographyColor.Tertiary
            }
          >
            {worked
              ? 'Thanks. Your check keeps this code trusted for everyone else.'
              : 'Thanks. Enough reports like yours and we bury this code.'}
          </Typography>
        </StepFade>
      )}
    </div>
  );
};
