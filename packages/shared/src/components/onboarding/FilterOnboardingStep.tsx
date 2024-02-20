import React, { ReactElement, useContext } from 'react';
import Container from './OnboardingStep';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';
import { Button, ButtonColor, ButtonVariant } from '../buttons/Button';
import { OnboardingStep } from './common';
import { ModalPropsContext } from '../modals/common/types';
import { FilterOnboarding } from './FilterOnboarding';

export function FilterOnboardingStep(): ReactElement {
  const { onRequestClose } = useContext(ModalPropsContext);

  return (
    <Modal.StepsWrapper view={OnboardingStep.Topics}>
      {({ activeStepIndex, previousStep, nextStep }) => (
        <>
          <Container
            title="Choose topics to follow"
            description="Pick topics you are interested in. You can always change these later."
            className={{
              container: 'px-0 pb-0',
              content:
                'mb-4 mt-1 flex flex-row justify-center overflow-x-hidden p-4',
            }}
          >
            <FilterOnboarding />
          </Container>
          <Modal.Footer justify={Justify.Between}>
            <Button
              variant={ButtonVariant.Tertiary}
              onClick={activeStepIndex === 0 ? onRequestClose : previousStep}
            >
              {activeStepIndex === 0 ? 'Close' : 'Back'}
            </Button>
            <Button
              color={ButtonColor.Cabbage}
              variant={ButtonVariant.Primary}
              onClick={nextStep}
            >
              Next
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal.StepsWrapper>
  );
}
