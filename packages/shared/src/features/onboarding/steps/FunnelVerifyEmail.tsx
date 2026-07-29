import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { FunnelStepTransitionType } from '../types/funnel';
import type { FunnelStepVerifyEmail } from '../types/funnel';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '../../../components/onboarding/common';
import { CodeField } from '../../../components/fields/CodeField';
import { MailIcon } from '../../../components/icons';
import { AlertDot, AlertColor } from '../../../components/AlertDot';
import { IconSize } from '../../../components/Icon';
import { ClickableText } from '../../../components/buttons/ClickableText';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import useTimer from '../../../hooks/useTimer';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;
const noop = (): void => undefined;

/**
 * The funnel's own copy of the email-verification screen. The auth flow keeps
 * its original (`EmailCodeVerification` inside `AuthOptionsInner`) — this one
 * exists so the step reads like the rest of the onboarding: shared headline and
 * subheadline, the 440px rail, and the docked glass CTA instead of a button
 * sitting in the form.
 */
function FunnelVerifyEmailComponent({
  parameters: {
    headline = 'Verify your email',
    explainer = 'A verification code has been sent to:',
    cta = 'Verify',
    email = '',
  },
  onTransition,
}: FunnelStepVerifyEmail): ReactElement | null {
  const [code, setCode] = useState('');
  const { timer, setTimer, runTimer } = useTimer(noop, RESEND_SECONDS);
  const resendTimer = timer ?? 0;

  const complete = () =>
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: { code },
    });

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: cta }}
      disabled={code.length < CODE_LENGTH}
      onClick={complete}
      containerClassName="flex w-full flex-1 flex-col items-center overflow-hidden"
    >
      <div
        className={classNames(
          funnelStepRail,
          'flex flex-col items-center gap-6 py-6 pt-3',
        )}
      >
        {/* No tile, no border: just the envelope in the headline's own color
            with the product's unread dot (AlertDot, cabbage) on its shoulder —
            "you've got mail, go open it" said with two existing pieces. */}
        <span aria-hidden className="relative text-text-primary">
          <MailIcon secondary size={IconSize.XLarge} />
          <AlertDot className="-right-0.5 top-0" color={AlertColor.Cabbage} />
        </span>
        <OnboardingHeadline>{headline}</OnboardingHeadline>
        <OnboardingSubheadline>
          {explainer}
          {!!email && (
            <>
              <br />
              <strong className="text-text-primary">{email}</strong>
            </>
          )}
        </OnboardingSubheadline>
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Callout}
        >
          Don&apos;t see it? Also check your spam or junk folder.
        </Typography>
        <CodeField
          length={CODE_LENGTH}
          onChange={setCode}
          onSubmit={complete}
        />
        <div className="flex flex-col items-center gap-1">
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Callout}
          >
            Didn&apos;t get a verification code?
          </Typography>
          <ClickableText
            disabled={resendTimer > 0}
            onClick={() => {
              setTimer(RESEND_SECONDS);
              runTimer();
            }}
          >
            {resendTimer === 0 ? 'Resend code' : `Resend code ${resendTimer}s`}
          </ClickableText>
        </div>
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelVerifyEmail = withIsActiveGuard(FunnelVerifyEmailComponent);
