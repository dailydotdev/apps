import type { ReactElement } from 'react';
import React, { Fragment, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import type { PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import type {
  FunnelJSON,
  FunnelStep,
  FunnelStepTransitionCallback,
  FunnelStepTransition,
  FunnelChapter,
} from '../types/funnel';
import {
  FunnelStepType,
  COMPLETED_STEP_ID,
  FunnelStepTransitionType,
  stepsWithHeader,
} from '../types/funnel';
import { Header } from './Header';
import { useFunnelTracking } from '../hooks/useFunnelTracking';
import { useFunnelNavigation } from '../hooks/useFunnelNavigation';
import {
  FunnelQuiz,
  FunnelSocialProof,
  FunnelPricing,
  FunnelPaymentSuccessful,
  FunnelProfileForm,
  FunnelEditTags,
  FunnelContentTypes,
  FunnelReadingReminder,
  FunnelInstallPwa,
} from '../steps';
import { FunnelFact } from '../steps/FunnelFact';
import { FunnelCheckout } from '../steps/FunnelCheckout';
import FunnelLoading from '../steps/FunnelLoading';
import { FunnelStepBackground } from './FunnelStepBackground';
import { useWindowScroll } from '../../common/hooks/useWindowScroll';
import { useStepTransition } from '../hooks/useStepTransition';
import { FunnelRegistration } from '../steps/FunnelRegistration';
import type { FunnelSession } from '../types/funnelBoot';
import { CookieConsent } from './CookieConsent';
import { useFunnelCookies } from '../hooks/useFunnelCookies';
import classed from '../../../lib/classed';
import { FunnelBannerMessage } from './FunnelBannerMessage';
import { PaymentContextProvider } from '../../../contexts/payment';

export interface FunnelStepperProps {
  funnel: FunnelJSON;
  initialStepId?: string | null;
  onComplete?: () => void;
  session: FunnelSession;
  showCookieBanner?: boolean;
}

const stepComponentMap = {
  [FunnelStepType.Checkout]: FunnelCheckout,
  [FunnelStepType.Fact]: FunnelFact,
  [FunnelStepType.Loading]: FunnelLoading,
  [FunnelStepType.Quiz]: FunnelQuiz,
  [FunnelStepType.SocialProof]: FunnelSocialProof,
  [FunnelStepType.Pricing]: FunnelPricing,
  [FunnelStepType.Signup]: FunnelRegistration,
  [FunnelStepType.PaymentSuccessful]: FunnelPaymentSuccessful,
  [FunnelStepType.ProfileForm]: FunnelProfileForm,
  [FunnelStepType.EditTags]: FunnelEditTags,
  [FunnelStepType.ContentTypes]: FunnelContentTypes,
  [FunnelStepType.ReadingReminder]: FunnelReadingReminder,
  [FunnelStepType.InstallPwa]: FunnelInstallPwa,
} as const;

function FunnelStepComponent<Step extends FunnelStep>(props: Step) {
  const { type } = props;
  const Component = stepComponentMap[type];

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
}

function getTransitionDestination(
  step: FunnelStep,
  transitionType: FunnelStepTransitionType,
): FunnelStepTransition['destination'] | undefined {
  return step.transitions.find((transition) => {
    return transition.on === transitionType;
  })?.destination;
}

const HiddenStep = classed('div', 'hidden');

export const FunnelStepper = ({
  funnel,
  initialStepId,
  session,
  showCookieBanner,
  onComplete,
}: FunnelStepperProps): ReactElement => {
  const {
    trackOnClickCapture,
    trackOnHoverCapture,
    trackOnNavigate,
    trackOnScroll,
    trackOnComplete,
    trackFunnelEvent,
  } = useFunnelTracking({ funnel, session });
  const { back, chapters, navigate, position, skip, step, isReady } =
    useFunnelNavigation({
      funnel,
      initialStepId,
      onNavigation: trackOnNavigate,
    });
  const { transition: sendTransition } = useStepTransition(session.id);
  const isCookieBannerActive = !!funnel?.parameters?.cookieConsent?.show;
  const { showBanner, ...cookieConsentProps } = useFunnelCookies({
    defaultOpen: showCookieBanner,
    trackFunnelEvent,
  });

  useWindowScroll({
    onScroll: trackOnScroll,
  });

  const onTransition: FunnelStepTransitionCallback = useCallback(
    ({ type, details }) => {
      const targetStepId = getTransitionDestination(step, type);

      if (!targetStepId) {
        return;
      }

      const isLastStep = targetStepId === COMPLETED_STEP_ID;

      sendTransition({
        fromStep: step.id,
        toStep: isLastStep ? null : targetStepId,
        transitionEvent: type,
        inputs: details,
      });

      // not navigating to the last step
      if (!isLastStep) {
        navigate({
          to: targetStepId,
          type,
          details: details || {},
        });
      } else {
        trackOnComplete();
        onComplete?.();
      }
    },
    [step, sendTransition, navigate, onComplete, trackOnComplete],
  );

  const successCallback = useCallback(
    (event?: PaddleEventData) =>
      onTransition({
        type: FunnelStepTransitionType.Complete,
        details: {
          subscribed: event?.data.customer.email,
        },
      }),
    [onTransition],
  );

  const layout = useMemo(() => {
    const hasBanner = !!funnel?.parameters?.banner?.stepsToDisplay?.includes(
      step.id,
    );
    const hasHeader = stepsWithHeader.includes(step.type);
    const hasCookieConsent = isCookieBannerActive && showBanner;

    return {
      hasHeader,
      hasBanner,
      hasCookieConsent,
    };
  }, [
    isCookieBannerActive,
    showBanner,
    step.id,
    step.type,
    funnel?.parameters?.banner?.stepsToDisplay,
  ]);

  if (!isReady) {
    return null;
  }

  return (
    <section
      className="flex min-h-dvh flex-col"
      data-testid="funnel-stepper"
      onClickCapture={trackOnClickCapture}
      onMouseOverCapture={trackOnHoverCapture}
      onScrollCapture={trackOnScroll}
    >
      {layout.hasCookieConsent && (
        <CookieConsent key="cookie-consent" {...cookieConsentProps} />
      )}
      <FunnelStepBackground step={step}>
        <div className="mx-auto flex w-full flex-1 flex-col tablet:max-w-md laptopXL:max-w-lg">
          {layout.hasBanner && (
            <FunnelBannerMessage {...funnel.parameters.banner} />
          )}
          <Header
            chapters={chapters}
            className={classNames({
              hidden: !layout.hasHeader,
            })}
            currentChapter={position.chapter}
            currentStep={position.step}
            onBack={back.navigate}
            onSkip={() => {
              onTransition({ type: FunnelStepTransitionType.Skip });
            }}
            showBackButton={back.hasTarget}
            showSkipButton={skip.hasTarget}
            showProgressBar={skip.hasTarget}
          />
          <PaymentContextProvider
            disabledEvents={[CheckoutEventNames.CHECKOUT_LOADED]}
            successCallback={successCallback}
          >
            {funnel.chapters.map((chapter: FunnelChapter) => (
              <Fragment key={chapter?.id}>
                {chapter?.steps?.map((funnelStep: FunnelStep) => {
                  const isActive = funnelStep?.id === step?.id;
                  const Wrapper = isActive ? Fragment : HiddenStep;
                  return (
                    <Wrapper
                      key={`${chapter?.id}-${funnelStep?.id}`}
                      {...(!isActive && {
                        'data-testid': `funnel-step`,
                      })}
                    >
                      <FunnelStepComponent
                        {...funnelStep}
                        isActive={isActive}
                        onTransition={onTransition}
                      />
                    </Wrapper>
                  );
                })}
              </Fragment>
            ))}
          </PaymentContextProvider>
        </div>
      </FunnelStepBackground>
    </section>
  );
};
