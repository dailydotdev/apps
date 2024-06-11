import React, { ReactElement, useContext, useEffect, useState } from 'react';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetId, TargetType } from '../../lib/analytics';
import { useOnboardingChecklist } from '../../hooks';
import { ChecklistBarProps, ChecklistViewState } from '../../lib/checklist';
import { ChecklistBar } from './ChecklistBar';
import useContextMenu from '../../hooks/useContextMenu';
import { ContextMenu as ContextMenuIds } from '../../hooks/constants';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EyeCancelIcon, MenuIcon } from '../icons';
import ContextMenu from '../fields/ContextMenu';
import InteractivePopup, {
  InteractivePopupPosition,
} from '../tooltips/InteractivePopup';
import { OnboardingChecklistCard } from './OnboardingChecklistCard';
import { withExperiment } from '../withExperiment';
import { feature } from '../../lib/featureManagement';

export type OnboardingChecklistBarProps = Pick<ChecklistBarProps, 'className'>;

const OnboardingChecklistBarComponent = ({
  className,
}: OnboardingChecklistBarProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { steps, setChecklistView } = useOnboardingChecklist();
  const { onMenuClick: showOptionsMenu, isOpen: isOptionsOpen } =
    useContextMenu({
      id: ContextMenuIds.SidebarOnboardingChecklistCard,
    });
  const [isPopupOpen, setPopupOpen] = useState(false);

  const onRequestClose = () => {
    setPopupOpen(false);
  };

  useEffect(() => {
    // TODO AS-356 - add proper event tracking
    return;

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.OnboardingChecklist,
      target_id: TargetId.General,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          title="Get started like a pro"
          steps={steps}
        />
        <Button
          className="absolute right-2 top-2"
          icon={<MenuIcon className="text-text-primary" />}
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          onClick={(event) => {
            event.stopPropagation();

            showOptionsMenu(event);
          }}
        />
        <ContextMenu
          id={ContextMenuIds.SidebarOnboardingChecklistCard}
          className="menu-primary typo-callout"
          animation="fade"
          options={[
            {
              icon: <EyeCancelIcon />,
              label: 'Hide forever',
              action: () => {
                setChecklistView(ChecklistViewState.Hidden);
              },
            },
          ]}
          isOpen={isOptionsOpen}
        />
      </button>
      {isPopupOpen && (
        <InteractivePopup
          isDrawerOnMobile
          drawerProps={{
            displayCloseButton: true,
          }}
          position={InteractivePopupPosition.Center}
          className="flex w-full max-w-[21.5rem] justify-center rounded-none"
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
