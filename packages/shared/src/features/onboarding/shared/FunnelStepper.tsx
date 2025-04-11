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
import ConditionalWrapper from '../../../components/ConditionalWrapper';

export interface FunnelStepperProps {
  funnel: FunnelJSON;
  session: FunnelSession;
  onComplete?: () => void;
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
  const { type, isActive } = props;
  const Component = stepComponentMap[type];

  if (!Component) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={!isActive}
      wrapper={(component) => (
        <div className="hidden" data-testid="funnel-step">
          {component}
        </div>
      )}
    >
      <Component {...props} />
    </ConditionalWrapper>
  );
}

function getTransitionDestination(
  step: FunnelStep,
  transitionType: FunnelStepTransitionType,
): FunnelStepTransition['destination'] | undefined {
  return step.transitions.find((transition) => {
    return transition.on === transitionType;
  })?.destination;
}

export const FunnelStepper = ({
  funnel,
  session,
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
  const { back, chapters, navigate, position, skip, step } =
    useFunnelNavigation({ funnel, onNavigation: trackOnNavigate, session });
  const { transition: sendTransition } = useStepTransition(session.id);
  const { showBanner, ...cookieConsentProps } = useFunnelCookies({
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

  return (
    <section
      data-testid="funnel-stepper"
      onClickCapture={trackOnClickCapture}
      onMouseOverCapture={trackOnHoverCapture}
      onScrollCapture={trackOnScroll}
    >
      {showBanner && (
        <CookieConsent key="cookie-consent" {...cookieConsentProps} />
      )}
      <FunnelStepBackground step={step}>
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
        />
        {funnel.chapters.map((chapter: FunnelChapter) => (
          <Fragment key={chapter?.id}>
            {chapter?.steps?.map((funnelStep: FunnelStep) => (
              <FunnelStepComponent
                {...funnelStep}
                isActive={funnelStep?.id === step?.id}
                key={`${chapter?.id}-${funnelStep?.id}`}
                onTransition={onTransition}
              />
            ))}
          </Fragment>
        ))}
      </FunnelStepBackground>
    </section>
  );
};
