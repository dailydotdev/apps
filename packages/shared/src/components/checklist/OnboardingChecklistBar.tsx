import React, { ReactElement, useContext, useState } from 'react';

import LogContext from '../../contexts/LogContext';
import { useConditionalFeature, useOnboardingChecklist } from '../../hooks';
import { ChecklistBarProps, ChecklistViewState } from '../../lib/checklist';
import { feature } from '../../lib/featureManagement';
import { LogEvent, TargetId } from '../../lib/log';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { ChecklistBar } from './ChecklistBar';
import { OnboardingChecklistCard } from './OnboardingChecklistCard';
import { OnboardingChecklistDismissButton } from './OnboardingChecklistDismissButton';
import { OnboardingChecklistOptions } from './OnboardingChecklistOptions';

export type OnboardingChecklistBarProps = Pick<ChecklistBarProps, 'className'>;

export const OnboardingChecklistBar = ({
  className,
}: OnboardingChecklistBarProps): ReactElement => {
  const { logEvent } = useContext(LogContext);
  const { steps, isDone, checklistView } = useOnboardingChecklist();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const isHidden = checklistView === ChecklistViewState.Hidden;
  const { value: isFeatureEnabled } = useConditionalFeature({
    feature: feature.onboardingChecklist,
    shouldEvaluate: !isHidden,
  });

  const onRequestClose = () => {
    setPopupOpen(false);

    logEvent({
      event_name: LogEvent.ChecklistClose,
      target_id: TargetId.General,
    });
  };

  if (!isFeatureEnabled) {
    return null;
  }

  if (isHidden) {
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

          if (isDone) {
            return;
          }

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
          <OnboardingChecklistCard isOpen showProgressBar={false} />
        </InteractivePopup>
      )}
    </>
  );
};

export default OnboardingChecklistBar;
