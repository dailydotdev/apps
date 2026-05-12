import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon, ReadingStreakIcon, WhatsappIcon } from '../icons';
import { IconSize } from '../Icon';

/**
 * TEMPORARY QA helper — visual mock of the WhatsApp invite flow so reviewers
 * can see *what the friend actually receives* without leaving the app.
 * Three tiny screens stacked: outgoing message → friend's WhatsApp → tapped
 * link landing on the inviter's daily.dev profile/streak.
 *
 * This file lives next to the QA panel — delete it together with the panel.
 */

type Step = 'send' | 'receive' | 'land';

const STEPS: Step[] = ['send', 'receive', 'land'];

type StreakShareFlowDemoProps = {
  username: string;
  currentStreak: number;
  message: string;
  link: string;
};

// --- Step 1: outgoing message in WhatsApp composer

function SendStep({
  username,
  message,
  link,
}: {
  username: string;
  message: string;
  link: string;
}): ReactElement {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-avocado-default text-white">
          <WhatsappIcon size={IconSize.XXSmall} />
        </span>
        <Typography bold type={TypographyType.Caption1}>
          To: a friend
        </Typography>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="bg-accent-avocado-default/15 ml-auto max-w-[88%] rounded-12 rounded-br-4 px-3 py-2 text-text-primary">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Caption1}
            className="whitespace-pre-line"
          >
            {message}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            color={TypographyColor.Link}
            className="mt-1 block truncate"
          >
            {link}
          </Typography>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="mt-0.5 block text-right"
          >
            sent · just now ✓✓
          </Typography>
        </div>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          You ({username}) just shared your streak.
        </Typography>
      </div>
    </div>
  );
}

// --- Step 2: friend's WhatsApp inbox

function ReceiveStep({
  username,
  message,
  link,
}: {
  username: string;
  message: string;
  link: string;
}): ReactElement {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-avocado-default text-white">
          <WhatsappIcon size={IconSize.XXSmall} />
        </span>
        <Typography bold type={TypographyType.Caption1}>
          From: {username}
        </Typography>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="mr-auto max-w-[88%] rounded-12 rounded-bl-4 bg-surface-float px-3 py-2">
          <Typography
            tag={TypographyTag.P}
            type={TypographyType.Caption1}
            className="whitespace-pre-line"
          >
            {message}
          </Typography>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block truncate text-text-link underline typo-caption2"
          >
            {link}
          </a>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
            className="mt-0.5 block"
          >
            received · just now
          </Typography>
        </div>
        <div className="mx-auto flex items-center gap-1 text-text-tertiary">
          <ArrowIcon size={IconSize.XXSmall} className="rotate-180" />
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            Friend taps the link
          </Typography>
        </div>
      </div>
    </div>
  );
}

// --- Step 3: friend lands on inviter's profile/streak

function LandStep({
  username,
  currentStreak,
}: {
  username: string;
  currentStreak: number;
}): ReactElement {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-3 py-2">
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          🔒 daily.dev/{username}
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-2 px-3 py-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-bacon-default to-accent-cheese-default text-white">
          <ReadingStreakIcon secondary size={IconSize.Small} />
        </span>
        <Typography bold type={TypographyType.Callout}>
          @{username}
        </Typography>
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold leading-none text-accent-bacon-default typo-title2">
            {currentStreak}
          </span>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            day reading streak
          </Typography>
        </div>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
        >
          Start your own streak →
        </Button>
        <Typography
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
          className="text-center"
        >
          They sign up · their streak starts · you both keep reading
        </Typography>
      </div>
    </div>
  );
}

export function StreakShareFlowDemo({
  username,
  currentStreak,
  message,
  link,
}: StreakShareFlowDemoProps): ReactElement {
  const [step, setStep] = useState<Step>('send');
  const stepIndex = STEPS.indexOf(step);

  const goNext = () =>
    setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)] ?? 'send');
  const goPrev = () => setStep(STEPS[Math.max(stepIndex - 1, 0)] ?? 'send');

  return (
    <div className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-3">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <Typography bold type={TypographyType.Caption1}>
          {step === 'send' && '1 of 3 — You hit “Send”'}
          {step === 'receive' && '2 of 3 — Your friend opens WhatsApp'}
          {step === 'land' && '3 of 3 — They tap the link'}
        </Typography>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={classNames(
                'h-1 w-4 rounded-full transition-colors',
                i <= stepIndex
                  ? 'bg-accent-bacon-default'
                  : 'bg-border-subtlest-tertiary',
              )}
            />
          ))}
        </div>
      </div>

      {/* Mock device frame */}
      <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default">
        {step === 'send' && (
          <SendStep username={username} message={message} link={link} />
        )}
        {step === 'receive' && (
          <ReceiveStep username={username} message={message} link={link} />
        )}
        {step === 'land' && (
          <LandStep username={username} currentStreak={currentStreak} />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Tertiary}
          onClick={goPrev}
          disabled={stepIndex === 0}
        >
          Back
        </Button>
        <Button
          type="button"
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Primary}
          onClick={goNext}
          disabled={stepIndex === STEPS.length - 1}
        >
          {stepIndex === STEPS.length - 1 ? 'End of flow' : 'Next →'}
        </Button>
      </div>
    </div>
  );
}
