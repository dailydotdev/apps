import type { ReactElement } from 'react';
import React, { Fragment } from 'react';
import classNames from 'classnames';
import type {
  FunnelJSON,
  FunnelChapter,
  FunnelStep,
  FunnelStepTransitionCallback,
  FunnelStepTransition,
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
} from '../steps';
import FunnelFact from '../steps/FunnelFact';
import { FunnelCheckout } from '../steps/FunnelCheckout';
import FunnelLoading from '../steps/FunnelLoading';
import { FunnelStepBackground } from './FunnelStepBackground';
import { useWindowScroll } from '../../common/hooks/useWindowScroll';
import { useStepTransition } from '../hooks/useStepTransition';
import { FunnelRegistration } from '../steps/FunnelRegistration';
import { useInitFunnelPaddle } from '../hooks/useInitFunnelPaddle';
import type { FunnelSession } from '../types/funnelBoot';
import { CookieConsent } from './CookieConsent';
import { useFunnelCookies } from '../hooks/useFunnelCookies';
import classed from '../../../lib/classed';

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

  useInitFunnelPaddle();
  useWindowScroll({
    onScroll: trackOnScroll,
  });

  const onTransition: FunnelStepTransitionCallback = ({ type, details }) => {
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
      navigate({ to: targetStepId, type });
    } else {
      trackOnComplete();
      onComplete?.();
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <section
      data-testid="funnel-stepper"
      onClickCapture={trackOnClickCapture}
      onMouseOverCapture={trackOnHoverCapture}
      onScrollCapture={trackOnScroll}
      className="flex min-h-dvh flex-col"
    >
      {isCookieBannerActive && showBanner && (
        <CookieConsent key="cookie-consent" {...cookieConsentProps} />
      )}
      <FunnelStepBackground step={step}>
        <div className="mx-auto flex w-full flex-1 flex-col tablet:max-w-md laptopXL:max-w-lg">
          <Header
            chapters={chapters}
            className={classNames({
              hidden: !stepsWithHeader.includes(step.type),
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
                      key={step.id}
                      onTransition={onTransition}
                    />
                  </Wrapper>
                );
              })}
            </Fragment>
          ))}
        </div>
      </FunnelStepBackground>
    </section>
  );
};
