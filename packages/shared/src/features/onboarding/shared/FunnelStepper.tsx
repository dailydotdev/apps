import type { ReactElement, FC } from 'react';
import React from 'react';
import classNames from 'classnames';
import type {
  FunnelJSON,
  FunnelStep,
  FunnelStepChapter,
  FunnelStepFact,
  FunnelStepAppPromotion,
  FunnelStepPricing,
  FunnelStepCheckout,
  FunnelStepLandingPage,
  FunnelStepReadingReminder,
  FunnelStepSignup,
  FunnelStepTagSelection,
} from '../types/funnel';
import { Header } from './Header';
import { useFunnelTracking } from '../hooks/useFunnelTracking';
import { useFunnelNavigation } from '../hooks/useFunnelNavigation';
import { FunnelStepType } from '../types/funnel';
import { FunnelQuiz } from '../steps/FunnelQuiz';

interface FunnelStepperProps {
  funnel: FunnelJSON;
}

type Step = Exclude<FunnelStep, FunnelStepChapter>;

type StepComponentMap = {
  [FunnelStepType.Fact]: FC<FunnelStepFact>;
  [FunnelStepType.Quiz]: typeof FunnelQuiz;
  [FunnelStepType.AppPromotion]: FC<FunnelStepAppPromotion>;
  [FunnelStepType.Pricing]: FC<FunnelStepPricing>;
  [FunnelStepType.Checkout]: FC<FunnelStepCheckout>;
  [FunnelStepType.LandingPage]: FC<FunnelStepLandingPage>;
  [FunnelStepType.ReadingReminder]: FC<FunnelStepReadingReminder>;
  [FunnelStepType.Signup]: FC<FunnelStepSignup>;
  [FunnelStepType.TagSelection]: FC<FunnelStepTagSelection>;
};

const stepComponentMap: StepComponentMap = {
  [FunnelStepType.Fact]: ({ type }) => <>{type}</>,
  [FunnelStepType.Quiz]: FunnelQuiz,
  [FunnelStepType.AppPromotion]: ({ type }) => <>{type}</>,
  [FunnelStepType.Pricing]: ({ type }) => <>{type}</>,
  [FunnelStepType.Checkout]: ({ type }) => <>{type}</>,
  [FunnelStepType.LandingPage]: ({ type }) => <>{type}</>,
  [FunnelStepType.ReadingReminder]: ({ type }) => <>{type}</>,
  [FunnelStepType.Signup]: ({ type }) => <>{type}</>,
  [FunnelStepType.TagSelection]: ({ type }) => <>{type}</>,
};

function FunnelStepComponent(props: Step) {
  const { type } = props;
  const Component = stepComponentMap[type] as FC<typeof props>;
  return <Component {...props} />;
}

export const FunnelStepper = ({ funnel }: FunnelStepperProps): ReactElement => {
  const { trackOnClickCapture, trackOnScroll, trackOnNavigate } =
    useFunnelTracking();
  const {
    canSkip,
    chapters,
    hasPrev,
    navigateNext,
    navigatePrev,
    step,
    position,
  } = useFunnelNavigation({ funnel, onNavigation: trackOnNavigate });

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
          <div key={chapter.id}>
            {chapter?.steps?.map((funnelStep: Step) => (
              <div
                className={classNames({
                  hidden: step.id !== funnelStep.id,
                })}
                key={`${chapter.id}-${step.id}`}
              >
                <FunnelStepComponent {...funnelStep} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
