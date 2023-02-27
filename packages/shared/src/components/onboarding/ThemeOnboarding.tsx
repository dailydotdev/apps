import React, { ReactElement, useContext } from 'react';
import SettingsContext, { themes } from '../../contexts/SettingsContext';
import { Button } from '../buttons/Button';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';
import ThemeWidget from '../widgets/ThemeWidget';
import Container from './OnboardingStep';
import { OnboardingStep } from './common';
import { ModalPropsContext } from '../modals/common/types';

function ThemeOnboarding(): ReactElement {
  const { themeMode, setTheme } = useContext(SettingsContext);
  const { onRequestClose } = useContext(ModalPropsContext);

  return (
    <Modal.StepsWrapper view={OnboardingStep.Theme}>
      {({ activeStepIndex, previousStep, nextStep }) => (
        <>
          <Container
            title="Your eyes don’t lie"
            description="daily.dev looks good in dark mode or in light mode, the choice is yours!"
            className={{ content: 'grid grid-cols-1 gap-6 mt-11 px-11' }}
          >
            {themes.map((theme) => (
              <ThemeWidget
                key={theme.label}
                option={theme}
                value={themeMode}
                onChange={setTheme}
                checked={theme.value === themeMode}
              />
            ))}
          </Container>
          <Modal.Footer justify={Justify.Between}>
            <Button
              className="btn-tertiary"
              onClick={activeStepIndex === 0 ? onRequestClose : previousStep}
            >
              {activeStepIndex === 1 ? 'Close' : 'Back'}
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

export default ThemeOnboarding;
