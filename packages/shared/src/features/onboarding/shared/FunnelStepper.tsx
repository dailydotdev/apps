import type { ReactElement, FC } from 'react';
import React, { Fragment } from 'react';
import classNames from 'classnames';
import type {
  FunnelJSON,
  FunnelStepChapter,
  FunnelStepAppPromotion,
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
import { FunnelQuiz, FunnelSocialProof, FunnelPricing } from '../steps';
import FunnelInformative from '../steps/FunnelInformative';
import { FunnelCheckout } from '../steps/FunnelCheckout';
import FunnelLoading from '../steps/FunnelLoading';
import { FunnelStepBackground } from './FunnelStepBackground';
import { useWindowScroll } from '../../common/hooks/useWindowScroll';
import { useStepTransition } from '../hooks/useStepTransition';

interface FunnelStepperProps {
  funnel: FunnelJSON;
  sessionId: string;
}

const stepComponentMap = {
  [FunnelStepType.Checkout]: FunnelCheckout,
  [FunnelStepType.Fact]: FunnelInformative,
  [FunnelStepType.Loading]: FunnelLoading,
  [FunnelStepType.Quiz]: FunnelQuiz,
  [FunnelStepType.SocialProof]: FunnelSocialProof,
  [FunnelStepType.Pricing]: FunnelPricing,
  [FunnelStepType.AppPromotion]: (({ type }) => (
    <>{type}</>
  )) as FC<FunnelStepAppPromotion>,
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
} as const;

function FunnelStepComponent(props: NonChapterStep) {
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
}: FunnelStepperProps): ReactElement => {
  const {
    trackOnClickCapture,
    trackOnHoverCapture,
    trackOnNavigate,
    trackOnScroll,
  } = useFunnelTracking({ funnel });
  const { back, chapters, navigate, position, skip, step } =
    useFunnelNavigation({ funnel, onNavigation: trackOnNavigate });
  const { transition: sendTransition } = useStepTransition(sessionId);

  const onTransition: FunnelStepTransitionCallback = ({ type, details }) => {
    const targetStepId = step.transitions.find((transition) => {
      return transition.on === type;
    })?.destination;

    if (!targetStepId) {
      return;
    }

    sendTransition({
      fromStep: step.id,
      toStep: targetStepId,
      transitionEvent: type,
      inputs: details,
    });
    navigate({ to: targetStepId, type });
  };

  useWindowScroll({
    onScroll: trackOnScroll,
  });

  // todo: show/hide the header based on the step type

  return (
    <section
      onClickCapture={trackOnClickCapture}
      onMouseOverCapture={trackOnHoverCapture}
      onScrollCapture={trackOnScroll}
    >
      <FunnelStepBackground step={step}>
        <Header
          chapters={chapters}
          currentChapter={position.chapter}
          currentStep={position.step}
          onBack={back.navigate}
          onSkip={skip.navigate}
          showBackButton={back.hasTarget}
          showSkipButton={skip.hasTarget}
        />
        {funnel.steps.map((chapter: FunnelStepChapter) => (
          <Fragment key={chapter?.id}>
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
          </Fragment>
        ))}
      </FunnelStepBackground>
    </section>
  );
};
