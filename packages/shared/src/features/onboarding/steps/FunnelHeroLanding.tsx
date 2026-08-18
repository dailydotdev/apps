import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useSetAtom } from 'jotai/react';
import type { FunnelStepHeroLanding } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import AuthOptions from '../../../components/auth/AuthOptions';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
import { AuthTriggers } from '../../../lib/auth';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { useViewSize, ViewSize } from '../../../hooks';
import type { AuthProps } from '../../../components/auth/common';
import { AuthDisplay } from '../../../components/auth/common';
import { ExperimentWinner } from '../../../lib/featureValues';
import { authAtom } from '../store/onboarding.store';
import type { AnonymousUser, LoggedUser } from '../../../lib/user';
import { useAuthContext } from '../../../contexts/AuthContext';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useOnboardingActions } from '../../../hooks/auth';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureSignupWallHorizon } from '../../../lib/featureManagement';
import { OnboardingSignupHero } from '../components/OnboardingSignupHero';

type FunnelHeroLandingProps = FunnelStepHeroLanding;

const authContainerClass =
  'w-full max-w-full rounded-none tablet:max-w-[30rem]';
// AuthOptions reserves a 21.25rem minimum so its display swaps don't jolt the
// page. The split layouts bottom-anchor their form, where that reservation
// becomes dead space *under* the buttons that holds them off the bottom edge —
// so they opt out and let the container hug its content instead.
const splitAuthContainerClass = classNames(authContainerClass, '!min-h-0');

const staticAuthProps = {
  className: {
    container: authContainerClass,
    onboardingSignup: '!gap-5 !pb-5 tablet:gap-8 tablet:pb-8',
  },
  forceDefaultDisplay: true,
  simplified: true,
  // The signup wall already shows the "homepage developers deserve" copy, so
  // don't repeat it on the email registration step.
  hideRegistrationHeadline: true,
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

// The horizon wall's value line, when the funnel doesn't provide one.
const HORIZON_DEFAULT_SUBLINE =
  'Be the dev who already knew. Every release, tool, and breakthrough in your stack. Hours early.';

export const FunnelHeroLanding = withIsActiveGuard(
  ({
    parameters: {
      headline,
      subline: sublineParam,
      background: backgroundParam,
      imageMode,
      imageMobile,
      showOrbs,
      forceDarkTheme,
      oauthOrder: oauthOrderParam,
    },
    onTransition,
  }: FunnelHeroLandingProps): ReactElement => {
    const formRef = useRef<HTMLFormElement>(null);
    const hasAlreadyCheckedUser = useRef(false);
    const isMobile = useViewSize(ViewSize.MobileL);
    const setAuth = useSetAtom(authAtom);
    const { isLoggedIn, isAuthReady, user } = useAuthContext();
    // Shared with the paid funnel, which keeps its own landing treatment.
    const isOnboarding = useIsOnboardingFunnel();
    // Flips the wall to the horizon treatment without a Freyja change —
    // onboarding funnel only, so paid funnels keep their served look. The flag
    // is an override, not a default: it wins over the served background, the
    // same way the persona flag overrides the served tag-step headline. Remove
    // once Freyja can serve `background: 'horizon'` itself.
    const { value: isHorizonWallEnabled, isLoading: isHorizonFlagLoading } =
      useConditionalFeature({
        feature: featureSignupWallHorizon,
        shouldEvaluate: isAuthReady && isOnboarding,
      });
    // Rendering the served wall first and swapping when the flag lands would
    // show the control arm to treatment users and cost a wasted hero download,
    // so hold until it resolves. Scoped to the funnel that evaluates it —
    // elsewhere `shouldEvaluate` is false and isLoading never clears.
    const isWallPending = isOnboarding && isHorizonFlagLoading;
    const background = isHorizonWallEnabled ? 'horizon' : backgroundParam;
    const isHorizonWall = background === 'horizon';
    const subline =
      sublineParam ?? (isHorizonWall ? HORIZON_DEFAULT_SUBLINE : undefined);
    const oauthOrder =
      oauthOrderParam ?? (isHorizonWall ? 'googleFirst' : undefined);
    const { isOnboardingActionsReady, isOnboardingComplete } =
      useOnboardingActions();
    const [authDisplay, setAuthDisplay] = useState(
      AuthDisplay.OnboardingSignup,
    );
    const isEmailSignupActive =
      authDisplay === AuthDisplay.Registration ||
      authDisplay === AuthDisplay.EmailVerification;
    const isSocialSignupActive =
      isAuthReady &&
      isLoggedIn &&
      !isEmailSignupActive &&
      isSocialSignupUser(user);
    const preferGithub = oauthOrder !== 'googleFirst';
    const isPanelWall = background === 'panel';
    // Both split-column walls take the same column geometry and opt out of
    // AuthOptions' min-height reservation, which is dead space under a
    // bottom-anchored form. Only the panel takes the "Sign up with…" copy:
    // "Continue with…" logs returning users straight in, so the horizon keeps
    // it rather than building a wrong door.
    const isSplitColumnBackground = isPanelWall || isHorizonWall;

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
      isWallPending ||
      (isLoggedIn && user.infoConfirmed) ||
      isOnboardingComplete
    ) {
      return null;
    }

    return (
      <OnboardingSignupHero
        isFormExpanded={isEmailSignupActive || isSocialSignupActive}
        headline={headline}
        subline={subline}
        background={background}
        imageMode={imageMode}
        imageMobile={imageMobile}
        showOrbs={showOrbs}
        forceDarkTheme={forceDarkTheme}
      >
        <AuthOptions
          {...staticAuthProps}
          // Post-signup funnel only: the account-details screen takes the
          // funnel's headline scale and drops the terms strip, so it reads as
          // the same flow as the steps after it. The paid funnel's landing keeps
          // its own treatment.
          hideSignupDisclaimer={isOnboarding}
          isOnboardingFunnel={isOnboarding}
          className={
            isSplitColumnBackground
              ? {
                  ...staticAuthProps.className,
                  container: splitAuthContainerClass,
                }
              : staticAuthProps.className
          }
          splitSignupStyle={isSplitColumnBackground}
          createAccountCopy={isPanelWall}
          singlePrimaryStyle={isHorizonWall}
          preferGithub={preferGithub}
          defaultDisplay={
            isSocialSignupActive ? AuthDisplay.SocialRegistration : authDisplay
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
      </OnboardingSignupHero>
    );
  },
);

export default FunnelHeroLanding;
