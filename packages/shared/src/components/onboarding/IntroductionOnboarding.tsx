import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { Modal } from '../modals/common/Modal';
import { StepComponentProps } from '../modals/common/ModalStepsWrapper';
import { Justify } from '../utilities';
import { OnboardingStep, OnboardingStepProps, OnboardingTitle } from './common';
import Container from './OnboardingStep';
import { ClickableText } from '../buttons/ClickableText';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthTriggers } from '../../lib/auth';

function IntroductionOnboarding({
  onClose,
}: OnboardingStepProps): ReactElement {
  const { showLogin, user } = useAuthContext();

  return (
    <Modal.StepsWrapper view={OnboardingStep.Intro}>
      {({ nextStep }: StepComponentProps) => (
        <>
          <Container
            title={
              <OnboardingTitle>
                Make the feed,
                <span className="ml-1 text-theme-color-cabbage">
                  your feed.
                </span>
              </OnboardingTitle>
            }
            description="Supercharge your feed with content you'll love reading!"
            className={{
              container: 'overflow-hidden',
              content: 'relative flex flex-col items-center',
            }}
          >
            <span className="flex flex-1" />
            <div
              style={{
                backgroundImage: `url(${cloudinary.feedFilters.yourFeed})`,
              }}
              className="absolute -top-4 w-full h-full bg-cover"
            />
            {!user && (
              <span className="flex py-10">
                Already a member?
                <ClickableText
                  className="z-0 ml-1.5 font-bold"
                  onClick={() =>
                    showLogin(AuthTriggers.Onboarding, { isLogin: true })
                  }
                >
                  Log in
                </ClickableText>
              </span>
            )}
          </Container>
          <Modal.Footer justify={Justify.Between}>
            <Button className="btn-tertiary" onClick={onClose}>
              Skip
            </Button>
            <Button className="bg-theme-color-cabbage" onClick={nextStep}>
              Continue
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal.StepsWrapper>
  );
}

export default IntroductionOnboarding;
