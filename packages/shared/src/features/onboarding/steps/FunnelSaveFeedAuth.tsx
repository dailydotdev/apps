import type { ReactElement } from 'react';
import React, { useCallback, useRef } from 'react';
import classNames from 'classnames';
import type { FunnelStepSaveFeedAuth } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import AuthOptions from '../../../components/auth/AuthOptions';
import { AuthTriggers } from '../../../lib/auth';
import { AuthDisplay } from '../../../components/auth/common';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '../../../lib/image';
import { ExperimentWinner } from '../../../lib/featureValues';

const DEMO_TAGS = [
  'Go',
  'Kubernetes',
  'AI Infrastructure',
  'FinTech',
  'Backend',
];

const staticAuthProps = {
  className: {
    container: classNames(
      'w-full max-w-full rounded-none tablet:max-w-[30rem]',
    ),
    onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
  },
  forceDefaultDisplay: true,
  simplified: true,
  targetId: ExperimentWinner.OnboardingV4,
  trigger: AuthTriggers.Onboarding,
};

function SaveFeedAuthComponent({
  parameters: {
    image: srcDesktop = cloudinaryOnboardingFullBackgroundDesktop,
    imageMobile: src = cloudinaryOnboardingFullBackgroundMobile,
  },
  onTransition,
}: FunnelStepSaveFeedAuth): ReactElement {
  const formRef = useRef<HTMLFormElement>(null);
  const isMobile = useViewSize(ViewSize.MobileL);

  const handleSkipForDemo = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Complete });
  }, [onTransition]);

  return (
    <div className="relative z-3 flex flex-1 flex-col items-center">
      <div
        className={classNames(
          'flex w-full max-w-5xl flex-1 flex-col flex-wrap content-center justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6',
        )}
      >
        {/* Left side - Value recap */}
        <div className="mt-5 flex flex-1 flex-col items-start justify-center tablet:my-5 laptop:mr-8 laptop:max-w-[27.5rem]">
          <Typography
            tag={TypographyTag.H1}
            type={TypographyType.LargeTitle}
            bold
            className="mb-4 bg-gradient-to-r from-accent-cabbage-default to-accent-onion-default bg-clip-text text-transparent"
          >
            Your feed is ready. Save it.
          </Typography>

          {/* Mini tag preview */}
          <div className="border-accent-cabbage-default/40 mb-6 rounded-16 border border-dashed p-4">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mb-2"
            >
              Personalized for you
            </Typography>
            <div className="flex flex-wrap gap-2">
              {DEMO_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-8 bg-surface-float px-2.5 py-1 text-text-secondary typo-subhead"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex flex-1 flex-col tablet:ml-auto tablet:flex-1 laptop:max-w-[30rem]">
          <AuthOptions
            {...staticAuthProps}
            defaultDisplay={AuthDisplay.OnboardingSignup}
            formRef={formRef}
            onboardingSignupButton={{
              size: isMobile ? ButtonSize.Medium : ButtonSize.Large,
              variant: ButtonVariant.Primary,
            }}
            onSuccessfulRegistration={(user) => {
              onTransition({
                type: FunnelStepTransitionType.Complete,
                details: { user },
              });
            }}
            onSuccessfulLogin={() => {
              onTransition({ type: FunnelStepTransitionType.Complete });
            }}
          />

          {/* Skip for demo */}
          <button
            type="button"
            className="mx-auto mt-4 text-text-quaternary transition-colors typo-callout hover:text-text-tertiary"
            onClick={handleSkipForDemo}
          >
            Skip for demo &rarr;
          </button>
        </div>
      </div>

      {/* Background image */}
      {!!src && (
        <picture>
          <source media="(max-width: 655px)" srcSet={src} />
          <source media="(min-width: 656px)" srcSet={srcDesktop || src} />
          <img
            alt="Onboarding background"
            aria-hidden
            className="opacity-30 pointer-events-none absolute inset-0 -z-1 size-full object-cover"
            fetchPriority="high"
            loading="eager"
            role="presentation"
            src={src}
          />
        </picture>
      )}
    </div>
  );
}

export const FunnelSaveFeedAuth = withIsActiveGuard(SaveFeedAuthComponent);
