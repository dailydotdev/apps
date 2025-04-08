import type { ReactElement, FC } from 'react';
import React, { Fragment } from 'react';
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
} as const;

function FunnelStepComponent(props: NonChapterStep) {
  const { type } = props;
  const Component = stepComponentMap[type] as FC<typeof props>;

  if (!Component) {
    return null;
  }

  return <Component {...props} />;
}

export const FunnelStepper = ({ funnel }: FunnelStepperProps): ReactElement => {
  const { trackOnClickCapture, trackOnScroll, trackOnNavigate } =
    useFunnelTracking({ funnel });
  const { back, chapters, navigate, position, skip, step } =
    useFunnelNavigation({ funnel, onNavigation: trackOnNavigate });

  const onTransition: FunnelStepTransitionCallback = ({ type, details }) => {
    const targetStepId = step.transitions.find((transition) => {
      return transition.on === type;
    })?.destination;

    if (!targetStepId) {
      return;
    }

    navigate({ to: targetStepId, type });
    // todo: send PUT to update the funnel position with details
    console.log('Transition details', details);
  };

  return (
    <section onClickCapture={trackOnClickCapture} onScroll={trackOnScroll}>
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
    </section>
  );
};
