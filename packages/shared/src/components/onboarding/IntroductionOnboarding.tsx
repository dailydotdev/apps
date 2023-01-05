import React, { ReactElement } from 'react';
import { useOnboardingSteps } from '../../hooks/useOnboardingSteps';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { Modal } from '../modals/common/Modal';
import { StepComponentProps } from '../modals/common/ModalStepsWrapper';
import { Justify } from '../utilities';
import { OnboardingTitle, OnboardingStep, OnboardingStepProps } from './common';
import Container from './OnboardingStep';

function IntroductionOnboarding({
  onClose,
}: OnboardingStepProps): ReactElement {
  const { onStepForward } = useOnboardingSteps(OnboardingStep.Intro, onClose);

  return (
    <Modal.StepsWrapper view={OnboardingStep.Intro}>
      {({ nextStep }: StepComponentProps) => (
        <>
          <Container
            title={
              <OnboardingTitle>
                Make the feed,{' '}
                <span className="text-theme-color-cabbage">your feed.</span>
              </OnboardingTitle>
            }
            description="Supercharge your feed with content you'll love reading!"
            className={{ container: 'overflow-hidden', content: 'relative' }}
          >
            <img
              className="absolute -mt-4 scale-125"
              src={cloudinary.feedFilters.yourFeed}
              alt="cards containing tag name being selected"
            />
          </Container>
          <Modal.Footer justify={Justify.Between}>
            <Button className="btn-tertiary" onClick={onClose}>
              Skip
            </Button>
            <Button
              className="bg-theme-color-cabbage"
              onClick={onStepForward(nextStep)}
            >
              Continue
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal.StepsWrapper>
  );
}

export default IntroductionOnboarding;
