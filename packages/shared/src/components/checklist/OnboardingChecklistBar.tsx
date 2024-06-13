import React, { ReactElement, useContext, useState } from 'react';
import LogContext from '../../contexts/LogContext';
import { LogEvent, TargetId } from '../../lib/log';
import { useOnboardingChecklist } from '../../hooks';
import { ChecklistBarProps, ChecklistViewState } from '../../lib/checklist';
import { ChecklistBar } from './ChecklistBar';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { OnboardingChecklistCard } from './OnboardingChecklistCard';
import { withExperiment } from '../withExperiment';
import { feature } from '../../lib/featureManagement';
import { OnboardingChecklistOptions } from './OnboardingChecklistOptions';
import { OnboardingChecklistDismissButton } from './OnboardingChecklistDismissButton';

export type OnboardingChecklistBarProps = Pick<ChecklistBarProps, 'className'>;

const OnboardingChecklistBarComponent = ({
  className,
}: OnboardingChecklistBarProps): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const { steps, isDone, checklistView } = useOnboardingChecklist();
  const [isPopupOpen, setPopupOpen] = useState(false);

  const onRequestClose = () => {
    setPopupOpen(false);

    logEvent({
      event_name: LogEvent.ChecklistClose,
      target_id: TargetId.General,
    });
  };

  if (checklistView === ChecklistViewState.Hidden) {
    return null;
  }

  if (!steps.length) {
    return null;
  }

  return (
    <>
      <button
        className="relative w-full"
        type="button"
        onClick={(event) => {
          event.stopPropagation();

          setPopupOpen(true);
        }}
      >
        <ChecklistBar
          className={className}
          title={`Get started like a pro${isDone ? ' - Perfectly done!' : ''}`}
          steps={steps}
        />
        <div className="absolute right-2 top-2 tablet:right-5">
          {!isDone && <OnboardingChecklistOptions />}
          {isDone && <OnboardingChecklistDismissButton />}
        </div>
      </button>
      {isPopupOpen && (
        <InteractivePopup
          isDrawerOnMobile
          drawerProps={{
            displayCloseButton: true,
          }}
          position={InteractivePopupPosition.Center}
          className="flex w-full max-w-[21.5rem] justify-center rounded-none !bg-transparent"
          onClose={onRequestClose}
        >
          <OnboardingChecklistCard isOpen />
        </InteractivePopup>
      )}
    </>
  );
};

export const OnboardingChecklistBar = withExperiment(
  OnboardingChecklistBarComponent,
  {
    feature: feature.onboardingChecklist,
    value: true,
  },
);
