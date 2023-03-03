import classNames from 'classnames';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import SettingsContext from '../../contexts/SettingsContext';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import { CustomSwitch } from '../fields/CustomSwitch';
import CardLayout from '../icons/CardLayout';
import { Modal } from '../modals/common/Modal';
import { ModalPropsContext } from '../modals/common/types';
import { Justify } from '../utilities';
import { OnboardingStep } from './common';
import OnboardingStepContainer from './OnboardingStep';

const TOGGLE_ANIMATION_MS = 300;

function LayoutOnboarding(): ReactElement {
  const { insaneMode, toggleInsaneMode } = useContext(SettingsContext);
  const [isListMode, setIsListMode] = useState(insaneMode);
  const { onRequestClose } = useContext(ModalPropsContext);

  useEffect(() => {
    if (insaneMode === isListMode) {
      return;
    }

    setTimeout(() => {
      toggleInsaneMode();
    }, TOGGLE_ANIMATION_MS);
  }, [isListMode, insaneMode]);

  return (
    <Modal.StepsWrapper view={OnboardingStep.Layout}>
      {({ activeStepIndex, previousStep, nextStep }) => (
        <>
          <OnboardingStepContainer
            title="Cards or list?"
            description="Customize the look of your feed by choosing whether to view posts as cards or as a list."
            className={{
              container: 'items-center',
              content: classNames(
                'relative flex flex-col items-center w-4/5 pt-8 overflow-y-hidden',
                insaneMode && 'p-8',
              ),
            }}
          >
            <img
              className="absolute top-2 left-2"
              src={cloudinary.feedFilters.recommended}
              alt="Pointing at the recommended layout"
            />
            <CustomSwitch
              inputId="feed_layout"
              name="feed_layout"
              leftContent="Cards"
              rightContent="List"
              checked={isListMode}
              onToggle={() => setIsListMode(!isListMode)}
            />
            <CardLayout
              style={{ width: '100%', height: '100%' }}
              secondary={insaneMode}
            />
          </OnboardingStepContainer>
          <Modal.Footer justify={Justify.Between}>
            <Button
              className="btn-tertiary"
              onClick={activeStepIndex === 0 ? onRequestClose : previousStep}
            >
              {activeStepIndex === 0 ? 'Close' : 'Back'}
            </Button>
            <Button className="bg-theme-color-cabbage" onClick={nextStep}>
              Next
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal.StepsWrapper>
  );
}

export default LayoutOnboarding;
