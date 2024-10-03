import React, { ReactElement } from 'react';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { Modal } from '../modals/common/Modal';
import { StepComponentProps } from '../modals/common/ModalStepsWrapper';
import { Justify } from '../utilities';
import { OnboardingStep, OnboardingStepProps, OnboardingTitle } from './common';
import Container from './OnboardingStep';
import { useAuthContext } from '../../contexts/AuthContext';
import { MemberAlready } from './MemberAlready';
import { AuthTriggers } from '../../lib/auth';
import { useThemedAsset } from '../../hooks/utils';

interface IntroductionOnboardingTitleProps {
  className?: string;
}

export const IntroductionOnboardingTitle = ({
  className,
}: IntroductionOnboardingTitleProps): ReactElement => (
  <OnboardingTitle className={className}>
    Make the feed,
    <span className="ml-1 text-brand-default">your feed.</span>
  </OnboardingTitle>
);

function IntroductionOnboarding({
  onClose,
}: OnboardingStepProps): ReactElement {
  const { user, showLogin } = useAuthContext();
  const { onboardingIntroduction } = useThemedAsset();

  return (
    <Modal.StepsWrapper view={OnboardingStep.Intro}>
      {({ nextStep }: StepComponentProps) => (
        <>
          <Container
            title={<IntroductionOnboardingTitle />}
            description="Supercharge your feed with content you'll love reading!"
            className={{
              container: 'overflow-hidden',
              content: 'relative flex flex-col items-center',
            }}
          >
            <span className="flex flex-1" />
            <div
              style={{
                backgroundImage: `url(${onboardingIntroduction})`,
              }}
              className="absolute -top-20 h-full w-full bg-cover"
            />
            {!user && (
              <MemberAlready
                className={{ container: 'py-10', login: 'z-0' }}
                onLogin={() =>
                  showLogin({
                    trigger: AuthTriggers.Onboarding,
                    options: { isLogin: true },
                  })
                }
              />
            )}
          </Container>
          <Modal.Footer justify={Justify.Between}>
            <Button variant={ButtonVariant.Tertiary} onClick={onClose}>
              Skip
            </Button>
            <Button
              color={ButtonColor.Cabbage}
              variant={ButtonVariant.Primary}
              onClick={nextStep}
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
