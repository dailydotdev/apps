import React, {
  ReactElement,
  useState,
  useContext,
  MouseEventHandler,
  MouseEvent,
} from 'react';
import Container from './OnboardingStep';
import FeaturesContext from '../../contexts/FeaturesContext';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { OnboardingStep } from './common';
import { ModalPropsContext } from '../modals/common/types';
import { FilterOnboarding } from './FilterOnboarding';

export function FilterOnboardingStep(): ReactElement {
  const [invalidMessage, setInvalidMessage] = useState<string>(null);
  const [selectedTopics, setSelectedTopics] = useState({});
  const { onboardingMinimumTopics } = useContext(FeaturesContext);
  const { onRequestClose } = useContext(ModalPropsContext);

  const onFilterNext = (e: MouseEvent, nextStep: MouseEventHandler) => {
    const selected = Object.values(selectedTopics).filter((value) => !!value);
    const isValid = selected.length >= onboardingMinimumTopics;

    if (isValid) {
      return nextStep(e);
    }

    const topic = `topic${onboardingMinimumTopics > 1 ? 's' : ''}`;
    const message = `Choose at least ${onboardingMinimumTopics} ${topic} to follow`;
    setInvalidMessage(isValid ? null : message);

    return null;
  };

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
                'p-4 mt-1 mb-4 flex flex-row justify-center overflow-x-hidden',
            }}
          >
            <FilterOnboarding onSelectedTopics={setSelectedTopics} />
          </Container>
          <Modal.Footer justify={Justify.Between}>
            <Button
              className="btn-tertiary"
              onClick={activeStepIndex === 0 ? onRequestClose : previousStep}
            >
              {activeStepIndex === 0 ? 'Close' : 'Back'}
            </Button>
            <SimpleTooltip
              forceLoad
              content={invalidMessage}
              visible={!!invalidMessage}
              container={{
                className: 'w-36 text-center',
                paddingClassName: 'py-4 px-3',
              }}
            >
              <Button
                className="bg-theme-color-cabbage"
                onClick={(e) => onFilterNext(e, nextStep)}
              >
                Next
              </Button>
            </SimpleTooltip>
          </Modal.Footer>
        </>
      )}
    </Modal.StepsWrapper>
  );
}
