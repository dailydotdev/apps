import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSetAtom } from 'jotai/react';
import type { FunnelStepOrganicSignup } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { OnboardingHeadline } from '../../../components/auth';
import { FooterLinks } from '../../../components/footer';
import AuthOptions from '../../../components/auth/AuthOptions';
import { AuthTriggers } from '../../../lib/auth';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';
import type { AuthProps } from '../../../components/auth/common';
import { AuthDisplay } from '../../../components/auth/common';
import { ExperimentWinner } from '../../../lib/featureValues';
import { wrapperMaxWidth } from '../../../components/onboarding/common';
import { OnboardingHeader } from '../../../components/onboarding/OnboardingHeader';
import { authAtom } from '../store/onboarding.store';
import type { AnonymousUser, LoggedUser } from '../../../lib/user';
import { useAuthContext } from '../../../contexts/AuthContext';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import {
  cloudinaryOnboardingFullBackgroundDesktop,
  cloudinaryOnboardingFullBackgroundMobile,
} from '../../../lib/image';

type FunnelOrganicSignupProps = FunnelStepOrganicSignup;

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

export const FunnelOrganicSignup = withIsActiveGuard(
  ({ parameters, onTransition }: FunnelOrganicSignupProps): ReactElement => {
    const {
      explainer,
      headline,
      image: srcDesktop = cloudinaryOnboardingFullBackgroundDesktop,
      imageMobile: src = cloudinaryOnboardingFullBackgroundMobile,
    } = parameters;
    const formRef = useRef<HTMLFormElement>(null);
    const isMobile = useViewSize(ViewSize.MobileL);
    const setAuth = useSetAtom(authAtom);
    const { isLoggedIn, isAuthReady, user } = useAuthContext();
    const [authDisplay, setAuthDisplay] = useState<AuthDisplay>(
      AuthDisplay.OnboardingSignup,
    );
    const isEmailSignupActive = authDisplay === AuthDisplay.Registration;
    const isSocialSignupActive =
      isAuthReady &&
      isLoggedIn &&
      'infoConfirmed' in user &&
      !user.infoConfirmed &&
      user?.providers?.some((prov) => prov !== 'password') &&
      !isEmailSignupActive;
    const onAuthStateUpdate = useCallback(
      (data: Partial<AuthProps>) => {
        const { defaultDisplay, isLoginFlow } = data;
        if (defaultDisplay) {
          setAuthDisplay(defaultDisplay);
        }

        if (isLoginFlow) {
          setAuth((prev) => ({
            ...prev,
            isLoginFlow: true,
            isAuthenticating: true,
            defaultDisplay: AuthDisplay.Default,
          }));
        }
      },
      [setAuthDisplay, setAuth],
    );

    const onSuccessfulRegistration = useCallback(
      (data: LoggedUser | AnonymousUser) => {
        onTransition?.({
          type: FunnelStepTransitionType.Complete,
          details: { user: data },
        });

        const isEmailSignup = 'infoConfirmed' in data && !data.infoConfirmed;
        if (isEmailSignup) {
          setAuth((prev) => ({
            ...prev,
            isLoginFlow: false,
            isAuthenticating: true,
            defaultDisplay: AuthDisplay.EmailVerification,
          }));
        }
      },
      [onTransition, setAuth],
    );

    useEffect(() => {
      if (isLoggedIn && isAuthReady && !!user.infoConfirmed) {
        onTransition?.({
          type: FunnelStepTransitionType.Complete,
          details: { user },
        });
      }
    }, [isAuthReady, isLoggedIn, onTransition, user]);

    if (!isAuthReady || (isLoggedIn && user.infoConfirmed)) {
      return null;
    }

    return (
      <div className="z-3 flex flex-1 flex-col items-center overflow-x-hidden">
        <OnboardingHeader isLanding />
        <div
          className={classNames(
            `flex w-full flex-1 flex-col flex-wrap content-center justify-center px-4 tablet:flex-row tablet:gap-10 tablet:px-6`,
            wrapperMaxWidth,
            isEmailSignupActive && 'mt-7.5',
          )}
        >
          <div
            className={classNames(
              'mt-5 flex flex-1 flex-col tablet:my-5 tablet:flex-grow',
              !isEmailSignupActive && 'laptop:mr-8 laptop:max-w-[27.5rem]',
            )}
          >
            {!isEmailSignupActive && !isSocialSignupActive && (
              <OnboardingHeadline
                className={{
                  title: 'tablet:typo-mega-1 typo-large-title',
                  description:
                    'mb-8 text-text-primary typo-body tablet:typo-title2',
                }}
                title={headline}
                description={explainer}
              />
            )}
            <AuthOptions
              {...staticAuthProps}
              defaultDisplay={
                isSocialSignupActive
                  ? AuthDisplay.SocialRegistration
                  : authDisplay
              }
              formRef={formRef}
              onboardingSignupButton={{
                size: isMobile ? ButtonSize.Medium : ButtonSize.Large,
                variant: ButtonVariant.Primary,
              }}
              onSuccessfulRegistration={onSuccessfulRegistration}
              onAuthStateUpdate={onAuthStateUpdate}
            />
          </div>
          <div className="flex flex-1 tablet:ml-auto tablet:flex-1 laptop:max-w-[37.5rem]" />
        </div>
        {!!src && (
          <img
            alt="Onboarding background"
            aria-hidden
            className={classNames(
              'pointer-events-none absolute inset-0 -z-1 size-full object-cover transition-opacity duration-150',
              { 'opacity-[.24]': isEmailSignupActive },
            )}
            fetchPriority="high"
            loading="eager"
            role="presentation"
            src={src}
            srcSet={`${src} 450w, ${srcDesktop || src} 1024w`}
            sizes="(max-width: 655px) 450px, 1024px"
          />
        )}
        <FooterLinks className="mx-auto pb-6" />
      </div>
    );
  },
);

export default FunnelOrganicSignup;
