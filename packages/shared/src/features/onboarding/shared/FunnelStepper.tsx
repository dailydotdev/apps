import type { ReactElement, FC } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import type {
  FunnelJSON,
  FunnelStepChapter,
  FunnelStepAppPromotion,
  FunnelStepPricing,
  FunnelStepLandingPage,
  FunnelStepReadingReminder,
  FunnelStepSignup,
  FunnelStepTagSelection,
  NonChapterStep,
  FunnelStepTransitionCallback,
} from '../types/funnel';
import { FunnelStepType } from '../types/funnel';
import { Header } from './Header';
import { useFunnelTracking } from '../hooks/useFunnelTracking';
import { useFunnelNavigation } from '../hooks/useFunnelNavigation';
import { FunnelQuiz, FunnelSocialProof } from '../steps';
import { FunnelEventName } from '../types/funnelEvents';
import FunnelInformative from '../steps/FunnelInformative';
import { FunnelCheckout } from '../steps/FunnelCheckout';

interface FunnelStepperProps {
  funnel: FunnelJSON;
}

const stepComponentMap = {
  [FunnelStepType.Fact]: FunnelInformative,
  [FunnelStepType.Quiz]: FunnelQuiz,
  [FunnelStepType.AppPromotion]: (({ type }) => (
    <>{type}</>
  )) as FC<FunnelStepAppPromotion>,
  [FunnelStepType.Pricing]: (({ type }) => (
    <>{type}</>
  )) as FC<FunnelStepPricing>,
  [FunnelStepType.Checkout]: FunnelCheckout,
  [FunnelStepType.LandingPage]: (({ type }) => (
    <>{type}</>
  )) as FC<FunnelStepLandingPage>,
  [FunnelStepType.ReadingReminder]: (({ type }) => (
    <>{type}</>
  )) as FC<FunnelStepReadingReminder>,
  [FunnelStepType.Signup]: (({ type }) => <>{type}</>) as FC<FunnelStepSignup>,
  [FunnelStepType.TagSelection]: (({ type }) => (
    <>{type}</>
  )) as FC<FunnelStepTagSelection>,
  [FunnelStepType.SocialProof]: FunnelSocialProof,
};

function FunnelStepComponent(props: NonChapterStep) {
  const { type } = props;
  const Component = stepComponentMap[type] as FC<typeof props>;
  return <Component {...props} />;
}

export const FunnelStepper = ({ funnel }: FunnelStepperProps): ReactElement => {
  const {
    trackOnClickCapture,
    trackOnScroll,
    trackOnNavigate,
    trackFunnelEvent,
  } = useFunnelTracking({ funnel });
  const {
    canSkip,
    chapters,
    hasPrev,
    navigateNext,
    navigatePrev,
    step,
    position,
  } = useFunnelNavigation({ funnel, onNavigation: trackOnNavigate });

  // mount/unmount tracking
  useEffect(
    () => {
      trackFunnelEvent({ name: FunnelEventName.StartFunnel });

      return () => {
        trackFunnelEvent({ name: FunnelEventName.LeaveFunnel });
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [funnel],
  );

  const onTransition: FunnelStepTransitionCallback = ({ type }) => {
    const targetStepId = step.transitions.find((transition) => {
      return transition.on === type;
    })?.destination;

    if (!targetStepId) {
      return;
    }

    navigateNext({ to: targetStepId });
  };

  return (
    <section onClickCapture={trackOnClickCapture} onScroll={trackOnScroll}>
      <Header
        currentChapter={position.chapter}
        currentStep={position.step}
        chapters={chapters}
        onBack={navigatePrev}
        onSkip={navigateNext}
        showBackButton={hasPrev}
        showSkipButton={canSkip}
      />
      <div>
        {funnel.steps.map((chapter: FunnelStepChapter) => (
          <div key={chapter?.id}>
            {chapter?.steps?.map((funnelStep: NonChapterStep) => (
              <div
                className={classNames({
                  hidden: step?.id !== funnelStep?.id,
                })}
                key={`${chapter?.id}-${funnelStep?.id}`}
              >
                <FunnelStepComponent
                  {...funnelStep}
                  onTransition={onTransition}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
