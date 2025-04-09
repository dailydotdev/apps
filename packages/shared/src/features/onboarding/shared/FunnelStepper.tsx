import type { ReactElement, FC } from 'react';
import React, { Fragment } from 'react';
import classNames from 'classnames';
import type {
  FunnelJSON,
  FunnelStepChapter,
  FunnelStep,
  FunnelStepTransitionCallback,
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
import { FunnelQuiz, FunnelSocialProof, FunnelPricing } from '../steps';
import FunnelInformative from '../steps/FunnelInformative';
import { FunnelCheckout } from '../steps/FunnelCheckout';
import FunnelLoading from '../steps/FunnelLoading';
import { FunnelStepBackground } from './FunnelStepBackground';
import { useWindowScroll } from '../../common/hooks/useWindowScroll';
import { useStepTransition } from '../hooks/useStepTransition';
import { FunnelRegistration } from '../steps/FunnelRegistration';

interface FunnelStepperProps {
  funnel: FunnelJSON;
  sessionId: string;
  onComplete?: () => void;
}

const stepComponentMap = {
  [FunnelStepType.Checkout]: FunnelCheckout,
  [FunnelStepType.Fact]: FunnelInformative,
  [FunnelStepType.Loading]: FunnelLoading,
  [FunnelStepType.Quiz]: FunnelQuiz,
  [FunnelStepType.SocialProof]: FunnelSocialProof,
  [FunnelStepType.Pricing]: FunnelPricing,
  [FunnelStepType.Signup]: FunnelRegistration,
} as const;

function FunnelStepComponent(props: FunnelStep) {
  const { type } = props;
  const Component = stepComponentMap[type] as FC<typeof props>;

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
}

export const FunnelStepper = ({
  funnel,
  sessionId = '',
  onComplete,
}: FunnelStepperProps): ReactElement => {
  const {
    trackOnClickCapture,
    trackOnHoverCapture,
    trackOnNavigate,
    trackOnScroll,
  } = useFunnelTracking({ funnel, sessionId });
  const { back, chapters, navigate, position, skip, step } =
    useFunnelNavigation({ funnel, onNavigation: trackOnNavigate });
  const { transition: sendTransition } = useStepTransition(sessionId);

  const onTransition: FunnelStepTransitionCallback = async ({
    type,
    details,
  }) => {
    const targetStepId = step.transitions.find((transition) => {
      return transition.on === type;
    })?.destination;

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
    }

    if (isLastStep) {
      onComplete?.();
    }
  };

  useWindowScroll({
    onScroll: trackOnScroll,
  });

  return (
    <section
      data-testid="funnel-stepper"
      onClickCapture={trackOnClickCapture}
      onMouseOverCapture={trackOnHoverCapture}
      onScrollCapture={trackOnScroll}
    >
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
        {funnel.chapters.map((chapter: FunnelStepChapter) => (
          <Fragment key={chapter?.id}>
            {chapter?.steps?.map((funnelStep: FunnelStep) => (
              <div
                className={classNames({
                  hidden: step?.id !== funnelStep?.id,
                })}
                data-testid="funnel-step"
                key={`${chapter?.id}-${funnelStep?.id}`}
              >
                <FunnelStepComponent
                  {...funnelStep}
                  onTransition={onTransition}
                />
              </div>
            ))}
          </Fragment>
        ))}
      </FunnelStepBackground>
    </section>
  );
};
