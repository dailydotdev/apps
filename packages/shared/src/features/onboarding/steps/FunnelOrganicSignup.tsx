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
import { useOnboardingActions } from '../../../hooks/auth';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { sanitizeMessage } from '../lib/utils';
import ConditionalWrapper from '../../../components/ConditionalWrapper';

type FunnelOrganicSignupProps = FunnelStepOrganicSignup;

const staticAuthProps = {
  className: {
    container: classNames(
      'tablet:max-w-[30rem] w-full max-w-full rounded-none',
    ),
    onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
  },
  forceDefaultDisplay: true,
  simplified: true,
  targetId: ExperimentWinner.OnboardingV4,
  trigger: AuthTriggers.Onboarding,
};

const isSocialSignupUser = (
  user: LoggedUser | AnonymousUser,
): user is LoggedUser => {
  return (
    'infoConfirmed' in user &&
    !user.infoConfirmed &&
    user?.providers?.some((prov) => prov !== 'password')
  );
};

export const FunnelOrganicSignup = withIsActiveGuard(
  ({
    parameters: {
      explainer,
      headline,
      image: srcDesktop = cloudinaryOnboardingFullBackgroundDesktop,
      imageMobile: src = cloudinaryOnboardingFullBackgroundMobile,
      version = 'v1',
    },
    onTransition,
  }: FunnelOrganicSignupProps): ReactElement => {
    const formRef = useRef<HTMLFormElement>(null);
    const hasAlreadyCheckedUser = useRef(false);
    const isMobile = useViewSize(ViewSize.MobileL);
    const setAuth = useSetAtom(authAtom);
    const { isLoggedIn, isAuthReady, user } = useAuthContext();
    const { isOnboardingActionsReady, isOnboardingComplete } =
      useOnboardingActions();
    const [authDisplay, setAuthDisplay] = useState(
      AuthDisplay.OnboardingSignup,
    );
    const isEmailSignupActive = authDisplay === AuthDisplay.Registration;
    const isSocialSignupActive =
      isAuthReady &&
      isLoggedIn &&
      !isEmailSignupActive &&
      isSocialSignupUser(user);
    const isMobileRevamp = version === 'v2_mobile' && isMobile;

    const onAuthStateUpdate = useCallback(
      (data: Partial<AuthProps>) => {
        const { defaultDisplay, isLoginFlow } = data;

        // capture the default display from the auth state
        if (defaultDisplay) {
          setAuthDisplay(defaultDisplay);

          if (
            defaultDisplay === AuthDisplay.Registration &&
            !!data.isAuthenticating
          ) {
            // This step is in charge of the email registration flow,
            // is not required to setAuth for isAuthenticating true.
            return;
          }
        }

        // Move outside the funnel if is login flow
        if (isLoginFlow) {
          setAuth((prev) => ({
            ...prev,
            isLoginFlow: true,
            isAuthenticating: true,
            defaultDisplay: AuthDisplay.Default,
          }));
          return;
        }

        setAuth((prev) => ({
          ...prev,
          ...data,
        }));
      },
      [setAuthDisplay, setAuth],
    );

    const onSuccessfulRegistration = useCallback(
      (data: LoggedUser | AnonymousUser) => {
        // Email users need to confirm their email before proceeding with funnel
        const isEmailSignup = 'infoConfirmed' in data && !data.infoConfirmed;
        if (isEmailSignup) {
          setAuth((prev) => ({
            ...prev,
            isLoginFlow: false,
            isAuthenticating: true,
            defaultDisplay: AuthDisplay.EmailVerification,
          }));
          return;
        }

        onTransition?.({
          type: FunnelStepTransitionType.Complete,
          details: { user: data },
        });
      },
      [onTransition, setAuth],
    );

    useEffect(() => {
      if (
        !isAuthReady ||
        !user ||
        (user && !isOnboardingActionsReady) ||
        isOnboardingComplete
      ) {
        return;
      }

      if (!hasAlreadyCheckedUser.current && user.infoConfirmed) {
        onTransition?.({
          type: FunnelStepTransitionType.Complete,
          details: { user },
        });
      }

      hasAlreadyCheckedUser.current = true;
    }, [
      isAuthReady,
      isOnboardingActionsReady,
      isOnboardingComplete,
      onTransition,
      user,
    ]);

    if (
      !isAuthReady ||
      (isLoggedIn && user.infoConfirmed) ||
      isOnboardingComplete
    ) {
      return null;
    }

    return (
      <div
        className={classNames(
          'z-3 relative flex flex-1 flex-col overflow-x-hidden',
          {
            'justify-end pt-40': isMobileRevamp,
            'items-center': !isMobileRevamp,
          },
        )}
      >
        <OnboardingHeader
          isLanding
          className={classNames(
            isMobileRevamp &&
              'from-background-default !-my-8 !justify-center bg-gradient-to-t to-transparent py-8',
          )}
        />
        <ConditionalWrapper
          condition={isMobileRevamp}
          wrapper={(content) => (
            <div className="z-1 after:-z-1 after:bg-background-default relative after:absolute after:inset-0 after:top-8">
              {content}
            </div>
          )}
        >
          <div
            className={classNames(
              `tablet:flex-row tablet:gap-10 tablet:px-6 flex w-full flex-col flex-wrap content-center justify-center px-4`,
              wrapperMaxWidth,
              { 'mt-7.5': isEmailSignupActive, 'flex-1': !isMobileRevamp },
            )}
          >
            <div
              className={classNames(
                'tablet:my-5 tablet:flex-grow mt-5 flex flex-1 flex-col',
                !isEmailSignupActive && 'laptop:mr-8 laptop:max-w-[27.5rem]',
              )}
            >
              {!isEmailSignupActive && !isSocialSignupActive && (
                <>
                  {isMobileRevamp ? (
                    <div className="mb-8 flex flex-col gap-4">
                      <Typography
                        className="text-balance text-center"
                        color={TypographyColor.Primary}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeMessage(headline),
                        }}
                        type={TypographyType.Title2}
                      />
                    </div>
                  ) : (
                    <OnboardingHeadline
                      className={{
                        title: classNames(
                          'tablet:typo-mega-1 typo-large-title',
                        ),
                        description:
                          'text-text-primary typo-body tablet:typo-title2 mb-8',
                      }}
                      title={sanitizeMessage(headline, [])}
                      description={explainer}
                    />
                  )}
                </>
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
                onSuccessfulLogin={() => {
                  // user now is logged, even if the `user` object is not populated yet.
                  // this callback is fired only after a lot of auth checks
                  onTransition?.({
                    type: FunnelStepTransitionType.Complete,
                    details: { user },
                  });
                }}
              />
            </div>
            <div className="tablet:ml-auto tablet:flex-1 laptop:max-w-[37.5rem] flex flex-1" />
          </div>
        </ConditionalWrapper>
        {!!src && (
          <picture>
            <source media="(max-width: 655px)" srcSet={src} />
            <source media="(min-width: 656px)" srcSet={srcDesktop || src} />
            <img
              alt="Onboarding background"
              aria-hidden
              className={classNames(
                '-z-1 pointer-events-none absolute inset-0 size-full object-cover transition-opacity duration-150',
                { 'opacity-[.24]': isEmailSignupActive },
              )}
              fetchPriority="high"
              loading="eager"
              role="presentation"
              src={src}
            />
          </picture>
        )}
        {!isMobileRevamp && (
          <FooterLinks
            className={classNames(
              'laptop:px-0 mx-auto px-2 pb-6',
              isMobileRevamp && 'bg-background-default !-mb-4 pt-4',
            )}
          />
        )}{' '}
      </div>
    );
  },
);

export default FunnelOrganicSignup;
